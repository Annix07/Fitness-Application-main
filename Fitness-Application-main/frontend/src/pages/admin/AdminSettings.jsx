import { useState } from 'react';
import {
  IconCheck,
} from '../../components/common/Icons';
import AdminConfirmModal from './modals/AdminConfirmModal';

export default function AdminSettings({ onResetDefaults, onOpenMobileNav }) {
  const [settings, setSettings] = useState({
    platformName: 'MacroPace Biometrics & Fitness Portal',
    supportEmail: 'support@macropace.com',
    currency: 'INR (₹)',
    maintenanceMode: false,
    orderEmailAlerts: true,
    autoApproveReviews: true,
    twoFactorAuthEnforced: true,
  });

  const [toastMessage, setToastMessage] = useState('');
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setToastMessage('Platform configurations updated successfully!');
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleResetConfirm = () => {
    if (onResetDefaults) onResetDefaults();
    setResetConfirmOpen(false);
    setToastMessage('Demo admin database reset to defaults!');
    setTimeout(() => setToastMessage(''), 3000);
  };

  return (
    <div className="admin-tab-content">
      {toastMessage && (
        <div className="admin-toast-float">
          <IconCheck size={16} color="#16a34a" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="admin-page-header-row">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {onOpenMobileNav && (
            <button
              type="button"
              className="mobile-nav-toggle"
              onClick={onOpenMobileNav}
              aria-label="Open Navigation"
            >
              ☰
            </button>
          )}
          <div>
            <h2>System &amp; Portal Settings</h2>
            <p className="admin-header-subtitle">
              Configure global platform security, email routing, and demo database state.
            </p>
          </div>
        </div>
      </div>

      <div className="admin-settings-grid">
        {/* General Portal Form */}
        <div className="admin-panel-card">
          <div className="admin-panel-header">
            <h3>General Platform Information</h3>
          </div>

          <form onSubmit={handleSave} className="admin-settings-form">
            <div className="admin-form-group">
              <label>Platform Name</label>
              <input
                type="text"
                className="admin-form-input"
                value={settings.platformName}
                onChange={(e) => setSettings({ ...settings, platformName: e.target.value })}
              />
            </div>

            <div className="admin-form-row-2">
              <div className="admin-form-group">
                <label>System Support Email</label>
                <input
                  type="email"
                  className="admin-form-input"
                  value={settings.supportEmail}
                  onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                />
              </div>

              <div className="admin-form-group">
                <label>Store Currency</label>
                <select
                  className="admin-form-input"
                  value={settings.currency}
                  onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                >
                  <option value="USD ($)">USD ($)</option>
                  <option value="EUR (€)">EUR (€)</option>
                  <option value="GBP (£)">GBP (£)</option>
                  <option value="INR (₹)">INR (₹)</option>
                </select>
              </div>
            </div>

            <div className="admin-toggle-list">
              <div className="admin-toggle-row">
                <div>
                  <strong>Maintenance Mode</strong>
                  <p>Temporarily disables public store checkout and shows maintenance notice.</p>
                </div>
                <input
                  type="checkbox"
                  className="admin-switch"
                  checked={settings.maintenanceMode}
                  onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                />
              </div>

              <div className="admin-toggle-row">
                <div>
                  <strong>Order Dispatch Email Alerts</strong>
                  <p>Send instant email confirmations on checkout &amp; tracking status updates.</p>
                </div>
                <input
                  type="checkbox"
                  className="admin-switch"
                  checked={settings.orderEmailAlerts}
                  onChange={(e) => setSettings({ ...settings, orderEmailAlerts: e.target.checked })}
                />
              </div>

              <div className="admin-toggle-row">
                <div>
                  <strong>Enforce 2FA for Admin Accounts</strong>
                  <p>Require two-factor verification on admin role sign-ins.</p>
                </div>
                <input
                  type="checkbox"
                  className="admin-switch"
                  checked={settings.twoFactorAuthEnforced}
                  onChange={(e) => setSettings({ ...settings, twoFactorAuthEnforced: e.target.checked })}
                />
              </div>
            </div>

            <div className="admin-settings-submit-box">
              <button type="submit" className="btn-admin-primary">
                Save Platform Settings
              </button>
            </div>
          </form>
        </div>

        {/* Database & Security Operations */}
        <div className="admin-panel-card">
          <div className="admin-panel-header">
            <h3>Database &amp; Maintenance Operations</h3>
          </div>

          <div className="admin-danger-zone">
            <div className="danger-zone-item">
              <div>
                <strong>Reset Demo Database</strong>
                <p>Restore default sample users, store inventory, and seed orders.</p>
              </div>
              <button
                type="button"
                className="btn-admin-danger"
                onClick={() => setResetConfirmOpen(true)}
              >
                Reset Database
              </button>
            </div>

            <div className="danger-zone-item">
              <div>
                <strong>System Health &amp; Telemetry</strong>
                <p>All microservices operational · 99.98% Uptime · SSL active</p>
              </div>
              <span className="admin-status-badge active">Healthy</span>
            </div>
          </div>
        </div>
      </div>

      {/* CONFIRM RESET MODAL */}
      <AdminConfirmModal
        isOpen={resetConfirmOpen}
        title="Reset Demo Database"
        message="Are you sure you want to reset all admin users, products, and order states back to factory sample defaults? Current custom entries will be overwritten."
        confirmText="Reset to Defaults"
        confirmVariant="warning"
        onConfirm={handleResetConfirm}
        onCancel={() => setResetConfirmOpen(false)}
      />
    </div>
  );
}
