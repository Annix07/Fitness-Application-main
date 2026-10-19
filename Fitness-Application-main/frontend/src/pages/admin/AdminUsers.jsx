import { useState, useMemo } from 'react';
import {
  IconSearch,
  IconUser,
  IconEdit,
  IconTrash,
} from '../../components/common/Icons';
import AdminConfirmModal from './modals/AdminConfirmModal';

export default function AdminUsers({
  users,
  onUpdateUser,
  onDeleteUser,
  onOpenMobileNav,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortField, setSortField] = useState('joinDate');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  // Modals state
  const [viewUserModal, setViewUserModal] = useState(null);
  const [editUserModal, setEditUserModal] = useState(null);
  const [deleteTargetUser, setDeleteTargetUser] = useState(null);

  // Filtered and sorted user list
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchSearch =
        (u.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(u.id || '').toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus = statusFilter === 'all' || (u.status || '').toLowerCase() === statusFilter.toLowerCase();

      return matchSearch && matchStatus;
    }).sort((a, b) => {
      let valA = a[sortField] ?? '';
      let valB = b[sortField] ?? '';

      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [users, searchTerm, statusFilter, sortField, sortOrder]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, currentPage]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleExportCSV = () => {
    const headers = ['User ID', 'Name', 'Email', 'Role', 'Status', 'Join Date', 'Orders Count', 'Spent Total'];
    const rows = filteredUsers.map((u) => [
      u.id,
      `"${u.name}"`,
      u.email,
      u.role,
      u.status,
      u.joinDate,
      u.ordersCount,
      u.spentTotal,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `macropace_users_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleToggleStatus = (user) => {
    const nextStatus = user.status === 'Active' ? 'Inactive' : 'Active';
    onUpdateUser({ ...user, status: nextStatus });
  };

  const handleSaveEditUser = (e) => {
    e.preventDefault();
    if (!editUserModal) return;
    onUpdateUser(editUserModal);
    setEditUserModal(null);
  };

  const handleConfirmDelete = () => {
    if (deleteTargetUser) {
      onDeleteUser(deleteTargetUser.id);
      setDeleteTargetUser(null);
    }
  };

  return (
    <div className="admin-tab-content">
      {/* Top Header & Actions */}
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
            <h2>User Management</h2>
            <p className="admin-header-subtitle">
              Manage user accounts, roles, security statuses, and access credentials.
            </p>
          </div>
        </div>

        <div className="admin-header-btn-group">
          <button type="button" className="btn-admin-secondary" onClick={handleExportCSV}>
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="admin-filter-bar">
        <div className="admin-search-input-wrap">
          <IconSearch size={16} color="#64748b" />
          <input
            type="text"
            className="admin-search-input"
            placeholder="Search users by name, email, or ID..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
          {searchTerm && (
            <button
              type="button"
              className="admin-search-clear"
              onClick={() => setSearchTerm('')}
            >
              ×
            </button>
          )}
        </div>

        <div className="admin-filters-group">
          <div className="admin-select-wrap">
            <span className="admin-filter-tag">Status:</span>
            <select
              className="admin-select"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Data Table */}
      <div className="admin-panel-card no-padding">
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('name')} className="sortable-th">
                  User {sortField === 'name' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
                </th>
                <th onClick={() => handleSort('role')} className="sortable-th">
                  Role {sortField === 'role' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
                </th>
                <th onClick={() => handleSort('status')} className="sortable-th">
                  Status {sortField === 'status' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
                </th>
                <th onClick={() => handleSort('joinDate')} className="sortable-th">
                  Join Date {sortField === 'joinDate' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
                </th>
                <th onClick={() => handleSort('spentTotal')} className="sortable-th">
                  Total Spent {sortField === 'spentTotal' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
                </th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="admin-table-empty">
                    No users matching your criteria.
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div className="admin-user-cell">
                        <div
                          className="admin-avatar-circle"
                          style={{ background: u.avatarColor || '#0284c7' }}
                        >
                          {(u.name || 'U').charAt(0)}
                        </div>
                        <div className="admin-user-info-text">
                          <strong>{u.name || 'Anonymous User'}</strong>
                          <span className="admin-user-email">{u.email}</span>
                          <span className="admin-user-id-badge">{u.id}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`admin-role-badge ${(u.role || 'user').toLowerCase()}`}>
                        {u.role || 'user'}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className={`admin-status-toggle-pill ${(u.status || 'active').toLowerCase()}`}
                        onClick={() => handleToggleStatus(u)}
                        title="Click to toggle status"
                      >
                        <span className="status-dot" />
                        {u.status || 'Active'}
                      </button>
                    </td>
                    <td className="admin-td-date">{u.joinDate || 'Recent'}</td>
                    <td>
                      <strong>₹{(Number(u.spentTotal) || 0).toFixed(2)}</strong>
                      <span className="admin-sub-text">{u.ordersCount || 0} orders</span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="admin-row-actions">
                        <button
                          type="button"
                          className="btn-admin-icon"
                          title="View Details"
                          onClick={() => setViewUserModal(u)}
                        >
                          <IconUser size={15} color="#64748b" />
                        </button>
                        <button
                          type="button"
                          className="btn-admin-icon"
                          title="Edit User"
                          onClick={() => setEditUserModal({ ...u })}
                        >
                          <IconEdit size={15} color="#0284c7" />
                        </button>
                        <button
                          type="button"
                          className="btn-admin-icon delete"
                          title="Delete User"
                          onClick={() => setDeleteTargetUser(u)}
                        >
                          <IconTrash size={15} color="#ef4444" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="admin-pagination-bar">
          <span className="admin-pagination-info">
            Showing <strong>{filteredUsers.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}</strong> to{' '}
            <strong>{Math.min(currentPage * pageSize, filteredUsers.length)}</strong> of{' '}
            <strong>{filteredUsers.length}</strong> users
          </span>

          <div className="admin-pagination-controls">
            <button
              type="button"
              className="btn-admin-page"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </button>
            <span className="admin-page-number">
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              className="btn-admin-page"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* VIEW USER MODAL */}
      {viewUserModal && (
        <div className="admin-modal-overlay" onClick={() => setViewUserModal(null)}>
          <div className="admin-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>User Profile Details</h3>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setViewUserModal(null)}
              >
                ×
              </button>
            </div>

            <div className="admin-user-profile-body">
              <div className="user-profile-top">
                <div
                  className="user-profile-avatar-big"
                  style={{ background: viewUserModal.avatarColor || '#0284c7' }}
                >
                  {(viewUserModal.name || 'U').charAt(0)}
                </div>
                <div>
                  <h4>{viewUserModal.name || 'Anonymous User'}</h4>
                  <p>{viewUserModal.email}</p>
                  <div className="profile-badge-row">
                    <span className={`admin-role-badge ${(viewUserModal.role || 'user').toLowerCase()}`}>
                      {viewUserModal.role || 'User'}
                    </span>
                    <span className={`admin-status-badge ${(viewUserModal.status || 'active').toLowerCase()}`}>
                      {viewUserModal.status || 'Active'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="user-profile-stats-grid">
                <div className="profile-stat-box">
                  <span>User ID</span>
                  <strong>{viewUserModal.id}</strong>
                </div>
                <div className="profile-stat-box">
                  <span>Registration Date</span>
                  <strong>{viewUserModal.joinDate || 'N/A'}</strong>
                </div>
                <div className="profile-stat-box">
                  <span>Store Purchases</span>
                  <strong>{viewUserModal.ordersCount || 0} Orders</strong>
                </div>
                <div className="profile-stat-box">
                  <span>Lifetime Spend</span>
                  <strong>₹{(Number(viewUserModal.spentTotal) || 0).toFixed(2)}</strong>
                </div>
              </div>
            </div>

            <div className="admin-modal-actions">
              <button
                type="button"
                className="btn-admin-secondary"
                onClick={() => setViewUserModal(null)}
              >
                Close
              </button>
              <button
                type="button"
                className="btn-admin-primary"
                onClick={() => {
                  setEditUserModal({ ...viewUserModal });
                  setViewUserModal(null);
                }}
              >
                Edit Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT USER MODAL */}
      {editUserModal && (
        <div className="admin-modal-overlay" onClick={() => setEditUserModal(null)}>
          <div className="admin-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>Edit User Account</h3>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setEditUserModal(null)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSaveEditUser}>
              <div className="admin-form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  className="admin-form-input"
                  required
                  value={editUserModal.name}
                  onChange={(e) => setEditUserModal({ ...editUserModal, name: e.target.value })}
                />
              </div>

              <div className="admin-form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  className="admin-form-input"
                  required
                  value={editUserModal.email}
                  onChange={(e) => setEditUserModal({ ...editUserModal, email: e.target.value })}
                />
              </div>

              <div className="admin-form-row-2">
                <div className="admin-form-group">
                  <label>Account Role</label>
                  <select
                    className="admin-form-input"
                    value={editUserModal.role}
                    onChange={(e) => setEditUserModal({ ...editUserModal, role: e.target.value })}
                  >
                    <option value="User">User</option>
                    <option value="Trainer">Trainer</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>

                <div className="admin-form-group">
                  <label>Status</label>
                  <select
                    className="admin-form-input"
                    value={editUserModal.status}
                    onChange={(e) => setEditUserModal({ ...editUserModal, status: e.target.value })}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="admin-modal-actions">
                <button
                  type="button"
                  className="btn-admin-cancel"
                  onClick={() => setEditUserModal(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-admin-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}



      {/* DELETE CONFIRMATION MODAL */}
      <AdminConfirmModal
        isOpen={Boolean(deleteTargetUser)}
        title="Delete User Account"
        message={`Are you sure you want to permanently delete ${deleteTargetUser?.name} (${deleteTargetUser?.email})? All order history and assessment records associated with this ID will be removed.`}
        confirmText="Delete Account"
        confirmVariant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTargetUser(null)}
      />
    </div>
  );
}
