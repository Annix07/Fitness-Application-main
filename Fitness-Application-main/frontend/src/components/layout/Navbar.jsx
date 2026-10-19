import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthModal } from '../../context/AuthModalContext';
import { useCart } from '../../context/CartContext';
import { IconShoppingBag } from '../common/Icons';
import '../../styles/Navbar.css';
import userIcon from '../../assets/user-icon.png';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { openModal, isAuthenticated, user } = useAuthModal();
  const { cartCount, setIsCartOpen } = useCart();

  const navLinks = [
    { label: 'Home', href: '/' },
    ...(isAuthenticated ? [
      ...(user?.role === 'admin'
        ? [{ label: 'Admin Portal', href: '/admin' }]
        : [{ label: 'Dashboard', href: '/dashboard' }]),
    ] : []),
    { label: 'Store', href: '/store' },
    { label: 'About Us', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ];

  /* Detect scroll */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* Close menu on route change */
  useEffect(() => { setMenuOpen(false); }, [pathname]);

  /* Lock body scroll when menu is open */
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const handleNavClick = (e, href) => {
    if (href.startsWith('#')) {
      e.preventDefault();
      setMenuOpen(false);
      if (pathname !== '/') {
        navigate('/');
        setTimeout(() => {
          document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      setMenuOpen(false);
    }
  };

  const handleUserClick = () => {
    if (isAuthenticated) {
      if (user?.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } else {
      openModal('login');
    }
  };

  const isDashboardRoute = [
    '/dashboard',
    '/diet',
    '/workout',
    '/health-assessment',
    '/settings',
    '/admin',
  ].some((r) => pathname.startsWith(r));

  const isLight = pathname !== '/';

  return (
    <header
      className={`navbar ${isLight ? 'navbar--light' : ''} ${
        isDashboardRoute ? 'navbar--dashboard' : ''
      } ${scrolled ? 'scrolled' : ''}`}
    >
      <div className={isDashboardRoute ? 'navbar-dashboard-inner' : 'container'} style={{ position: 'relative' }}>
        <nav className="navbar-inner">
          {/* Logo (hidden in dashboard mode because sidebar has the main logo) */}
          {!isDashboardRoute ? (
            <Link to="/" className="navbar-logo">
              <div className="logo-icon">MP</div>
              <span className="logo-text font-display">
                Macro<span>Pace</span>
              </span>
            </Link>
          ) : (
            <div className="navbar-breadcrumb">
              <span className="breadcrumb-root">Portal</span>
              <span className="breadcrumb-sep">/</span>
              <span className="breadcrumb-current">
                {pathname === '/diet'
                  ? 'Diet Tracker'
                  : pathname === '/workout'
                  ? 'Workout Logger'
                  : pathname === '/health-assessment'
                  ? 'Health Assessment'
                  : pathname === '/settings'
                  ? 'Settings'
                  : pathname.startsWith('/admin')
                  ? 'Admin Portal'
                  : 'Dashboard'}
              </span>
            </div>
          )}

          {/* Desktop Links */}
          <ul className="navbar-links">
            {navLinks.map(({ label, href }) => {
              const isAnchor = href.startsWith('#');
              const isActive = !isAnchor && pathname === href;

              return (
                <li key={label}>
                  {isAnchor ? (
                    <a
                      href={href}
                      onClick={(e) => handleNavClick(e, href)}
                    >
                      {label}
                    </a>
                  ) : (
                    <Link
                      to={href}
                      className={isActive ? 'active' : ''}
                      onClick={(e) => handleNavClick(e, href)}
                    >
                      {label}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>

          {/* Desktop Actions */}
          <div className="navbar-actions" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Cart Icon Button - ONLY visible for customer users when they have added items to cart */}
            {cartCount > 0 && user?.role !== 'admin' && (
              <button
                type="button"
                className="navbar-user-btn"
                onClick={() => setIsCartOpen(true)}
                aria-label="View Shopping Cart"
                title="Shopping Cart"
                style={{ position: 'relative', color: '#0284c7' }}
              >
                <IconShoppingBag size={20} />
                <span
                  style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
                    background: '#0284c7',
                    color: '#ffffff',
                    fontSize: '0.65rem',
                    fontWeight: 900,
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid #ffffff',
                  }}
                >
                  {cartCount}
                </span>
              </button>
            )}

            <button
              type="button"
              className="navbar-user-btn"
              onClick={handleUserClick}
              aria-label={isAuthenticated ? 'Dashboard' : 'Sign In'}
              title={isAuthenticated ? 'Open Dashboard' : 'Sign In'}
            >
              <img src={userIcon} alt="User" className="navbar-user-icon" />
            </button>
          </div>

          {/* Hamburger */}
          <button
            className={`hamburger ${menuOpen ? 'open' : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle navigation menu"
            aria-expanded={menuOpen}
          >
            <span className="hamburger-bar" />
            <span className="hamburger-bar" />
            <span className="hamburger-bar" />
          </button>
        </nav>

        {/* Mobile Menu */}
        <div className={`mobile-menu ${menuOpen ? 'open' : ''}`} role="navigation">
          <ul>
            {navLinks.map(({ label, href }) => {
              const isAnchor = href.startsWith('#');
              const isActive = !isAnchor && pathname === href;

              return (
                <li key={label}>
                  {isAnchor ? (
                    <a
                      href={href}
                      onClick={(e) => handleNavClick(e, href)}
                    >
                      {label}
                    </a>
                  ) : (
                    <Link
                      to={href}
                      className={isActive ? 'active' : ''}
                      onClick={(e) => handleNavClick(e, href)}
                    >
                      {label}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
          <div className="mobile-menu-actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                setMenuOpen(false);
                handleUserClick();
              }}
            >
              <img src={userIcon} alt="User" className="navbar-user-icon" style={{ width: '18px', height: '18px' }} />
              <span>{isAuthenticated ? 'Open Dashboard' : 'Sign Up / Log In'}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

