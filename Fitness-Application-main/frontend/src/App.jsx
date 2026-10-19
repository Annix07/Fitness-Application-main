import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import HomePage from './pages/public/HomePage';
import AboutPage from './pages/public/AboutPage';
import ContactPage from './pages/public/ContactPage';
import StorePage from './pages/public/StorePage';
import CheckoutPage from './pages/public/CheckoutPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import DietPage from './pages/dashboard/DietPage';
import WorkoutPage from './pages/dashboard/WorkoutPage';
import HealthAssessmentPage from './pages/dashboard/HealthAssessmentPage';
import SettingsPage from './pages/dashboard/SettingsPage';
import AdminPortal from './pages/admin/AdminPortal';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { AuthModalProvider } from './context/AuthModalContext';
import { HealthProfileProvider } from './context/HealthProfileContext';
import { CartProvider } from './context/CartContext';
import AuthModal from './components/auth/AuthModal';

function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '16px',
      textAlign: 'center',
      padding: '24px',
    }}>
      <div style={{ fontSize: '5rem' }}>404</div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800 }}>
        Page Not Found
      </h1>
      <p style={{ color: 'var(--clr-text-2)', maxWidth: '400px' }}>
        The page you&apos;re looking for doesn&apos;t exist yet. More pages are coming soon!
      </p>
      <a href="/" className="btn btn-primary" style={{ marginTop: '8px' }}>
        ← Back to Home
      </a>
    </div>
  );
}

function AppContent() {
  const { pathname } = useLocation();
  const isDashboardRoute = [
    '/dashboard',
    '/diet',
    '/workout',
    '/health-assessment',
    '/settings',
    '/admin',
  ].some((route) => pathname.startsWith(route));

  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/store" element={<StorePage />} />
        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <CheckoutPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/diet"
          element={
            <ProtectedRoute>
              <DietPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/workout"
          element={
            <ProtectedRoute>
              <WorkoutPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/health-assessment"
          element={
            <ProtectedRoute>
              <HealthAssessmentPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />

        {/* Enterprise Admin Portal Route */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminPortal />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute>
              <AdminPortal />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>

      {!isDashboardRoute && <Footer />}
      <AuthModal />
    </>
  );
}

export default function App() {
  return (
    <AuthModalProvider>
      <HealthProfileProvider>
        <CartProvider>
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </CartProvider>
      </HealthProfileProvider>
    </AuthModalProvider>
  );
}
