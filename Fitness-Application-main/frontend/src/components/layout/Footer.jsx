import { Link } from 'react-router-dom';
import '../../styles/Footer.css';

const footerLinks = {
  Product: [
    { label: 'Dashboard',        href: '/dashboard' },
    { label: 'Diet Tracker',     href: '/diet' },
    { label: 'Workout Planner',  href: '/workout' },
    { label: 'Health Assessment',href: '/health-assessment' },
    { label: 'Analytics',        href: '/dashboard' },
    { label: 'Store',            href: '/store' },
  ],
  Company: [
    { label: 'About Us',    href: '/about' },
    { label: 'Contact Us',  href: '/contact' },
    { label: 'Blog',        href: '#' },
    { label: 'Careers',     href: '#' },
  ],
  Support: [
    { label: 'Help Center',      href: '#' },
    { label: 'Privacy Policy',   href: '#' },
    { label: 'Terms of Service', href: '#' },
    { label: 'Cookie Policy',    href: '#' },
  ],
};

const socials = [
  { icon: '𝕏', label: 'X (Twitter)', href: '#' },
  { icon: 'in', label: 'LinkedIn',    href: '#' },
  { icon: 'ig', label: 'Instagram',   href: '#' },
  { icon: 'yt', label: 'YouTube',     href: '#' },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          {/* Brand */}
          <div className="footer-brand">
            <Link to="/" className="navbar-logo">
              <div className="logo-icon">MP</div>
              <span className="logo-text font-display">
                Macro<span>Pace</span>
              </span>
            </Link>
            <p>
              Your all-in-one health &amp; fitness companion. Track nutrition, crush workouts,
              and unlock your best self — backed by science and built for real people.
            </p>
            <div className="footer-socials">
              {socials.map(({ icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  className="social-icon"
                  aria-label={label}
                  title={label}
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div className="footer-col" key={title}>
              <h4>{title}</h4>
              <ul>
                {links.map(({ label, href }) => (
                  <li key={label}>
                    <Link to={href}>{label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <p>
            © {year} <a href="/">MacroPace</a>. All rights reserved. Built for your health and performance journey.
          </p>
          <div className="footer-bottom-links">
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
            <a href="#">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
