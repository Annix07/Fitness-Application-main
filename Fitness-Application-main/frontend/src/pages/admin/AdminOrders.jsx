import { useState, useMemo } from 'react';
import {
  IconSearch,
} from '../../components/common/Icons';

export default function AdminOrders({
  orders,
  onUpdateOrderStatus,
  selectedOrderForModal,
  onClearSelectedOrder,
  onOpenMobileNav,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  // Active detail modal
  const [activeOrderDetail, setActiveOrderDetail] = useState(selectedOrderForModal || null);
  const [selectedStatusEdit, setSelectedStatusEdit] = useState('');

  // Sync if selected from outside (e.g. Dashboard)
  useMemo(() => {
    if (selectedOrderForModal) {
      setActiveOrderDetail(selectedOrderForModal);
      setSelectedStatusEdit(selectedOrderForModal.status);
    }
  }, [selectedOrderForModal]);

  const filteredOrders = useMemo(() => {
    return orders.filter((ord) => {
      const custName = ord.customer?.name || ord.customer_name || '';
      const custEmail = ord.customer?.email || ord.customer_email || '';
      const matchSearch =
        String(ord.id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        custName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        custEmail.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus = statusFilter === 'all' || (ord.status || '').toLowerCase() === statusFilter.toLowerCase();

      return matchSearch && matchStatus;
    });
  }, [orders, searchTerm, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / pageSize));
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredOrders.slice(start, start + pageSize);
  }, [filteredOrders, currentPage]);

  const handleOpenDetail = (ord) => {
    setActiveOrderDetail(ord);
    setSelectedStatusEdit(ord.status);
  };

  const handleCloseDetail = () => {
    setActiveOrderDetail(null);
    if (onClearSelectedOrder) onClearSelectedOrder();
  };

  const handleSaveStatus = () => {
    if (!activeOrderDetail || !selectedStatusEdit) return;
    onUpdateOrderStatus(activeOrderDetail.id, selectedStatusEdit);
    setActiveOrderDetail({ ...activeOrderDetail, status: selectedStatusEdit });
  };

  return (
    <div className="admin-tab-content">
      {/* Top Header Row */}
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
            <h2>Store Order Fulfillment</h2>
            <p className="admin-header-subtitle">
              Track customer checkouts, shipping addresses, and status dispatches.
            </p>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="admin-filter-bar">
        <div className="admin-search-input-wrap">
          <IconSearch size={16} color="#64748b" />
          <input
            type="text"
            className="admin-search-input"
            placeholder="Search by Order ID, customer name, or email..."
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
            <span className="admin-filter-tag">Fulfillment:</span>
            <select
              className="admin-select"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="admin-panel-card no-padding">
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Date &amp; Time</th>
                <th>Items Count</th>
                <th>Total</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedOrders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="admin-table-empty">
                    No orders matching criteria.
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((ord) => (
                  <tr
                    key={ord.id}
                    className="admin-clickable-row"
                    onClick={() => handleOpenDetail(ord)}
                  >
                    <td>
                      <span className="admin-order-id">{ord.id}</span>
                    </td>
                    <td>
                      <div className="admin-user-cell">
                        <strong>{ord.customer?.name || ord.customer_name || 'Customer'}</strong>
                        <span className="admin-user-email">{ord.customer?.email || ord.customer_email || ''}</span>
                      </div>
                    </td>
                    <td className="admin-td-date">{ord.date || ord.created_at}</td>
                    <td>{ord.items?.length || ord.itemCount || 0} items</td>
                    <td>
                      <strong>₹{(Number(ord.total) || Number(ord.total_amount) || 0).toFixed(2)}</strong>
                    </td>
                    <td>
                      <span className={`admin-status-badge ${(ord.status || 'pending').toLowerCase()}`}>
                        {ord.status || 'Pending'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        className="btn-admin-row"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenDetail(ord);
                        }}
                      >
                        Details →
                      </button>
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
            Showing <strong>{filteredOrders.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}</strong> to{' '}
            <strong>{Math.min(currentPage * pageSize, filteredOrders.length)}</strong> of{' '}
            <strong>{filteredOrders.length}</strong> orders
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

      {/* ORDER DETAIL MODAL */}
      {activeOrderDetail && (
        <div className="admin-modal-overlay" onClick={handleCloseDetail}>
          <div className="admin-modal-box large" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div>
                <h3>Order #{activeOrderDetail.id}</h3>
                <span className="admin-modal-subtitle">Placed on {activeOrderDetail.date}</span>
              </div>
              <button
                type="button"
                className="admin-modal-close"
                onClick={handleCloseDetail}
              >
                ×
              </button>
            </div>

            <div className="admin-order-detail-grid">
              {/* Left: Customer & Shipping */}
              <div className="order-detail-card">
                <h4>Customer &amp; Delivery</h4>
                <div className="order-detail-info-row">
                  <span className="info-lbl">Customer Name:</span>
                  <strong>{activeOrderDetail.customer?.name || activeOrderDetail.customer_name || 'Customer'}</strong>
                </div>
                <div className="order-detail-info-row">
                  <span className="info-lbl">Email:</span>
                  <span>{activeOrderDetail.customer?.email || activeOrderDetail.customer_email || '—'}</span>
                </div>
                <div className="order-detail-info-row">
                  <span className="info-lbl">Phone:</span>
                  <span>{activeOrderDetail.customer?.phone || activeOrderDetail.phone || '—'}</span>
                </div>
                <div className="order-detail-info-row">
                  <span className="info-lbl">Shipping Address:</span>
                  <span>{activeOrderDetail.customer?.address || activeOrderDetail.shippingAddress || '—'}</span>
                </div>
                <div className="order-detail-info-row">
                  <span className="info-lbl">Payment Method:</span>
                  <span>{activeOrderDetail.paymentMethod || 'Credit Card'}</span>
                </div>
              </div>

              {/* Right: Status Management */}
              <div className="order-detail-card highlight">
                <h4>Fulfillment Status</h4>
                <div className="order-status-changer">
                  <select
                    className="admin-form-input status-select"
                    value={selectedStatusEdit}
                    onChange={(e) => setSelectedStatusEdit(e.target.value)}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                  <button
                    type="button"
                    className="btn-admin-primary"
                    onClick={handleSaveStatus}
                  >
                    Update Status
                  </button>
                </div>
                <p className="order-status-tip">
                  Updating status dispatches automated notifications to {activeOrderDetail.customer?.email || activeOrderDetail.customer_email || 'the customer'}.
                </p>
              </div>
            </div>

            {/* Items Breakdown Table */}
            <div className="order-items-box">
              <h4>Order Items ({activeOrderDetail.items?.length || 0})</h4>
              <div className="order-items-table">
                {(activeOrderDetail.items || []).map((it, idx) => {
                  const itemPrice = Number(it.price) || 0;
                  const itemQty = Number(it.quantity || it.qty || 1);
                  return (
                    <div className="order-item-row" key={idx}>
                      <div className="order-item-title-box">
                        <strong>{it.name || it.product_name}</strong>
                        <span className="order-item-qty">Qty: {itemQty}</span>
                      </div>
                      <div className="order-item-price-box">
                        <span>₹{itemPrice.toFixed(2)} each</span>
                        <strong>₹{(itemPrice * itemQty).toFixed(2)}</strong>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="order-total-summary-bar">
                <span>Total Amount Paid</span>
                <strong>₹{(Number(activeOrderDetail.total) || Number(activeOrderDetail.total_amount) || 0).toFixed(2)}</strong>
              </div>
            </div>

            <div className="admin-modal-actions">
              <button
                type="button"
                className="btn-admin-secondary"
                onClick={handleCloseDetail}
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
