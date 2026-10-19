import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthModalContext = createContext(null);

const TOKEN_KEY = 'macropace_auth_token';
const SESSION_USER_KEY = 'macropace_session_user';

export function AuthModalProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState('login'); // 'login' | 'signup'

  const [user, setUser] = useState(() => {
    try {
      const saved = sessionStorage.getItem(SESSION_USER_KEY) || localStorage.getItem(SESSION_USER_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin';

  // Check token validity on mount
  useEffect(() => {
    const checkSession = async () => {
      const token = localStorage.getItem(TOKEN_KEY);
      if (token && !user) {
        try {
          const res = await api.get('/auth/me');
          if (res.success && res.user) {
            setUser(res.user);
            sessionStorage.setItem(SESSION_USER_KEY, JSON.stringify(res.user));
          }
        } catch {
          logoutUser();
        }
      }
    };
    checkSession();
  }, []);

  const openModal = (initialMode = 'login') => {
    setMode(initialMode);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  const switchMode = (newMode) => {
    setMode(newMode);
  };

  const authenticateUser = async ({ mode: authMode, userId, password, name }) => {
    try {
      const endpoint = authMode === 'signup' ? '/auth/register' : '/auth/login';
      const payload =
        authMode === 'signup'
          ? { name, email: userId, password }
          : { userId, password };

      const res = await api.post(endpoint, payload);

      if (res.success && res.user) {
        if (res.token) {
          localStorage.setItem(TOKEN_KEY, res.token);
        }
        setUser(res.user);
        sessionStorage.setItem(SESSION_USER_KEY, JSON.stringify(res.user));
        closeModal();
        return { success: true, user: res.user };
      }

      return { success: false, error: res.error || 'Authentication failed.' };
    } catch (err) {
      return { success: false, error: err.message || 'Server connection failed.' };
    }
  };

  const updateUserProfile = async (updates) => {
    try {
      const fullName = `${updates.firstName || ''} ${updates.lastName || ''}`.trim() || updates.name;
      if (fullName) {
        const res = await api.put('/auth/profile', { name: fullName });
        if (res.success && res.user) {
          const merged = { ...res.user, ...updates };
          setUser(merged);
          sessionStorage.setItem(SESSION_USER_KEY, JSON.stringify(merged));
          return { success: true, user: merged };
        }
      }
      setUser((prev) => {
        const updated = { ...prev, ...updates };
        sessionStorage.setItem(SESSION_USER_KEY, JSON.stringify(updated));
        return updated;
      });
      return { success: true };
    } catch (err) {
      console.error('Failed to update profile on backend:', err);
      return { success: false, error: err.message };
    }
  };

  const changePassword = async ({ currentPassword, newPassword }) => {
    try {
      const res = await api.post('/auth/change-password', { currentPassword, newPassword });
      return res;
    } catch (err) {
      return { success: false, error: err.message || 'Failed to change password.' };
    }
  };

  const logoutUser = () => {
    setUser(null);
    try {
      localStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem(SESSION_USER_KEY);
      localStorage.removeItem(SESSION_USER_KEY);
    } catch {}
  };

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        closeModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <AuthModalContext.Provider
      value={{
        isOpen,
        mode,
        user,
        isAuthenticated,
        isAdmin,
        openModal,
        closeModal,
        switchMode,
        authenticateUser,
        updateUserProfile,
        changePassword,
        logoutUser,
      }}
    >
      {children}
    </AuthModalContext.Provider>
  );
}

export function useAuthModal() {
  const context = useContext(AuthModalContext);
  if (!context) {
    throw new Error('useAuthModal must be used within an AuthModalProvider');
  }
  return context;
}
