import {
  IconUser,
  IconShoppingBag,
  IconTrendingUp,
  IconPackage,
} from '../../components/common/Icons';
import { ADMIN_SALES_CHART_DATA } from '../../data/adminMockData';

export default function AdminDashboard({
  stats,
  recentOrders,
  onNavigateTab,
  onViewOrder,
}) {
  const maxSale = Math.max(...ADMIN_SALES_CHART_DATA.map((d) => d.sales));

  return (
    <div className="admin-tab-content">
      {/* 4 Stat Cards */}
      <section className="admin-stats-grid">
        {/* Total Users */}
        <div className="admin-stat-card">
          <div className="admin-stat-top">
            <span className="admin-stat-label">Total Users</span>
            <div className="admin-stat-icon-box blue">
              <IconUser size={18} color="#0284c7" />
            </div>
          </div>
          <div className="admin-stat-main">
            <span className="admin-stat-val">{stats.totalUsers.toLocaleString()}</span>
            <span className="admin-stat-trend positive">+14.2% this month</span>
          </div>
          <span className="admin-stat-meta">{stats.activeUsersCount} active members</span>
        </div>

        {/* Total Orders */}
        <div className="admin-stat-card">
          <div className="admin-stat-top">
            <span className="admin-stat-label">Total Orders</span>
            <div className="admin-stat-icon-box green">
              <IconShoppingBag size={18} color="#16a34a" />
            </div>
          </div>
          <div className="admin-stat-main">
            <span className="admin-stat-val">{stats.totalOrders.toLocaleString()}</span>
            <span className="admin-stat-trend positive">+8.5% vs last month</span>
          </div>
          <span className="admin-stat-meta">{stats.pendingOrdersCount} pending processing</span>
        </div>

        {/* Revenue This Month */}
        <div className="admin-stat-card">
          <div className="admin-stat-top">
            <span className="admin-stat-label">Revenue (This Month)</span>
            <div className="admin-stat-icon-box purple">
              <IconTrendingUp size={18} color="#8b5cf6" />
            </div>
          </div>
          <div className="admin-stat-main">
            <span className="admin-stat-val">₹{Number(stats.monthlyRevenue || stats.totalRevenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            <span className="admin-stat-trend positive">+22.4% ARR</span>
          </div>
          <span className="admin-stat-meta">Avg order value: ₹68.40</span>
        </div>

        {/* Active Products */}
        <div className="admin-stat-card">
          <div className="admin-stat-top">
            <span className="admin-stat-label">Active Products</span>
            <div className="admin-stat-icon-box orange">
              <IconPackage size={18} color="#f97316" />
            </div>
          </div>
          <div className="admin-stat-main">
            <span className="admin-stat-val">{stats.activeProductsCount}</span>
            <span className="admin-stat-trend neutral">of {stats.totalProducts} total</span>
          </div>
          <span className="admin-stat-meta">{stats.lowStockCount} items low in stock</span>
        </div>
      </section>

      {/* 2-Column Analytics Charts Row */}
      <section className="admin-charts-grid">
        {/* Sales Trend Chart */}
        <div className="admin-panel-card">
          <div className="admin-panel-header">
            <div>
              <h3>Revenue &amp; Sales Trend</h3>
              <p className="admin-panel-sub">Performance over the last 30 days</p>
            </div>
            <span className="admin-badge-live">Live Sync</span>
          </div>

          <div className="admin-chart-svg-box">
            <svg className="admin-svg-chart" viewBox="0 0 500 160" preserveAspectRatio="none">
              <defs>
                <linearGradient id="adminSalesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0284c7" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#0284c7" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="20" y1="20" x2="480" y2="20" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="20" y1="70" x2="480" y2="70" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="20" y1="120" x2="480" y2="120" stroke="#e2e8f0" strokeWidth="1" />

              {/* Area & Path */}
              <polygon
                points="40,105 120,80 200,55 280,72 360,30 440,42 440,120 40,120"
                fill="url(#adminSalesGrad)"
              />
              <polyline
                points="40,105 120,80 200,55 280,72 360,30 440,42"
                fill="none"
                stroke="#0284c7"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Data markers */}
              {ADMIN_SALES_CHART_DATA.map((d, i) => {
                const x = 40 + i * 80;
                const y = 120 - (d.sales / maxSale) * 90;
                return (
                  <g key={d.day} className="admin-chart-dot">
                    <circle cx={x} cy={y} r="4.5" fill="#ffffff" stroke="#0284c7" strokeWidth="2.5" />
                    <text x={x} y={y - 8} textAnchor="middle" fontSize="9.5" fontWeight="700" fill="#0f172a">
                      ₹{d.sales}
                    </text>
                    <text x={x} y="142" textAnchor="middle" fontSize="10" fontWeight="600" fill="#64748b">
                      {d.day}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* User Growth & Signups */}
        <div className="admin-panel-card">
          <div className="admin-panel-header">
            <div>
              <h3>User Registrations</h3>
              <p className="admin-panel-sub">New accounts per week</p>
            </div>
            <button
              type="button"
              className="btn-admin-link"
              onClick={() => onNavigateTab('users')}
            >
              View Users
            </button>
          </div>

          <div className="admin-chart-svg-box">
            <svg className="admin-svg-chart" viewBox="0 0 500 160" preserveAspectRatio="none">
              <defs>
                <linearGradient id="adminUserGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#16a34a" />
                  <stop offset="100%" stopColor="#4ade80" />
                </linearGradient>
              </defs>

              <line x1="20" y1="20" x2="480" y2="20" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="20" y1="70" x2="480" y2="70" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="20" y1="120" x2="480" y2="120" stroke="#e2e8f0" strokeWidth="1" />

              {ADMIN_SALES_CHART_DATA.map((d, i) => {
                const colWidth = 32;
                const x = 35 + i * 80;
                const barHeight = (d.users / 30) * 90;
                const y = 120 - barHeight;

                return (
                  <g key={d.day}>
                    <rect x={x} y="20" width={colWidth} height="100" rx="6" fill="#f8fafc" />
                    <rect x={x} y={y} width={colWidth} height={barHeight} rx="6" fill="url(#adminUserGrad)" />
                    <text x={x + colWidth / 2} y={y - 6} textAnchor="middle" fontSize="10" fontWeight="700" fill="#16a34a">
                      +{d.users}
                    </text>
                    <text x={x + colWidth / 2} y="142" textAnchor="middle" fontSize="10" fontWeight="600" fill="#64748b">
                      {d.day}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      </section>

      {/* Recent Orders Table */}
      <section className="admin-panel-card">
        <div className="admin-panel-header">
          <div>
            <h3>Recent Orders</h3>
            <p className="admin-panel-sub">Latest customer transactions from MacroPace Store</p>
          </div>
          <button
            type="button"
            className="btn-admin-link"
            onClick={() => onNavigateTab('orders')}
          >
            All Orders
          </button>
        </div>

        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Date &amp; Time</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders && recentOrders.length > 0 ? (
                recentOrders.slice(0, 5).map((ord) => (
                  <tr key={ord.id}>
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
                        onClick={() => onViewOrder(ord)}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                    No store orders placed yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
