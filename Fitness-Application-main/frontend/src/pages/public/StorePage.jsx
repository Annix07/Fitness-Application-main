import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuthModal } from '../../context/AuthModalContext';
import {
  STORE_CATEGORIES,
  SUB_CATEGORIES,
  DIETARY_TAGS,
  STORE_PRODUCTS,
} from '../../data/storeDatabase';
import api from '../../services/api';
import {
  IconShoppingBag,
  IconSearch,
  IconFilter,
  IconCheck,
  IconUtensils,
  IconDumbbell,
  IconPlus,
  IconTrash,
} from '../../components/common/Icons';
import '../../styles/StorePage.css';

export default function StorePage() {
  const navigate = useNavigate();
  const { user } = useAuthModal();
  const {
    cartItems,
    cartCount,
    cartSubtotal,
    isCartOpen,
    setIsCartOpen,
    addToCart,
    removeFromCart,
    updateQuantity,
    toastMessage,
    showToast,
  } = useCart();

  const [productsList, setProductsList] = useState(STORE_PRODUCTS);

  useEffect(() => {
    const fetchLiveProducts = async () => {
      try {
        const res = await api.get('/store/products');
        if (res.success && Array.isArray(res.products) && res.products.length > 0) {
          const merged = STORE_PRODUCTS.map((local) => {
            const dbMatch = res.products.find((p) => p.id === local.id);
            if (dbMatch) {
              return {
                ...local,
                stock: dbMatch.stock !== undefined ? dbMatch.stock : local.stock,
                price: dbMatch.price !== undefined ? dbMatch.price : local.price,
                name: dbMatch.name || local.name,
              };
            }
            return local;
          });

          const newAdminProducts = res.products
            .filter((dbP) => !STORE_PRODUCTS.some((l) => l.id === dbP.id))
            .map((p) => ({
              id: p.id,
              name: p.name,
              category: p.category ? p.category.toLowerCase() : 'supplements',
              subCategory: 'general',
              price: p.price,
              rating: 4.9,
              reviewsCount: 14,
              stock: p.stock,
              image: p.image || '',
              shortDesc: p.description || p.name,
              tags: ['New', 'Featured'],
            }));

          setProductsList([...merged, ...newAdminProducts]);
        }
      } catch (err) {
        console.error('Failed to fetch live products:', err);
      }
    };
    fetchLiveProducts();
  }, []);

  // Filter States
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubCategories, setSelectedSubCategories] = useState([]);
  const [maxPrice, setMaxPrice] = useState(25000);
  const [selectedTags, setSelectedTags] = useState([]);
  const [sortBy, setSortBy] = useState('featured');


  // Promo Code State
  const [promoCode, setPromoCode] = useState('');
  const [discountPct, setDiscountPct] = useState(0);

  // Toggle Subcategory Checkbox
  const handleToggleSubCategory = (subId) => {
    setSelectedSubCategories((prev) =>
      prev.includes(subId) ? prev.filter((id) => id !== subId) : [...prev, subId]
    );
  };

  // Toggle Tag Checkbox
  const handleToggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  // Reset Filters
  const handleResetFilters = () => {
    setActiveCategory('all');
    setSearchTerm('');
    setSelectedSubCategories([]);
    setMaxPrice(350);
    setSelectedTags([]);
    setSortBy('featured');
  };

  // Active Filter Count
  const activeFiltersCount =
    (activeCategory !== 'all' ? 1 : 0) +
    (searchTerm.trim() ? 1 : 0) +
    selectedSubCategories.length +
    (maxPrice < 350 ? 1 : 0) +
    selectedTags.length;

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    let list = [...productsList];

    // 1. Category Filter
    if (activeCategory !== 'all') {
      list = list.filter((p) => p.category === activeCategory);
    }

    // 2. Search Keyword
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.shortDesc.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q)) ||
          (p.flavors && p.flavors.some((f) => f.toLowerCase().includes(q)))
      );
    }

    // 3. Subcategories
    if (selectedSubCategories.length > 0) {
      list = list.filter((p) => selectedSubCategories.includes(p.subCategory));
    }

    // 4. Max Price
    list = list.filter((p) => p.price <= maxPrice);

    // 5. Tags
    if (selectedTags.length > 0) {
      list = list.filter((p) => selectedTags.some((tag) => p.tags.includes(tag)));
    }

    // 6. Sorting
    switch (sortBy) {
      case 'price_low':
        list.sort((a, b) => a.price - b.price);
        break;
      case 'price_high':
        list.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        list.sort((a, b) => b.rating - a.rating);
        break;
      case 'reviews':
        list.sort((a, b) => b.reviewsCount - a.reviewsCount);
        break;
      default:
        break;
    }

    return list;
  }, [activeCategory, searchTerm, selectedSubCategories, maxPrice, selectedTags, sortBy]);


  // Promo Code Submit
  const handleApplyPromo = (e) => {
    e.preventDefault();
    if (promoCode.trim().toUpperCase() === 'MACRO10' || promoCode.trim().toUpperCase() === 'PACE10') {
      setDiscountPct(0.1);
      showToast('10% Discount Applied Successfully!');
    } else if (promoCode.trim().toUpperCase() === 'PRO20') {
      setDiscountPct(0.2);
      showToast('20% VIP Athlete Discount Applied!');
    } else {
      showToast('Invalid Promo Code. Try "MACRO10"');
    }
  };

  const discountAmount = parseFloat((cartSubtotal * discountPct).toFixed(2));
  const finalTotal = parseFloat((Math.max(0, cartSubtotal - discountAmount)).toFixed(2));

  // Handle Checkout
  const handleCheckout = () => {
    if (cartItems.length === 0) return;
    if (user?.role === 'admin') {
      showToast('Administrators cannot place orders. Please use a customer account.');
      return;
    }
    setIsCartOpen(false);
    navigate('/checkout');
  };

  return (
    <main className="store-page">
      {/* Ambient background glows */}
      <div className="store-glow-1" aria-hidden="true" />
      <div className="store-glow-2" aria-hidden="true" />

      <div className="store-page-container">
        {/* ── Store Hero Header ── */}
        <section className="store-hero">
          <div className="store-hero__content">

            <h1>
              Fuel Your Ambition. <br />
              <em className="text-highlight">Gear Up for Greatness.</em>
            </h1>

            <p className="lead">
              Clinical-grade gym supplements and heavy-duty training equipment engineered to accelerate muscle recovery and strength progression.
            </p>
          </div>
        </section>

        {/* ── Store Main Layout (Sidebar + Results) ── */}
        <div className="store-main-layout">
          {/* ──────────────────────────────────────────────────────────
              LEFT SIDEBAR: COMPREHENSIVE FILTER ENGINE
             ────────────────────────────────────────────────────────── */}
          <aside className="store-sidebar">
            <div className="sidebar-header-row">
              <h3>
                <IconFilter size={18} color="#0284c7" />
                <span>Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}</span>
              </h3>
              {activeFiltersCount > 0 && (
                <button
                  type="button"
                  className="btn-reset-filters"
                  onClick={handleResetFilters}
                >
                  Reset All
                </button>
              )}
            </div>

            {/* Search Input */}
            <div className="sidebar-search-box">
              <span className="search-icon">
                <IconSearch size={16} />
              </span>
              <input
                type="text"
                placeholder="Search supplements, gear..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                aria-label="Search Store Products"
              />
            </div>

            {/* Category Filter */}
            <div className="filter-block">
              <span className="filter-block-title">Product Category</span>
              <div className="category-nav-list">
                {STORE_CATEGORIES.map((cat) => {
                  const count =
                    cat.id === 'all'
                      ? STORE_PRODUCTS.length
                      : STORE_PRODUCTS.filter((p) => p.category === cat.id).length;

                  return (
                    <button
                      key={cat.id}
                      type="button"
                      className={`category-nav-btn ${activeCategory === cat.id ? 'active' : ''}`}
                      onClick={() => {
                        setActiveCategory(cat.id);
                        setSelectedSubCategories([]);
                      }}
                    >
                      <span>{cat.label}</span>
                      <span className="category-count-badge">{count}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sub-Category Filter (Supplements or Equipment) */}
            {(activeCategory === 'supplements' || activeCategory === 'all') && (
              <div className="filter-block">
                <span className="filter-block-title">Supplements Sub-Types</span>
                <div className="filter-checkbox-list">
                  {SUB_CATEGORIES.supplements.map((sub) => (
                    <label key={sub.id} className="filter-checkbox-label">
                      <input
                        type="checkbox"
                        checked={selectedSubCategories.includes(sub.id)}
                        onChange={() => handleToggleSubCategory(sub.id)}
                      />
                      <span>{sub.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {(activeCategory === 'equipment' || activeCategory === 'all') && (
              <div className="filter-block">
                <span className="filter-block-title">Equipment Sub-Types</span>
                <div className="filter-checkbox-list">
                  {SUB_CATEGORIES.equipment.map((sub) => (
                    <label key={sub.id} className="filter-checkbox-label">
                      <input
                        type="checkbox"
                        checked={selectedSubCategories.includes(sub.id)}
                        onChange={() => handleToggleSubCategory(sub.id)}
                      />
                      <span>{sub.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Price Range Filter */}
            <div className="filter-block">
              <span className="filter-block-title">Max Price: ₹{maxPrice.toLocaleString('en-IN')}</span>
              <div className="price-range-wrap">
                <input
                  type="range"
                  min="1000"
                  max="25000"
                  step="250"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="price-range-slider"
                />
                <div className="price-range-labels">
                  <span>₹1,000</span>
                  <span>₹25,000</span>
                </div>
              </div>
            </div>

            {/* Dietary & Performance Badges */}
            <div className="filter-block">
              <span className="filter-block-title">Special Features &amp; Quality</span>
              <div className="filter-checkbox-list">
                {DIETARY_TAGS.map((tag) => (
                  <label key={tag} className="filter-checkbox-label">
                    <input
                      type="checkbox"
                      checked={selectedTags.includes(tag)}
                      onChange={() => handleToggleTag(tag)}
                    />
                    <span>{tag}</span>
                  </label>
                ))}
              </div>
            </div>
          </aside>

          {/* ──────────────────────────────────────────────────────────
              RIGHT SECTION: RESULTS TOOLBAR & PRODUCT CARDS GRID
             ────────────────────────────────────────────────────────── */}
          <section className="store-results-container">
            {/* Top Toolbar */}
            <div className="store-toolbar">
              <span className="results-count-text">
                Showing <strong>{filteredProducts.length}</strong> of {STORE_PRODUCTS.length} Products
              </span>

              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                <div className="store-sort-group">
                  <label htmlFor="store-sort-select">Sort by:</label>
                  <select
                    id="store-sort-select"
                    className="store-sort-select"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="featured">Featured &amp; Recommended</option>
                    <option value="price_low">Price: Low to High</option>
                    <option value="price_high">Price: High to Low</option>
                    <option value="rating">Highest Rated</option>
                    <option value="reviews">Most Popular (Reviews)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            {filteredProducts.length > 0 ? (
              <div className="products-grid">
                {filteredProducts.map((prod) => {
                  const isSupp = prod.category === 'supplements';
                  const defaultFlavor = prod.flavors ? prod.flavors[0] : '';
                  const defaultSize = prod.sizes ? prod.sizes[0] : '';

                  return (
                    <article className="product-card" key={prod.id}>
                      {/* Top Box with Product Image */}
                      <div className="product-thumbnail-box">
                        <span className="product-category-tag">
                          {isSupp ? 'Supplement' : 'Gym Gear'}
                        </span>

                        {prod.image ? (
                          <img
                            src={prod.image}
                            alt={prod.name}
                            className="product-card-img"
                            loading="lazy"
                          />
                        ) : (
                          <div className="product-icon-graphic">
                            {isSupp ? <IconUtensils size={34} /> : <IconDumbbell size={34} />}
                          </div>
                        )}
                      </div>

                      {/* Information Block */}
                      <div className="product-info-block">
                        <div className="product-rating-row">
                          <span>★ {prod.rating}</span>
                          <span className="reviews-count">({prod.reviewsCount} reviews)</span>
                        </div>

                        <h3 className="product-title">{prod.name}</h3>

                        <p className="product-shortDesc product-short-desc">
                          {prod.shortDesc}
                        </p>

                        <div className="product-tags-row">
                          {prod.tags.slice(0, 3).map((tag) => (
                            <span key={tag} className="product-tag-chip">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Price & Action Row */}
                      <div className="product-card-footer">
                        <div className="product-price-box">
                          <span className="product-price-current">₹{prod.price.toFixed(2)}</span>
                          {prod.originalPrice > prod.price && (
                            <span className="product-price-orig">₹{prod.originalPrice.toFixed(2)}</span>
                          )}
                        </div>

                        <button
                          type="button"
                          className="btn-card-add"
                          onClick={() =>
                            addToCart(prod, { flavor: defaultFlavor, size: defaultSize, quantity: 1 })
                          }
                          title="Add to Cart"
                        >
                          <IconPlus size={14} />
                          <span>Add</span>
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              /* Empty Results State */
              <div className="store-empty-results">
                <IconShoppingBag size={48} color="#94a3b8" />
                <h3>No Products Found</h3>
                <p>
                  No items matched your current filter criteria. Try adjusting your search term or clearing the active filters.
                </p>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleResetFilters}
                >
                  Reset All Filters
                </button>
              </div>
            )}
          </section>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────
          SLIDE-OUT SHOPPING CART DRAWER
         ────────────────────────────────────────────────────────── */}
      {isCartOpen && (
        <div
          className="cart-drawer-backdrop"
          onClick={() => setIsCartOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="cart-drawer-panel"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="cart-drawer-header">
              <h3>
                <IconShoppingBag size={20} color="#0284c7" />
                <span>Your Cart ({cartCount})</span>
              </h3>
              <button
                type="button"
                className="btn-close-modal"
                onClick={() => setIsCartOpen(false)}
                aria-label="Close cart drawer"
              >
                ✕
              </button>
            </div>

            {/* Free Shipping Banner */}
            <div style={{
              background: '#f0f9ff',
              borderBottom: '1px solid #e0f2fe',
              padding: '10px 24px',
              fontSize: '0.82rem',
              color: '#0284c7',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <span>
                {cartSubtotal >= 50
                  ? 'Free Shipping Unlocked!'
                  : `Add ₹${(50 - cartSubtotal).toFixed(2)} more for FREE Shipping!`}
              </span>
              <span>Threshold: ₹50</span>
            </div>

            {/* Cart Items List */}
            <div className="cart-drawer-items-list">
              {cartItems.length > 0 ? (
                cartItems.map((item) => (
                  <div className="cart-item-row" key={item.id}>
                    <div className="cart-item-img">
                      {item.category === 'supplements' ? (
                        <IconUtensils size={22} />
                      ) : (
                        <IconDumbbell size={22} />
                      )}
                    </div>

                    <div className="cart-item-info">
                      <h4 className="cart-item-title">{item.name}</h4>
                      <span className="cart-item-variant">
                        {item.flavor} · {item.size}
                      </span>

                      <div className="cart-item-bottom">
                        <div className="cart-qty-stepper">
                          <button
                            type="button"
                            className="btn-qty"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            aria-label="Decrease quantity"
                          >
                            -
                          </button>
                          <span className="qty-val">{item.quantity}</span>
                          <button
                            type="button"
                            className="btn-qty"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>

                        <span className="cart-item-price">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </span>

                        <button
                          type="button"
                          className="btn-reset-filters"
                          style={{ color: '#ef4444', padding: '2px 6px' }}
                          onClick={() => removeFromCart(item.id)}
                          title="Remove item"
                        >
                          <IconTrash size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 10px', color: '#64748b' }}>
                  <IconShoppingBag size={36} color="#cbd5e1" />
                  <p style={{ marginTop: '8px', fontSize: '0.9rem' }}>Your shopping cart is empty.</p>
                </div>
              )}
            </div>

            {/* Cart Footer */}
            {cartItems.length > 0 && (
              <div className="cart-drawer-footer">
                {/* Promo Code Box */}
                <form onSubmit={handleApplyPromo} style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    placeholder="Promo Code (Try 'MACRO10')"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.82rem',
                    }}
                  />
                  <button
                    type="submit"
                    className="btn-settings-secondary"
                    style={{ padding: '8px 14px' }}
                  >
                    Apply
                  </button>
                </form>

                {discountPct > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#10b981', fontWeight: 700 }}>
                    <span>Discount ({(discountPct * 100).toFixed(0)}%)</span>
                    <span>-₹{discountAmount.toFixed(2)}</span>
                  </div>
                )}

                <div className="cart-subtotal-row">
                  <span>Estimated Total</span>
                  <span style={{ color: '#0284c7' }}>₹{finalTotal.toFixed(2)}</span>
                </div>

                <button
                  type="button"
                  className="btn-checkout-submit"
                  onClick={handleCheckout}
                >
                  Proceed to Secure Checkout
                </button>
              </div>
            )}
          </div>
        </div>
      )}



      {/* Toast Alert */}
      {toastMessage && (
        <div className="toast-notification">
          <IconCheck size={18} color="#10b981" />
          <span>{toastMessage}</span>
        </div>
      )}
    </main>
  );
}
