import { useState, useEffect } from 'react';
import Sidebar from '../../components/dashboard/Sidebar';
import { useAuthModal } from '../../context/AuthModalContext';
import { ORDER_STATUSES } from '../../data/orderHistoryData';
import api from '../../services/api';
import {
  IconSettings,
  IconUser,
  IconLock,
  IconKey,
  IconEye,
  IconEyeOff,
  IconShoppingBag,
  IconPackage,
  IconReceipt,
  IconCheck,
  IconMail,
} from '../../components/common/Icons';
import '../../styles/SettingsPage.css';

export default function SettingsPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'profile' | 'security' | 'orders'
  const { user, updateUserProfile, changePassword } = useAuthModal();

  // Helper to extract first & last names from user name or email
  const parseNameParts = (u) => {
    if (!u) return { fName: '', lName: '', uName: '', emailVal: '' };
    const nameStr = (u.name || '').trim();
    const parts = nameStr.split(' ');
    const fName = u.firstName || parts[0] || (u.email ? u.email.split('@')[0] : '');
    const lName = u.lastName || (parts.length > 1 ? parts.slice(1).join(' ') : '');
    const uName = u.username || (u.email ? u.email.split('@')[0] : '');
    return { fName, lName, uName, emailVal: u.email || '' };
  };

  const initial = parseNameParts(user);

  // Profile Form State
  const [firstName, setFirstName] = useState(initial.fName);
  const [lastName, setLastName] = useState(initial.lName);
  const [username, setUsername] = useState(initial.uName);
  const [email, setEmail] = useState(initial.emailVal);
  const [profileSaving, setProfileSaving] = useState(false);

  // Synchronize when user logs in or loads asynchronously
  useEffect(() => {
    if (user) {
      const parsed = parseNameParts(user);
      setFirstName(parsed.fName);
      setLastName(parsed.lName);
      setUsername(parsed.uName);
      setEmail(parsed.emailVal);
    }
  }, [user]);

  // Password Security Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);

  // Store Order History State
  const [orderHistory, setOrderHistory] = useState([]);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  // Fetch real order history from database for the logged-in user
  useEffect(() => {
    const fetchUserOrders = async () => {
      try {
        const res = await api.get('/store/orders');
        if (res.success && Array.isArray(res.orders)) {
          setOrderHistory(res.orders);
        }
      } catch (err) {
        console.error('Error fetching user orders:', err);
      }
    };
    if (user) {
      fetchUserOrders();
    }
  }, [user]);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState('');

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 4000);
  };

  // Profile Save Handler
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!firstName.trim()) {
      triggerToast('Please fill in your name.');
      return;
    }

    setProfileSaving(true);
    const res = await updateUserProfile({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      username: username.trim().toLowerCase().replace(/\s+/g, '_'),
      name: `${firstName.trim()} ${lastName.trim()}`.trim(),
    });
    setProfileSaving(false);

    if (res?.success) {
      triggerToast('Profile updated successfully! Username and name are synchronized.');
    } else {
      triggerToast(res?.error || 'Failed to update profile.');
    }
  };

  // Calculate Password Strength (0-3)
  const calculatePasswordStrength = (pwd) => {
    if (!pwd) return 0;
    let score = 0;
    if (pwd.length >= 6) score += 1;
    if (pwd.length >= 10 && /[A-Z]/.test(pwd) && /[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;
    return score;
  };

  const pwdStrength = calculatePasswordStrength(newPassword);

  // Password Change Handler
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');

    if (!currentPassword) {
      setPasswordError('Please enter your current password.');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match. Please verify.');
      return;
    }

    setPasswordSaving(true);
    const res = await changePassword({ currentPassword, newPassword });
    setPasswordSaving(false);

    if (res?.success) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      triggerToast('Password updated successfully! Your account is secure.');
    } else {
      setPasswordError(res?.error || 'Failed to update password.');
    }
  };

  const getInitials = () => {
    if (firstName && lastName) return `${firstName[0].toUpperCase()}${lastName[0].toUpperCase()}`;
    if (firstName) return firstName.slice(0, 2).toUpperCase();
    if (email) return email.slice(0, 2).toUpperCase();
    return 'MP';
  };

  const totalSpent = orderHistory.reduce((sum, ord) => sum + (Number(ord.totalAmount) || Number(ord.total) || 0), 0).toFixed(2);

  return (
    <div className="settings-page-container">
      {/* Full-Height Dark Sidebar */}
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      <main className="settings-content">
        {/* Page Header */}
        <header className="settings-header">
          <div className="settings-header-left">
            <h1>Account &amp; Store Settings</h1>
            <p>Manage your personal profile, login credentials, security, and store order history</p>
          </div>

          {/* Tab Filter */}
          <div className="settings-tab-bar">
            <button
              type="button"
              className={`settings-tab-btn ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              <IconSettings size={15} />
              <span>All Settings</span>
            </button>
            <button
              type="button"
              className={`settings-tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <IconUser size={15} />
              <span>Profile Info</span>
            </button>
            <button
              type="button"
              className={`settings-tab-btn ${activeTab === 'security' ? 'active' : ''}`}
              onClick={() => setActiveTab('security')}
            >
              <IconLock size={15} />
              <span>Password &amp; Security</span>
            </button>
            <button
              type="button"
              className={`settings-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveTab('orders')}
            >
              <IconShoppingBag size={15} />
              <span>Store Orders ({orderHistory.length})</span>
            </button>
          </div>
        </header>

        <div className="settings-grid">
          {/* ──────────────────────────────────────────────────────────
              SECTION 1: PERSONAL PROFILE & USERNAME
             ────────────────────────────────────────────────────────── */}
          {(activeTab === 'all' || activeTab === 'profile') && (
            <section className="settings-card">
              <div className="settings-card-header">
                <div className="settings-card-title">
                  <IconUser size={20} color="#0284c7" />
                  <div>
                    <h2>Personal Profile &amp; Login Handle</h2>
                    <p>Update your first name, last name, and the username used to sign in to MacroPace</p>
                  </div>
                </div>
              </div>

              {/* Profile Avatar Badge */}
              <div className="profile-avatar-row">
                <div className="profile-avatar-badge">{getInitials()}</div>
                <div className="profile-avatar-info">
                  <h3>{firstName} {lastName}</h3>
                  <p>@{username} · Member since 2026</p>
                </div>
              </div>

              <form onSubmit={handleSaveProfile} className="settings-profile-form">
                <div className="settings-form-row">
                  {/* First Name */}
                  <div className="settings-field-group">
                    <label htmlFor="input-first-name">First Name</label>
                    <div className="settings-input-wrapper">
                      <input
                        id="input-first-name"
                        type="text"
                        placeholder="First Name (e.g. Alex)"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {/* Last Name */}
                  <div className="settings-field-group">
                    <label htmlFor="input-last-name">Last Name</label>
                    <div className="settings-input-wrapper">
                      <input
                        id="input-last-name"
                        type="text"
                        placeholder="Last Name (e.g. Morgan)"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="settings-form-row" style={{ marginTop: '16px' }}>
                  {/* Username */}
                  <div className="settings-field-group">
                    <label htmlFor="input-username">
                      Username (Login Handle)
                      <span className="label-hint">Can be changed anytime</span>
                    </label>
                    <div className="settings-input-wrapper has-prefix-text">
                      <span className="input-prefix-text">@</span>
                      <input
                        id="input-username"
                        type="text"
                        placeholder="your_username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, '_'))}
                        required
                      />
                    </div>
                  </div>

                  {/* Primary Email */}
                  <div className="settings-field-group">
                    <label htmlFor="input-email">
                      Primary Email
                      <span className="label-hint">Verified Account</span>
                    </label>
                    <div className="settings-input-wrapper has-icon">
                      <span className="input-prefix-icon">
                        <IconMail size={16} />
                      </span>
                      <input
                        id="input-email"
                        type="email"
                        value={email}
                        disabled
                      />
                    </div>
                  </div>
                </div>

                <div className="settings-card-actions">
                  <button
                    type="submit"
                    className="btn-settings-primary"
                    disabled={profileSaving}
                  >
                    <IconCheck size={16} />
                    <span>{profileSaving ? 'Saving Changes...' : 'Save Profile Changes'}</span>
                  </button>
                </div>
              </form>
            </section>
          )}

          {/* ──────────────────────────────────────────────────────────
              SECTION 2: SECURITY & PASSWORD CHANGE
             ────────────────────────────────────────────────────────── */}
          {(activeTab === 'all' || activeTab === 'security') && (
            <section className="settings-card">
              <div className="settings-card-header">
                <div className="settings-card-title">
                  <IconLock size={20} color="#0284c7" />
                  <div>
                    <h2>Password &amp; Security</h2>
                    <p>Change your password to keep your MacroPace account secure</p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleChangePassword} className="settings-security-form">
                {passwordError && (
                  <div style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    color: '#dc2626',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    marginBottom: '14px',
                  }}>
                    {passwordError}
                  </div>
                )}

                <div className="settings-form-row">
                  {/* Current Password */}
                  <div className="settings-field-group">
                    <label htmlFor="input-current-pwd">Current Password</label>
                    <div className="settings-input-wrapper">
                      <input
                        id="input-current-pwd"
                        type={showCurrentPassword ? 'text' : 'password'}
                        placeholder="Enter current password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        className="btn-toggle-eye"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        title={showCurrentPassword ? 'Hide password' : 'Show password'}
                        aria-label="Toggle current password visibility"
                      >
                        {showCurrentPassword ? <IconEyeOff size={16} /> : <IconEye size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div className="settings-field-group">
                    <label htmlFor="input-new-pwd">
                      New Password
                      <span className="label-hint">Min. 6 characters</span>
                    </label>
                    <div className="settings-input-wrapper">
                      <input
                        id="input-new-pwd"
                        type={showNewPassword ? 'text' : 'password'}
                        placeholder="Enter new strong password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        className="btn-toggle-eye"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        title={showNewPassword ? 'Hide password' : 'Show password'}
                        aria-label="Toggle new password visibility"
                      >
                        {showNewPassword ? <IconEyeOff size={16} /> : <IconEye size={16} />}
                      </button>
                    </div>

                    {/* Password Strength Meter */}
                    {newPassword && (
                      <div className="pwd-strength-container">
                        <div className="pwd-strength-bars">
                          <div
                            className="pwd-bar"
                            style={{
                              background: pwdStrength >= 1 ? '#ef4444' : '#e2e8f0',
                            }}
                          />
                          <div
                            className="pwd-bar"
                            style={{
                              background: pwdStrength >= 2 ? '#f59e0b' : '#e2e8f0',
                            }}
                          />
                          <div
                            className="pwd-bar"
                            style={{
                              background: pwdStrength >= 3 ? '#10b981' : '#e2e8f0',
                            }}
                          />
                        </div>
                        <div className="pwd-strength-label">
                          <span>Password Strength</span>
                          <span style={{
                            color: pwdStrength === 3 ? '#10b981' : pwdStrength === 2 ? '#f59e0b' : '#ef4444',
                          }}>
                            {pwdStrength === 3 ? 'Strong' : pwdStrength === 2 ? 'Medium' : 'Weak'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="settings-form-row" style={{ marginTop: '16px' }}>
                  {/* Confirm New Password */}
                  <div className="settings-field-group">
                    <label htmlFor="input-confirm-pwd">Confirm New Password</label>
                    <div className="settings-input-wrapper">
                      <input
                        id="input-confirm-pwd"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Re-type new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        className="btn-toggle-eye"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        title={showConfirmPassword ? 'Hide password' : 'Show password'}
                        aria-label="Toggle confirm password visibility"
                      >
                        {showConfirmPassword ? <IconEyeOff size={16} /> : <IconEye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="settings-field-group" style={{ justifyContent: 'center' }}>
                    <div style={{
                      fontSize: '0.8rem',
                      color: '#64748b',
                      background: '#f8fafc',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      marginTop: '22px',
                    }}>
                      Passwords are encrypted with SHA-256 standard and salted for maximum account protection.
                    </div>
                  </div>
                </div>

                <div className="settings-card-actions">
                  <button
                    type="submit"
                    className="btn-settings-primary"
                    disabled={passwordSaving}
                  >
                    <IconKey size={16} />
                    <span>{passwordSaving ? 'Updating Password...' : 'Update Password'}</span>
                  </button>
                </div>
              </form>
            </section>
          )}

          {/* ──────────────────────────────────────────────────────────
              SECTION 3: STORE ORDER HISTORY
             ────────────────────────────────────────────────────────── */}
          {(activeTab === 'all' || activeTab === 'orders') && (
            <section className="settings-card">
              <div className="settings-card-header">
                <div className="settings-card-title">
                  <IconShoppingBag size={20} color="#0284c7" />
                  <div>
                    <h2>MacroPace Store Order History</h2>
                    <p>View your past supplement purchases, fitness gear orders, and tracking invoices</p>
                  </div>
                </div>
              </div>

              {/* Order Stats Overview */}
              <div className="order-stats-strip">
                <div className="order-stat-chip-box">
                  <div className="stat-sub">Lifetime Orders</div>
                  <div className="stat-val">{orderHistory.length} Orders</div>
                </div>
                <div className="order-stat-chip-box">
                  <div className="stat-sub">Total Spent</div>
                  <div className="stat-val">₹{totalSpent}</div>
                </div>
                <div className="order-stat-chip-box">
                  <div className="stat-sub">Active Shipments</div>
                  <div className="stat-val" style={{ color: '#10b981' }}>0 In Transit</div>
                </div>
              </div>

              {/* Orders List */}
              {orderHistory.length > 0 ? (
                <div className="orders-list-container">
                  {orderHistory.map((order) => {
                    const statusMeta = ORDER_STATUSES[order.status] || ORDER_STATUSES.DELIVERED;

                    return (
                      <div className="order-item-card" key={order.id}>
                        {/* Order Top Meta */}
                        <div className="order-card-top">
                          <div className="order-id-meta">
                            <h4>Order #{order.id}</h4>
                            <span className="order-date">Placed on {order.orderDate}</span>
                          </div>

                          <span
                            className="order-status-pill"
                            style={{
                              background: statusMeta.bg,
                              color: statusMeta.color,
                            }}
                          >
                            <span className="dot" style={{ background: statusMeta.color }} />
                            {statusMeta.label}
                          </span>
                        </div>

                        {/* Order Items */}
                        <div className="order-items-preview">
                          {order.items.map((item) => (
                            <div className="order-line-item" key={item.id}>
                              <div className="order-line-left">
                                <div className="order-item-icon-box">
                                  <IconPackage size={18} />
                                </div>
                                <div>
                                  <div className="order-item-title">{item.name}</div>
                                  <div className="order-item-sub">
                                    {item.size} · {item.flavor} · Qty: {item.quantity}
                                  </div>
                                </div>
                              </div>
                              <div className="order-line-right">
                                ₹{(item.unitPrice * item.quantity).toFixed(2)}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Order Footer */}
                        <div className="order-card-bottom">
                          <div className="order-total-price">
                            Order Total: <strong>₹{order.total.toFixed(2)}</strong>
                          </div>

                          <button
                            type="button"
                            className="btn-view-receipt"
                            onClick={() => setSelectedReceipt(order)}
                          >
                            <IconReceipt size={14} />
                            <span>View Invoice / Receipt</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Empty Orders State */
                <div className="orders-empty-card">
                  <div className="orders-empty-icon">
                    <IconShoppingBag size={28} />
                  </div>
                  <h3>No Orders Found</h3>
                  <p>You haven&apos;t placed any store orders yet. Browse our premium supplements and gym apparel!</p>
                </div>
              )}
            </section>
          )}
        </div>
      </main>

      {/* ──────────────────────────────────────────────────────────
          RECEIPT / INVOICE MODAL
         ────────────────────────────────────────────────────────── */}
      {selectedReceipt && (
        <div className="receipt-modal-backdrop" onClick={() => setSelectedReceipt(null)}>
          <div className="receipt-modal-window" onClick={(e) => e.stopPropagation()}>
            <div className="receipt-modal-header">
              <div className="receipt-brand-title">
                <h3>MacroPace Store Invoice</h3>
                <p>Order #{selectedReceipt.id} · {selectedReceipt.orderDate}</p>
              </div>
              <button
                type="button"
                className="btn-close-modal"
                onClick={() => setSelectedReceipt(null)}
                title="Close receipt"
              >
                ✕
              </button>
            </div>

            {/* Tracking & Shipping Details */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
              fontSize: '0.84rem',
              color: '#334155',
              background: '#f8fafc',
              padding: '12px 16px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
            }}>
              <div>
                <strong style={{ color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase' }}>Ship To:</strong>
                <div>{user?.name || 'Alex Morgan'}</div>
                <div style={{ color: '#64748b' }}>
                  {selectedReceipt.shippingAddress.street}, {selectedReceipt.shippingAddress.city}, {selectedReceipt.shippingAddress.state} {selectedReceipt.shippingAddress.zip}
                </div>
              </div>
              <div>
                <strong style={{ color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase' }}>Payment:</strong>
                <div>{selectedReceipt.paymentMethod}</div>
                <div style={{ color: '#0284c7', fontWeight: 600 }}>Tracking: {selectedReceipt.trackingNumber}</div>
              </div>
            </div>

            {/* Line Items Table */}
            <table className="receipt-details-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th style={{ textAlign: 'center' }}>Qty</th>
                  <th style={{ textAlign: 'right' }}>Price</th>
                </tr>
              </thead>
              <tbody>
                {selectedReceipt.items.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <strong>{item.name}</strong>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{item.size} · {item.flavor}</div>
                    </td>
                    <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                    <td style={{ textAlign: 'right' }}>₹{(item.unitPrice * item.quantity).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals Breakdown */}
            <div className="receipt-totals-box">
              <div className="receipt-total-row">
                <span>Subtotal</span>
                <span>₹{selectedReceipt.subtotal.toFixed(2)}</span>
              </div>
              <div className="receipt-total-row">
                <span>Shipping</span>
                <span>{selectedReceipt.shipping === 0 ? 'FREE' : `₹${selectedReceipt.shipping.toFixed(2)}`}</span>
              </div>
              <div className="receipt-total-row">
                <span>Estimated Tax</span>
                <span>₹{selectedReceipt.tax.toFixed(2)}</span>
              </div>
              <div className="receipt-total-row grand">
                <span>Total Paid</span>
                <span style={{ color: '#0284c7' }}>₹{selectedReceipt.total.toFixed(2)}</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', paddingTop: '8px' }}>
              <button
                type="button"
                className="btn-settings-secondary"
                onClick={() => setSelectedReceipt(null)}
              >
                Close
              </button>
              <button
                type="button"
                className="btn-settings-primary"
                onClick={() => {
                  window.print?.();
                }}
              >
                <IconReceipt size={15} />
                <span>Print Invoice</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="toast-notification">
          <IconCheck size={18} color="#10b981" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
