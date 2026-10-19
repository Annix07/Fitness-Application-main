import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthModal } from '../../context/AuthModalContext';
import {
  IconDashboard,
  IconUtensils,
  IconWorkout,
  IconHealth,
  IconSettings,
  IconShield,
  IconLogout,
  IconUser,
  IconShoppingBag,
  IconReceipt,
  IconBarChart,
} from '../common/Icons';
import '../../styles/Sidebar.css';

const USER_NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: IconDashboard, path: '/dashboard' },
  { id: 'diet', label: 'Diet Tracker', icon: IconUtensils, path: '/diet' },
  { id: 'workout', label: 'Workout Logger', icon: IconWorkout, path: '/workout' },
  { id: 'health-assessment', label: 'Health Assessment', icon: IconHealth, path: '/health-assessment' },
  { id: 'settings', label: 'Settings', icon: IconSettings, path: '/settings' },
];

const ADMIN_NAV_ITEMS = [
  { id: 'admin-dashboard', label: 'Admin Dashboard', icon: IconDashboard, path: '/admin?tab=dashboard', tabKey: 'dashboard' },
  { id: 'admin-users', label: 'Users Directory', icon: IconUser, path: '/admin?tab=users', tabKey: 'users' },
  { id: 'admin-products', label: 'Product Inventory', icon: IconShoppingBag, path: '/admin?tab=products', tabKey: 'products' },
  { id: 'admin-orders', label: 'Store Orders', icon: IconReceipt, path: '/admin?tab=orders', tabKey: 'orders' },
  { id: 'admin-reports', label: 'Analytics Reports', icon: IconBarChart, path: '/admin?tab=reports', tabKey: 'reports' },
  { id: 'admin-settings', label: 'System Settings', icon: IconSettings, path: '/admin?tab=settings', tabKey: 'settings' },
];

export default function Sidebar({ mobileOpen, setMobileOpen }) {
  const location = useLocation();
  const pathname = location.pathname;
  const searchParams = new URLSearchParams(location.search);
  const activeAdminTab = searchParams.get('tab') || 'dashboard';
  const navigate = useNavigate();
  const { user, logoutUser } = useAuthModal();

  const handleLogout = () => {
    logoutUser();
    navigate('/');
  };

  const getInitials = (name) => {
    if (name && name.trim()) {
      const parts = name.trim().split(' ');
      if (parts.length > 1) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      }
      return name.slice(0, 2).toUpperCase();
    }
    if (user?.email) {
      return user.email.slice(0, 2).toUpperCase();
    }
    return 'MP';
  };

  const isAdmin = user?.role === 'admin' || pathname.startsWith('/admin');

  return (
    <>
      {/* Mobile Backdrop */}
      <div
        className={`sidebar-mobile-backdrop ${mobileOpen ? 'open' : ''}`}
        onClick={() => setMobileOpen && setMobileOpen(false)}
        aria-hidden="true"
      />

      <aside className={`dashboard-sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
        <div>
          {/* Brand Header */}
          <div className="sidebar-header">
            <Link
              to={isAdmin ? '/admin' : '/dashboard'}
              className="sidebar-brand-badge"
              title={isAdmin ? 'MacroPace Admin Portal' : 'MacroPace Dashboard'}
            >
              <div className="sidebar-logo-icon">MP</div>
              <span className="sidebar-brand-text">
                Macro<span>Pace</span>
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="sidebar-menu">
            {isAdmin ? (
              /* Admin Portal Navigation Only */
              <>
                <div className="sidebar-section-tag">Admin Portal</div>
                {ADMIN_NAV_ITEMS.map((item) => {
                  const isActive = pathname.startsWith('/admin') && activeAdminTab === item.tabKey;
                  const IconComp = item.icon;

                  return (
                    <Link
                      key={item.id}
                      to={item.path}
                      className={`sidebar-link ${isActive ? 'active' : ''}`}
                      onClick={() => setMobileOpen && setMobileOpen(false)}
                    >
                      <span className="link-icon">
                        <IconComp size={18} />
                      </span>
                      <span className="link-label">{item.label}</span>
                    </Link>
                  );
                })}
              </>
            ) : (
              /* Fitness Tracker Navigation Only for regular users */
              <>
                <div className="sidebar-section-tag">Fitness Tracker</div>
                {USER_NAV_ITEMS.map((item) => {
                  const isActive = pathname === item.path;
                  const IconComp = item.icon;

                  return (
                    <Link
                      key={item.id}
                      to={item.path}
                      className={`sidebar-link ${isActive ? 'active' : ''}`}
                      onClick={() => setMobileOpen && setMobileOpen(false)}
                    >
                      <span className="link-icon">
                        <IconComp size={18} />
                      </span>
                      <span className="link-label">{item.label}</span>
                    </Link>
                  );
                })}
              </>
            )}
          </nav>
        </div>

        {/* User Footer & Logout Option */}
        <div className="sidebar-footer">
          <div className="sidebar-user-preview">
            <div className="sidebar-user-avatar">
              {getInitials(user?.name)}
            </div>
            <div className="sidebar-user-details">
              <div className="sidebar-user-name" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>{user?.name || (user?.email ? user.email.split('@')[0] : 'User')}</span>
                {user?.role === 'admin' && (
                  <span style={{
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    padding: '1px 6px',
                    borderRadius: '4px',
                    background: '#ea580c',
                    color: '#ffffff',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}>
                    Admin
                  </span>
                )}
              </div>
              <div className="sidebar-user-email">{user?.email || ''}</div>
            </div>
          </div>

          <button
            type="button"
            className="sidebar-logout-btn"
            onClick={handleLogout}
            title="Log Out"
          >
            <IconLogout size={16} />
            <span>Log Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
