import { useState } from 'react';
import {
  IconTrendingUp,
  IconShoppingBag,
  IconUser,
  IconCheck,
} from '../../components/common/Icons';

export default function AdminReports({ stats, products, orders, users, onOpenMobileNav }) {
  const [dateRange, setDateRange] = useState('30days');
  const [activeReportTab, setActiveReportTab] = useState('sales'); // 'sales' | 'users' | 'products'
  const [isGenerating, setIsGenerating] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleExportCSV = () => {
    let headers = [];
    let rows = [];
    let filename = `macropace_report_${activeReportTab}_${dateRange}.csv`;

    if (activeReportTab === 'sales') {
      headers = ['Order ID', 'Customer', 'Date', 'Total', 'Status'];
      rows = orders.map((o) => [o.id, `"${o.customer?.name || o.customer_name || 'Customer'}"`, o.date || o.created_at || '', o.total || o.total_amount || 0, o.status || 'Pending']);
    } else if (activeReportTab === 'users') {
      headers = ['User ID', 'Name', 'Email', 'Role', 'Status', 'Join Date', 'Total Spent'];
      rows = users.map((u) => [u.id, `"${u.name}"`, u.email, u.role, u.status, u.joinDate, u.spentTotal]);
    } else {
      headers = ['Product ID', 'Name', 'Category', 'Price', 'Stock', 'Sales Count'];
      rows = products.map((p) => [p.id, `"${p.name}"`, p.category, p.price, p.stock, p.salesCount]);
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    triggerToast(`Exported ${filename} successfully!`);
  };

  const handleExportPDF = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      window.print();
      triggerToast('Printable Report ready!');
    }, 600);
  };

  return (
    <div className="admin-tab-content">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="admin-toast-float">
          <IconCheck size={16} color="#16a34a" />
          <span>{toastMessage}</span>
        </div>
      )}

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
            <h2>Analytics &amp; Executive Reports</h2>
            <p className="admin-header-subtitle">
              Export comprehensive telemetry on store sales, user conversions, and inventory turnover.
            </p>
          </div>
        </div>

        <div className="admin-header-btn-group">
          <div className="admin-select-wrap">
            <select
              className="admin-select"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
            >
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="quarter">This Quarter</option>
              <option value="ytd">Year to Date (YTD)</option>
            </select>
          </div>

          <button
            type="button"
            className="btn-admin-secondary"
            onClick={handleExportCSV}
          >
            Export CSV
          </button>
          <button
            type="button"
            className="btn-admin-primary"
            onClick={handleExportPDF}
            disabled={isGenerating}
          >
            {isGenerating ? 'Compiling PDF...' : 'Print / Export PDF'}
          </button>
        </div>
      </div>

      {/* Report Tabs */}
      <div className="admin-reports-tab-nav">
        <button
          type="button"
          className={`report-tab-btn ${activeReportTab === 'sales' ? 'active' : ''}`}
          onClick={() => setActiveReportTab('sales')}
        >
          <IconTrendingUp size={16} />
          <span>Sales &amp; Revenue</span>
        </button>
        <button
          type="button"
          className={`report-tab-btn ${activeReportTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveReportTab('users')}
        >
          <IconUser size={16} />
          <span>User Growth</span>
        </button>
        <button
          type="button"
          className={`report-tab-btn ${activeReportTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveReportTab('products')}
        >
          <IconShoppingBag size={16} />
          <span>Product Best-Sellers</span>
        </button>
      </div>

      {/* 1. SALES REPORT VIEW */}
      {activeReportTab === 'sales' && (
        <div className="admin-report-view-container">
          <div className="admin-report-metrics-cards">
            <div className="report-metric-card">
              <span className="report-metric-lbl">Gross Store Sales</span>
              <strong>₹{Number(stats.monthlyRevenue || stats.totalRevenue || 0).toFixed(2)}</strong>
              <span className="report-metric-sub positive">+18.5% YoY</span>
            </div>
            <div className="report-metric-card">
              <span className="report-metric-lbl">Completed Orders</span>
              <strong>{orders.filter((o) => (o.status || '').toLowerCase() === 'delivered').length}</strong>
              <span className="report-metric-sub">94.2% delivery success</span>
            </div>
            <div className="report-metric-card">
              <span className="report-metric-lbl">Average Ticket Size</span>
              <strong>₹{(Number(stats.monthlyRevenue || stats.totalRevenue || 0) / Math.max(1, orders.length)).toFixed(2)}</strong>
              <span className="report-metric-sub">Across all categories</span>
            </div>
          </div>

          <div className="admin-panel-card">
            <div className="admin-panel-header">
              <h3>Transaction Breakdown ({dateRange})</h3>
            </div>
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Fulfillment</th>
                    <th>Payment</th>
                    <th style={{ textAlign: 'right' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length > 0 ? (
                    orders.map((o) => (
                      <tr key={o.id}>
                        <td><span className="admin-order-id">{o.id}</span></td>
                        <td>{o.customer?.name || o.customer_name || 'Customer'}</td>
                        <td className="admin-td-date">{o.date || o.created_at}</td>
                        <td><span className={`admin-status-badge ${(o.status || 'pending').toLowerCase()}`}>{o.status || 'Pending'}</span></td>
                        <td>{o.paymentMethod || 'Credit Card'}</td>
                        <td style={{ textAlign: 'right' }}><strong>₹{(Number(o.total) || Number(o.total_amount) || 0).toFixed(2)}</strong></td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
                        No transactions recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. USER GROWTH REPORT VIEW */}
      {activeReportTab === 'users' && (
        <div className="admin-report-view-container">
          <div className="admin-report-metrics-cards">
            <div className="report-metric-card">
              <span className="report-metric-lbl">Active Users</span>
              <strong>{stats.activeUsersCount} / {stats.totalUsers}</strong>
              <span className="report-metric-sub positive">88% retention rate</span>
            </div>
            <div className="report-metric-card">
              <span className="report-metric-lbl">Certified Trainers</span>
              <strong>{users.filter((u) => u.role === 'Trainer').length}</strong>
              <span className="report-metric-sub">High engagement</span>
            </div>
            <div className="report-metric-card">
              <span className="report-metric-lbl">New Signups ({dateRange})</span>
              <strong>+14 Accounts</strong>
              <span className="report-metric-sub positive">+22% month-on-month</span>
            </div>
          </div>

          <div className="admin-panel-card">
            <div className="admin-panel-header">
              <h3>User Directory Snapshot</h3>
            </div>
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Join Date</th>
                    <th style={{ textAlign: 'right' }}>Lifetime Spend</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td><strong>{u.name}</strong></td>
                      <td>{u.email}</td>
                      <td><span className={`admin-role-badge ${u.role.toLowerCase()}`}>{u.role}</span></td>
                      <td><span className={`admin-status-badge ${u.status.toLowerCase()}`}>{u.status}</span></td>
                      <td className="admin-td-date">{u.joinDate}</td>
                      <td style={{ textAlign: 'right' }}><strong>₹{(Number(u.spentTotal) || 0).toFixed(2)}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. PRODUCTS REPORT VIEW */}
      {activeReportTab === 'products' && (
        <div className="admin-report-view-container">
          <div className="admin-report-metrics-cards">
            <div className="report-metric-card">
              <span className="report-metric-lbl">Total Catalog Items</span>
              <strong>{products.length} Products</strong>
              <span className="report-metric-sub">{products.filter((p) => p.status === 'Active').length} active</span>
            </div>
            <div className="report-metric-card">
              <span className="report-metric-lbl">Total Units Sold</span>
              <strong>{products.reduce((acc, p) => acc + (p.salesCount || 0), 0)} Units</strong>
              <span className="report-metric-sub positive">Fast moving</span>
            </div>
            <div className="report-metric-card">
              <span className="report-metric-lbl">Inventory Health</span>
              <strong>{products.filter((p) => p.stock > 10).length} Healthy</strong>
              <span className="report-metric-sub warning">{products.filter((p) => p.stock <= 10).length} need restock</span>
            </div>
          </div>

          <div className="admin-panel-card">
            <div className="admin-panel-header">
              <h3>Top Performing Catalog Items</h3>
            </div>
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Unit Price</th>
                    <th>Units Sold</th>
                    <th>Remaining Stock</th>
                    <th style={{ textAlign: 'right' }}>Gross Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id}>
                      <td><strong>{p.name}</strong></td>
                      <td><span className="admin-category-badge">{p.category}</span></td>
                      <td>₹{(Number(p.price) || 0).toFixed(2)}</td>
                      <td><strong>{p.salesCount} sold</strong></td>
                      <td>
                        <span className={`admin-stock-badge ${p.stock <= 10 ? 'low' : 'good'}`}>
                          {p.stock} units
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <strong>₹{((Number(p.price) || 0) * (p.salesCount || 0)).toFixed(2)}</strong>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
