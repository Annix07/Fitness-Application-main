import { useState, useMemo } from 'react';
import {
  IconSearch,
  IconPlus,
  IconEdit,
  IconTrash,
} from '../../components/common/Icons';
import AdminConfirmModal from './modals/AdminConfirmModal';

export default function AdminProducts({
  products,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onOpenMobileNav,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  // Modals
  const [addProductModalOpen, setAddProductModalOpen] = useState(false);
  const [editProductModal, setEditProductModal] = useState(null);
  const [deleteTargetProduct, setDeleteTargetProduct] = useState(null);

  // New product form
  const [newProductForm, setNewProductForm] = useState({
    name: '',
    category: 'Supplements',
    price: '',
    stock: '',
    description: '',
    image: 'https://images.unsplash.com/photo-1579722820308-d74e571900a9?w=300&q=80',
    status: 'Active',
  });

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        (p.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(p.id || '').toLowerCase().includes(searchTerm.toLowerCase());

      const matchCat = categoryFilter === 'all' || (p.category || '').toLowerCase() === categoryFilter.toLowerCase();
      const matchStatus = statusFilter === 'all' || (p.status || '').toLowerCase() === statusFilter.toLowerCase();

      return matchSearch && matchCat && matchStatus;
    });
  }, [products, searchTerm, categoryFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredProducts.slice(start, start + pageSize);
  }, [filteredProducts, currentPage]);

  const handleToggleStatus = (prod) => {
    const nextStatus = (prod.status || '').toLowerCase() === 'active' ? 'Inactive' : 'Active';
    onUpdateProduct({ ...prod, status: nextStatus });
  };

  const handleCreateProduct = (e) => {
    e.preventDefault();
    if (!newProductForm.name || !newProductForm.price) return;

    const newProd = {
      id: `PRD-${Math.floor(100 + Math.random() * 900)}`,
      name: newProductForm.name,
      category: newProductForm.category,
      price: parseFloat(newProductForm.price) || 29.99,
      stock: parseInt(newProductForm.stock, 10) || 50,
      description: newProductForm.description || 'Premium MacroPace verified athletic supplement.',
      image: newProductForm.image || 'https://images.unsplash.com/photo-1579722820308-d74e571900a9?w=300&q=80',
      status: newProductForm.status,
      salesCount: 0,
    };

    onAddProduct(newProd);
    setNewProductForm({
      name: '',
      category: 'Supplements',
      price: '',
      stock: '',
      description: '',
      image: 'https://images.unsplash.com/photo-1579722820308-d74e571900a9?w=300&q=80',
      status: 'Active',
    });
    setAddProductModalOpen(false);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editProductModal) return;
    onUpdateProduct(editProductModal);
    setEditProductModal(null);
  };

  const handleConfirmDelete = () => {
    if (deleteTargetProduct) {
      onDeleteProduct(deleteTargetProduct.id);
      setDeleteTargetProduct(null);
    }
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
            <h2>Product &amp; Inventory Management</h2>
            <p className="admin-header-subtitle">
              Configure catalog merchandise, pricing tiers, and stock levels.
            </p>
          </div>
        </div>

        <button
          type="button"
          className="btn-admin-primary"
          onClick={() => setAddProductModalOpen(true)}
        >
          <IconPlus size={15} />
          <span>Add Product</span>
        </button>
      </div>

      {/* Filter & Search */}
      <div className="admin-filter-bar">
        <div className="admin-search-input-wrap">
          <IconSearch size={16} color="#64748b" />
          <input
            type="text"
            className="admin-search-input"
            placeholder="Search products by title or ID..."
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
            <span className="admin-filter-tag">Category:</span>
            <select
              className="admin-select"
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="all">All Categories</option>
              <option value="supplements">Supplements</option>
              <option value="gear">Gear</option>
              <option value="equipment">Equipment</option>
              <option value="accessories">Accessories</option>
            </select>
          </div>

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
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="admin-panel-card no-padding">
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Sales</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan="7" className="admin-table-empty">
                    No products found matching criteria.
                  </td>
                </tr>
              ) : (
                paginatedProducts.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div className="admin-product-cell">
                        <img src={p.image} alt={p.name} className="admin-product-thumb" />
                        <div className="admin-product-info">
                          <strong>{p.name}</strong>
                          <span className="admin-product-id">{p.id}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="admin-category-badge">{p.category || 'General'}</span>
                    </td>
                    <td>
                      <strong>₹{(Number(p.price) || 0).toFixed(2)}</strong>
                    </td>
                    <td>
                      <span className={`admin-stock-badge ${(p.stock ?? 0) <= 10 ? ((p.stock ?? 0) === 0 ? 'out' : 'low') : 'good'}`}>
                        {(p.stock ?? 0) === 0 ? 'Out of Stock' : `${p.stock} units`}
                      </span>
                    </td>
                    <td className="admin-sub-text">{p.salesCount ?? 0} sold</td>
                    <td>
                      <button
                        type="button"
                        className={`admin-status-toggle-pill ${(p.status || 'Active').toLowerCase()}`}
                        onClick={() => handleToggleStatus(p)}
                      >
                        <span className="status-dot" />
                        {p.status || 'Active'}
                      </button>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="admin-row-actions">
                        <button
                          type="button"
                          className="btn-admin-icon"
                          title="Edit Product"
                          onClick={() => setEditProductModal({ ...p })}
                        >
                          <IconEdit size={15} color="#0284c7" />
                        </button>
                        <button
                          type="button"
                          className="btn-admin-icon delete"
                          title="Delete Product"
                          onClick={() => setDeleteTargetProduct(p)}
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
            Showing <strong>{filteredProducts.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}</strong> to{' '}
            <strong>{Math.min(currentPage * pageSize, filteredProducts.length)}</strong> of{' '}
            <strong>{filteredProducts.length}</strong> items
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

      {/* ADD PRODUCT MODAL */}
      {addProductModalOpen && (
        <div className="admin-modal-overlay" onClick={() => setAddProductModalOpen(false)}>
          <div className="admin-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>Add Store Product</h3>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setAddProductModalOpen(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreateProduct}>
              <div className="admin-form-group">
                <label>Product Name *</label>
                <input
                  type="text"
                  className="admin-form-input"
                  placeholder="e.g. Grass-Fed Whey Isolate 1kg"
                  required
                  value={newProductForm.name}
                  onChange={(e) => setNewProductForm({ ...newProductForm, name: e.target.value })}
                />
              </div>

              <div className="admin-form-row-2">
                <div className="admin-form-group">
                  <label>Category *</label>
                  <select
                    className="admin-form-input"
                    value={newProductForm.category}
                    onChange={(e) => setNewProductForm({ ...newProductForm, category: e.target.value })}
                  >
                    <option value="Supplements">Supplements</option>
                    <option value="Gear">Gear</option>
                    <option value="Equipment">Equipment</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                </div>

                <div className="admin-form-group">
                  <label>Price (₹ INR) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="admin-form-input"
                    placeholder="49.99"
                    required
                    value={newProductForm.price}
                    onChange={(e) => setNewProductForm({ ...newProductForm, price: e.target.value })}
                  />
                </div>
              </div>

              <div className="admin-form-row-2">
                <div className="admin-form-group">
                  <label>Stock Quantity *</label>
                  <input
                    type="number"
                    min="0"
                    className="admin-form-input"
                    placeholder="50"
                    required
                    value={newProductForm.stock}
                    onChange={(e) => setNewProductForm({ ...newProductForm, stock: e.target.value })}
                  />
                </div>

                <div className="admin-form-group">
                  <label>Initial Status</label>
                  <select
                    className="admin-form-input"
                    value={newProductForm.status}
                    onChange={(e) => setNewProductForm({ ...newProductForm, status: e.target.value })}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="admin-form-group">
                <label>Image URL</label>
                <input
                  type="url"
                  className="admin-form-input"
                  placeholder="https://images.unsplash.com/..."
                  value={newProductForm.image}
                  onChange={(e) => setNewProductForm({ ...newProductForm, image: e.target.value })}
                />
              </div>

              <div className="admin-form-group">
                <label>Description</label>
                <textarea
                  className="admin-form-textarea"
                  rows="3"
                  placeholder="Product specs, ingredients, or fitness benefits..."
                  value={newProductForm.description}
                  onChange={(e) => setNewProductForm({ ...newProductForm, description: e.target.value })}
                />
              </div>

              <div className="admin-modal-actions">
                <button
                  type="button"
                  className="btn-admin-cancel"
                  onClick={() => setAddProductModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-admin-primary">
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT PRODUCT MODAL */}
      {editProductModal && (
        <div className="admin-modal-overlay" onClick={() => setEditProductModal(null)}>
          <div className="admin-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>Edit Product: {editProductModal.name}</h3>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setEditProductModal(null)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSaveEdit}>
              <div className="admin-form-group">
                <label>Product Name</label>
                <input
                  type="text"
                  className="admin-form-input"
                  required
                  value={editProductModal.name}
                  onChange={(e) => setEditProductModal({ ...editProductModal, name: e.target.value })}
                />
              </div>

              <div className="admin-form-row-2">
                <div className="admin-form-group">
                  <label>Category</label>
                  <select
                    className="admin-form-input"
                    value={editProductModal.category}
                    onChange={(e) => setEditProductModal({ ...editProductModal, category: e.target.value })}
                  >
                    <option value="Supplements">Supplements</option>
                    <option value="Gear">Gear</option>
                    <option value="Equipment">Equipment</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                </div>

                <div className="admin-form-group">
                  <label>Price (₹ INR)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="admin-form-input"
                    required
                    value={editProductModal.price}
                    onChange={(e) => setEditProductModal({ ...editProductModal, price: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="admin-form-row-2">
                <div className="admin-form-group">
                  <label>Stock Count</label>
                  <input
                    type="number"
                    min="0"
                    className="admin-form-input"
                    required
                    value={editProductModal.stock}
                    onChange={(e) => setEditProductModal({ ...editProductModal, stock: parseInt(e.target.value, 10) || 0 })}
                  />
                </div>

                <div className="admin-form-group">
                  <label>Status</label>
                  <select
                    className="admin-form-input"
                    value={editProductModal.status}
                    onChange={(e) => setEditProductModal({ ...editProductModal, status: e.target.value })}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="admin-form-group">
                <label>Image URL</label>
                <input
                  type="url"
                  className="admin-form-input"
                  value={editProductModal.image}
                  onChange={(e) => setEditProductModal({ ...editProductModal, image: e.target.value })}
                />
              </div>

              <div className="admin-form-group">
                <label>Description</label>
                <textarea
                  className="admin-form-textarea"
                  rows="3"
                  value={editProductModal.description}
                  onChange={(e) => setEditProductModal({ ...editProductModal, description: e.target.value })}
                />
              </div>

              <div className="admin-modal-actions">
                <button
                  type="button"
                  className="btn-admin-cancel"
                  onClick={() => setEditProductModal(null)}
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
        isOpen={Boolean(deleteTargetProduct)}
        title="Delete Product"
        message={`Are you sure you want to remove "${deleteTargetProduct?.name}" from the inventory? This will take it down from the MacroPace Store immediately.`}
        confirmText="Delete Product"
        confirmVariant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTargetProduct(null)}
      />
    </div>
  );
}
