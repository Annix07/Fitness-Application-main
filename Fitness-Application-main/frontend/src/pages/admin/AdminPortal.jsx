import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Sidebar from '../../components/dashboard/Sidebar';
import { useAuthModal } from '../../context/AuthModalContext';
import AdminDashboard from './AdminDashboard';
import AdminUsers from './AdminUsers';
import AdminProducts from './AdminProducts';
import AdminOrders from './AdminOrders';
import AdminReports from './AdminReports';
import AdminSettings from './AdminSettings';
import api from '../../services/api';
import '../../styles/DashboardPage.css';
import '../../styles/AdminPortal.css';

export default function AdminPortal() {
  const { user } = useAuthModal();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'dashboard';

  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedOrderForModal, setSelectedOrderForModal] = useState(null);

  const todayDateObj = new Date();
  const formattedToday = todayDateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  // State
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsersCount: 0,
    totalProducts: 0,
    activeProductsCount: 0,
    lowStockCount: 0,
    totalOrders: 0,
    pendingOrdersCount: 0,
    monthlyRevenue: 0,
  });

  // Load from MySQL Backend
  const loadAdminData = async () => {
    try {
      const [statsRes, usersRes, prodsRes, ordersRes] = await Promise.all([
        api.get('/admin/stats').catch(() => null),
        api.get('/admin/users').catch(() => null),
        api.get('/admin/products').catch(() => null),
        api.get('/admin/orders').catch(() => null),
      ]);

      if (statsRes?.success && statsRes.stats) setStats(statsRes.stats);
      if (usersRes?.success && usersRes.users) setUsers(usersRes.users);
      if (prodsRes?.success && prodsRes.products) setProducts(prodsRes.products);
      if (ordersRes?.success && ordersRes.orders) setOrders(ordersRes.orders);
    } catch (err) {
      console.error('Failed to load admin data from MySQL backend:', err);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, [activeTab]);

  const handleTabChange = (tabKey) => {
    setSearchParams({ tab: tabKey });
    setMobileOpen(false);
  };

  // User Handlers
  const handleUpdateUser = async (updatedUser) => {
    setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
    try {
      await api.put(`/admin/users/${updatedUser.id}`, updatedUser);
    } catch (err) {
      console.error('Update user failed:', err);
    }
  };

  const handleDeleteUser = async (userId) => {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    try {
      await api.delete(`/admin/users/${userId}`);
    } catch (err) {
      console.error('Delete user failed:', err);
    }
  };

  // Product Handlers
  const handleAddProduct = async (newProd) => {
    try {
      const res = await api.post('/admin/products', newProd);
      if (res.success && res.product) {
        setProducts((prev) => [res.product, ...prev]);
        loadAdminData();
      } else {
        setProducts((prev) => [newProd, ...prev]);
      }
    } catch (err) {
      setProducts((prev) => [newProd, ...prev]);
    }
  };

  const handleUpdateProduct = async (updatedProd) => {
    setProducts((prev) => prev.map((p) => (p.id === updatedProd.id ? updatedProd : p)));
    try {
      await api.put(`/admin/products/${updatedProd.id}`, updatedProd);
    } catch (err) {
      console.error('Update product failed:', err);
    }
  };

  const handleDeleteProduct = async (prodId) => {
    setProducts((prev) => prev.filter((p) => p.id !== prodId));
    try {
      await api.delete(`/admin/products/${prodId}`);
    } catch (err) {
      console.error('Delete product failed:', err);
    }
  };

  // Order Handlers
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
    try {
      await api.put(`/admin/orders/${orderId}/status`, { status: newStatus });
    } catch (err) {
      console.error('Update order status failed:', err);
    }
  };

  const handleViewOrderFromDashboard = (order) => {
    setSelectedOrderForModal(order);
    handleTabChange('orders');
  };

  const handleResetDefaults = () => {
    loadAdminData();
  };

  return (
    <div className="dashboard-page-container">
      {/* Standard Dashboard Sidebar */}
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      <main className="dashboard-content">
        {/* Top Header shown only on Dashboard tab to prevent duplicate header sections */}
        {activeTab === 'dashboard' && (
          <header className="dash-page-header">
            <div className="dash-header-left">
              <button
                type="button"
                className="mobile-nav-toggle"
                onClick={() => setMobileOpen(true)}
                aria-label="Open Navigation"
              >
                ☰
              </button>
              <div className="dash-page-title">
                <h1>Enterprise Dashboard &amp; Analytics</h1>
                <p>{formattedToday} · Super Administrator ({user?.name || 'Admin'})</p>
              </div>
            </div>
          </header>
        )}

        {/* View Switcher Content */}
        <div className="admin-view-body">
          {activeTab === 'dashboard' && (
            <AdminDashboard
              stats={stats}
              recentOrders={orders}
              onNavigateTab={handleTabChange}
              onViewOrder={handleViewOrderFromDashboard}
            />
          )}

          {activeTab === 'users' && (
            <AdminUsers
              users={users}
              onUpdateUser={handleUpdateUser}
              onDeleteUser={handleDeleteUser}
              onOpenMobileNav={() => setMobileOpen(true)}
            />
          )}

          {activeTab === 'products' && (
            <AdminProducts
              products={products}
              onAddProduct={handleAddProduct}
              onUpdateProduct={handleUpdateProduct}
              onDeleteProduct={handleDeleteProduct}
              onOpenMobileNav={() => setMobileOpen(true)}
            />
          )}

          {activeTab === 'orders' && (
            <AdminOrders
              orders={orders}
              onUpdateOrderStatus={handleUpdateOrderStatus}
              selectedOrderForModal={selectedOrderForModal}
              onClearSelectedOrder={() => setSelectedOrderForModal(null)}
              onOpenMobileNav={() => setMobileOpen(true)}
            />
          )}

          {activeTab === 'reports' && (
            <AdminReports
              stats={stats}
              products={products}
              orders={orders}
              users={users}
              onOpenMobileNav={() => setMobileOpen(true)}
            />
          )}

          {activeTab === 'settings' && (
            <AdminSettings
              onResetDefaults={handleResetDefaults}
              onOpenMobileNav={() => setMobileOpen(true)}
            />
          )}
        </div>
      </main>
    </div>
  );
}
