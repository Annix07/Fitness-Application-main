import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthModal } from '../../context/AuthModalContext';
import '../../styles/AuthModal.css';

/* ─── Minimal SVG Icons ─── */
const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const EyeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
    <line x1="2" y1="2" x2="22" y2="22" />
  </svg>
);

export default function AuthModal() {
  const { isOpen, mode, closeModal, switchMode, authenticateUser } = useAuthModal();
  const navigate = useNavigate();

  // Form states
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Feedback states
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (mode === 'signup' && !name.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!userId.trim() || !password.trim()) {
      setErrorMsg('Please enter both ID/Email and password.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const result = await authenticateUser({ mode, userId, password, name });
      setLoading(false);

      if (result.success) {
        if (result.user?.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      } else {
        setErrorMsg(result.error || 'Authentication failed. Please check your credentials.');
      }
    } catch (err) {
      setLoading(false);
      setErrorMsg(err.message || 'Authentication error.');
    }
  };

  const toggleAuthMode = (targetMode) => {
    setErrorMsg('');
    switchMode(targetMode);
  };

  return (
    <div className="auth-backdrop" onClick={closeModal}>
      <div
        className="auth-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Close Button */}
        <button
          className="auth-close-btn"
          onClick={closeModal}
          aria-label="Close modal"
        >
          <CloseIcon />
        </button>

        {/* Logo & Header */}
        <div className="auth-header">
          <div className="auth-logo-badge">
            <span>MP</span>
          </div>
          <h2>{mode === 'login' ? 'Sign In to MacroPace' : 'Create Account'}</h2>
          <p>
            {mode === 'login'
              ? 'Enter your ID and password to access your dashboard'
              : 'Enter your details to get started with MacroPace'}
          </p>
        </div>

        {/* Alerts */}
        {errorMsg && <div className="auth-alert auth-alert--error">{errorMsg}</div>}

        {/* Form */}
        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <div className="auth-field">
              <label htmlFor="auth-name">Full Name</label>
              <input
                id="auth-name"
                type="text"
                placeholder="Alex Morgan"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}

          <div className="auth-field">
            <label htmlFor="auth-id">User ID or Email</label>
            <input
              id="auth-id"
              type="text"
              placeholder="alex@macropace.com or alex_fit"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              autoComplete="username"
              required
            />
          </div>

          <div className="auth-field">
            <div className="auth-field-row">
              <label htmlFor="auth-password">Password</label>
              {mode === 'login' && (
                <button
                  type="button"
                  className="auth-forgot-btn"
                  onClick={() => setErrorMsg('Password reset instructions sent to your email.')}
                >
                  Forgot Password?
                </button>
              )}
            </div>
            <div className="auth-input-wrapper">
              <input
                id="auth-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                required
              />
              <button
                type="button"
                className="auth-eye-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary auth-submit-btn"
            disabled={loading}
          >
            {loading ? (
              <span className="auth-spinner" />
            ) : mode === 'login' ? (
              'Sign In'
            ) : (
              'Sign Up'
            )}
          </button>
        </form>

        {/* Footer Sign up / Sign in link */}
        <div className="auth-footer">
          {mode === 'login' ? (
            <p>
              Don&apos;t have an account?{' '}
              <button
                type="button"
                className="auth-switch-btn"
                onClick={() => toggleAuthMode('signup')}
              >
                Sign Up
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button
                type="button"
                className="auth-switch-btn"
                onClick={() => toggleAuthMode('login')}
              >
                Sign In
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
