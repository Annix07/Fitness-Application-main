import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuthModal } from '../../context/AuthModalContext';
import { addNewOrder } from '../../data/orderHistoryData';
import api from '../../services/api';
import {
  IconShoppingBag,
  IconShield,
  IconLock,
  IconUtensils,
  IconDumbbell,
  IconReceipt,
} from '../../components/common/Icons';
import '../../styles/CheckoutPage.css';

export default function CheckoutPage() {
  const { user } = useAuthModal();
  const { cartItems, cartCount, cartSubtotal, clearCart, showToast } = useCart();

  // Shipping & Contact Address Form
  const [shippingAddress, setShippingAddress] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: '',
    street: '',
    apartment: '',
    city: '',
    state: '',
    zip: '',
    country: 'United States',
  });

  useEffect(() => {
    if (user) {
      setShippingAddress((prev) => ({
        ...prev,
        fullName: prev.fullName || user.name || (user.email ? user.email.split('@')[0] : ''),
        email: prev.email || user.email || '',
      }));
    }
  }, [user]);

  // Payment Selection State
  const [paymentMethod, setPaymentMethod] = useState('card');

  // Promo Code State
  const [promoCode, setPromoCode] = useState('');
  const [discountPct, setDiscountPct] = useState(0);

  // Processing & Confirmation State
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Calculations
  const shippingFee = cartSubtotal >= 50 ? 0 : 4.99;
  const discountAmount = parseFloat((cartSubtotal * discountPct).toFixed(2));
  const taxableAmount = Math.max(0, cartSubtotal - discountAmount);
  const taxAmount = parseFloat((taxableAmount * 0.08).toFixed(2));
  const grandTotal = parseFloat((taxableAmount + shippingFee + taxAmount).toFixed(2));

  // Address change helper
  const handleAddressChange = (field, val) => {
    setShippingAddress((prev) => ({ ...prev, [field]: val }));
  };

  // Promo Code Handler
  const handleApplyPromo = (e) => {
    e.preventDefault();
    if (promoCode.trim().toUpperCase() === 'MACRO10' || promoCode.trim().toUpperCase() === 'PACE10') {
      setDiscountPct(0.1);
      showToast('10% Discount Applied!');
    } else if (promoCode.trim().toUpperCase() === 'PRO20') {
      setDiscountPct(0.2);
      showToast('20% Athlete VIP Discount Applied!');
    } else {
      showToast('Invalid Promo Code. Try "MACRO10"');
    }
  };

  // Direct Order Submission to MySQL
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (user?.role === 'admin') {
      setErrorMsg('Administrators cannot place store orders. Please use a customer account.');
      return;
    }

    if (
      !shippingAddress.fullName.trim() ||
      !shippingAddress.email.trim() ||
      !shippingAddress.street.trim() ||
      !shippingAddress.city.trim() ||
      !shippingAddress.zip.trim()
    ) {
      setErrorMsg('Please complete all required shipping address fields.');
      return;
    }

    setIsProcessing(true);

    try {
      const formattedAddress = `${shippingAddress.street}, ${shippingAddress.apartment ? shippingAddress.apartment + ', ' : ''}${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.zip}, ${shippingAddress.country}`;

      const res = await api.post('/store/checkout', {
        items: cartItems.map((item) => ({
          id: item.productId || item.id,
          productId: item.productId || item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
        totalAmount: grandTotal,
        shippingAddress: formattedAddress,
        phone: shippingAddress.phone,
        paymentMethod:
          paymentMethod === 'card'
            ? 'Credit Card'
            : paymentMethod === 'upi'
              ? 'UPI / QR'
              : 'Cash on Delivery',
      });

      const orderId = res.orderId || `MP-${Math.floor(10000 + Math.random() * 90000)}`;

      const newOrder = {
        id: orderId,
        orderDate: new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
        deliveredDate: new Date(Date.now() + 4 * 86400000).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
        status: 'PROCESSING',
        trackingNumber: `TRK-${Math.floor(10000000000 + Math.random() * 90000000000)}`,
        subtotal: cartSubtotal,
        shipping: shippingFee,
        discount: discountAmount,
        tax: taxAmount,
        total: grandTotal,
        paymentMethod:
          paymentMethod === 'card'
            ? 'Credit Card'
            : paymentMethod === 'upi'
              ? 'UPI / QR'
              : 'Cash on Delivery (COD)',
        shippingAddress: { ...shippingAddress },
        items: cartItems.map((item) => ({
          id: item.id,
          name: item.name,
          flavor: item.flavor,
          size: item.size,
          quantity: item.quantity,
          unitPrice: item.price,
          category: item.category === 'supplements' ? 'Supplements' : 'Gear & Equipment',
        })),
      };

      addNewOrder(newOrder);
      setConfirmedOrder(newOrder);
      clearCart();
      setIsProcessing(false);
      showToast('Order Placed Successfully! Receipt generated.');
    } catch (err) {
      setIsProcessing(false);
      setErrorMsg(err.message || 'Failed to process order.');
    }
  };

  // ──────────────────────────────────────────────────────────
  // VIEW 1: ORDER CONFIRMED / SUCCESS SCREEN
  // ──────────────────────────────────────────────────────────
  if (confirmedOrder) {
    return (
      <main className="checkout-page">
        <div className="checkout-glow-1" aria-hidden="true" />
        <div className="checkout-glow-2" aria-hidden="true" />

        <div className="checkout-container">
          <div className="order-success-card">
            <div className="success-icon-badge">✓</div>

            <h1>Order Confirmed &amp; Placed!</h1>

            <p className="lead">
              Thank you, <strong>{confirmedOrder.shippingAddress.fullName}</strong>! Your order has been placed directly and sent to our logistics team for priority dispatch.
            </p>

            {/* Quick Meta Strip */}
            <div className="order-meta-pill-strip">
              <div className="order-meta-pill">
                Order ID: <strong>#{confirmedOrder.id}</strong>
              </div>
              <div className="order-meta-pill">
                Date: <strong>{confirmedOrder.orderDate}</strong>
              </div>
              <div className="order-meta-pill">
                Tracking: <strong>{confirmedOrder.trackingNumber}</strong>
              </div>
              <div className="order-meta-pill">
                Est. Delivery: <strong>{confirmedOrder.deliveredDate}</strong>
              </div>
            </div>

            {/* Order Receipt Box */}
            <div className="confirmation-receipt-box">
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px', marginBottom: '12px' }}>
                <span style={{ fontWeight: 800, color: '#0f172a' }}>Shipping Destination</span>
                <span style={{ fontWeight: 800, color: '#0284c7' }}>₹{confirmedOrder.total.toFixed(2)} Paid</span>
              </div>

              <div style={{ fontSize: '0.86rem', color: '#475569', lineHeight: 1.6 }}>
                <div>{confirmedOrder.shippingAddress.street}, {confirmedOrder.shippingAddress.apartment}</div>
                <div>{confirmedOrder.shippingAddress.city}, {confirmedOrder.shippingAddress.state} {confirmedOrder.shippingAddress.zip}, {confirmedOrder.shippingAddress.country}</div>
                <div style={{ marginTop: '4px', color: '#64748b' }}>Payment Mode: {confirmedOrder.paymentMethod}</div>
              </div>

              {/* Items list */}
              <div style={{ marginTop: '14px', paddingTop: '10px', borderTop: '1px solid #f1f5f9' }}>
                {confirmedOrder.items.map((item) => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', padding: '4px 0' }}>
                    <span>{item.name} ({item.flavor} · Qty: {item.quantity})</span>
                    <strong style={{ color: '#0f172a' }}>₹{(item.unitPrice * item.quantity).toFixed(2)}</strong>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="confirmation-actions">
              <Link to="/settings" className="btn btn-primary">
                <IconReceipt size={16} />
                <span>View in Account Orders</span>
              </Link>

              <button
                type="button"
                className="btn btn-outline"
                onClick={() => window.print?.()}
              >
                <IconReceipt size={16} />
                <span>Print Invoice</span>
              </button>

              <Link to="/store" className="btn btn-outline">
                <IconShoppingBag size={16} />
                <span>Continue Shopping</span>
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // ──────────────────────────────────────────────────────────
  // VIEW 1.5: ADMIN ACCESS RESTRICTION
  // ──────────────────────────────────────────────────────────
  if (user?.role === 'admin') {
    return (
      <main className="checkout-page">
        <div className="checkout-glow-1" aria-hidden="true" />
        <div className="checkout-glow-2" aria-hidden="true" />

        <div className="checkout-container" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div className="checkout-section-card" style={{ maxWidth: '560px', margin: '0 auto', textAlign: 'center' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: '#fef2f2',
              color: '#ef4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}>
              <IconShield size={32} />
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 800, margin: '12px 0 6px', color: '#0f172a' }}>
              Administrator Notice
            </h2>
            <p style={{ color: '#475569', fontSize: '0.94rem', lineHeight: 1.6, marginBottom: '24px' }}>
              Only customer accounts are permitted to place store orders. Administrators manage products, telemetry, and customer fulfillment through the Admin Portal.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/admin" className="btn btn-primary">
                Return to Admin Portal
              </Link>
              <Link to="/store" className="btn btn-secondary">
                View Store Catalog
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // ──────────────────────────────────────────────────────────
  // VIEW 2: EMPTY CART STATE
  // ──────────────────────────────────────────────────────────
  if (cartItems.length === 0) {
    return (
      <main className="checkout-page">
        <div className="checkout-glow-1" aria-hidden="true" />
        <div className="checkout-glow-2" aria-hidden="true" />

        <div className="checkout-container" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div className="checkout-section-card" style={{ maxWidth: '540px', margin: '0 auto', textAlign: 'center' }}>
            <IconShoppingBag size={48} color="#0284c7" />
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 800, margin: '12px 0 6px' }}>
              Your Shopping Cart is Empty
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.92rem', marginBottom: '20px' }}>
              You don&apos;t have any supplements or workout gear in your cart to checkout.
            </p>
            <Link to="/store" className="btn btn-primary" style={{ margin: '0 auto' }}>
              Browse MacroPace Store
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // ──────────────────────────────────────────────────────────
  // VIEW 3: CHECKOUT FORM & SUMMARY
  // ──────────────────────────────────────────────────────────
  return (
    <main className="checkout-page">
      <div className="checkout-glow-1" aria-hidden="true" />
      <div className="checkout-glow-2" aria-hidden="true" />

      <div className="checkout-container">
        {/* Header & Breadcrumb */}
        <header className="checkout-header">
          <nav className="checkout-breadcrumb" aria-label="Breadcrumb">
            <Link to="/store">Store</Link>
            <span>/</span>
            <span>Checkout</span>
          </nav>

          <h1>
            Express <em className="text-highlight">Checkout</em>
          </h1>
        </header>

        {errorMsg && (
          <div style={{
            padding: '12px 18px',
            borderRadius: '8px',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#dc2626',
            fontSize: '0.88rem',
            fontWeight: 600,
            marginBottom: '20px',
          }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handlePlaceOrder} className="checkout-main-grid">
          {/* ──────────────────────────────────────────────────────────
              LEFT COLUMN: SHIPPING ADDRESS & PAYMENT SELECTION
             ────────────────────────────────────────────────────────── */}
          <div className="checkout-left-col">
            {/* Step 1: Shipping Address */}
            <section className="checkout-section-card">
              <div className="checkout-card-header">
                <span className="checkout-step-badge">1</span>
                <h2>Shipping &amp; Delivery Address</h2>
              </div>

              <div className="checkout-form-grid">
                <div className="checkout-field">
                  <label htmlFor="chk-name">Full Name *</label>
                  <input
                    id="chk-name"
                    type="text"
                    placeholder="Alex Morgan"
                    value={shippingAddress.fullName}
                    onChange={(e) => handleAddressChange('fullName', e.target.value)}
                    required
                  />
                </div>

                <div className="checkout-field">
                  <label htmlFor="chk-email">Email Address *</label>
                  <input
                    id="chk-email"
                    type="email"
                    placeholder="alex@macropace.com"
                    value={shippingAddress.email}
                    onChange={(e) => handleAddressChange('email', e.target.value)}
                    required
                  />
                </div>

                <div className="checkout-field full-width">
                  <label htmlFor="chk-street">Street Address *</label>
                  <input
                    id="chk-street"
                    type="text"
                    placeholder="742 Evergreen Terrace"
                    value={shippingAddress.street}
                    onChange={(e) => handleAddressChange('street', e.target.value)}
                    required
                  />
                </div>

                <div className="checkout-field">
                  <label htmlFor="chk-apt">Apartment / Suite (Optional)</label>
                  <input
                    id="chk-apt"
                    type="text"
                    placeholder="Apt 4B"
                    value={shippingAddress.apartment}
                    onChange={(e) => handleAddressChange('apartment', e.target.value)}
                  />
                </div>

                <div className="checkout-field">
                  <label htmlFor="chk-city">City *</label>
                  <input
                    id="chk-city"
                    type="text"
                    placeholder="San Francisco"
                    value={shippingAddress.city}
                    onChange={(e) => handleAddressChange('city', e.target.value)}
                    required
                  />
                </div>

                <div className="checkout-field">
                  <label htmlFor="chk-state">State / Province *</label>
                  <input
                    id="chk-state"
                    type="text"
                    placeholder="CA"
                    value={shippingAddress.state}
                    onChange={(e) => handleAddressChange('state', e.target.value)}
                    required
                  />
                </div>

                <div className="checkout-field">
                  <label htmlFor="chk-zip">ZIP / Postal Code *</label>
                  <input
                    id="chk-zip"
                    type="text"
                    placeholder="94107"
                    value={shippingAddress.zip}
                    onChange={(e) => handleAddressChange('zip', e.target.value)}
                    required
                  />
                </div>
              </div>
            </section>

            {/* Step 2: Payment Method (Direct Simulation) */}
            <section className="checkout-section-card">
              <div className="checkout-card-header">
                <span className="checkout-step-badge">2</span>
                <h2>Payment Method</h2>
              </div>

              <div className="payment-methods-stack">
                {/* Option 1: Simulated Card */}
                <div
                  className={`payment-option-pill ${paymentMethod === 'card' ? 'selected' : ''}`}
                  onClick={() => setPaymentMethod('card')}
                >
                  <div className="payment-pill-left">
                    <div className="payment-radio-circle">
                      {paymentMethod === 'card' && <span className="payment-radio-inner-dot" />}
                    </div>
                    <div className="payment-title-group">
                      <h4>Credit / Debit Card </h4>
                      <p>Instant secure mock processing without 3rd party redirect</p>
                    </div>
                  </div>
                  <span className="payment-badge-tag">Fast Checkout</span>
                </div>

                {/* Option 2: Cash on Delivery */}
                <div
                  className={`payment-option-pill ${paymentMethod === 'cod' ? 'selected' : ''}`}
                  onClick={() => setPaymentMethod('cod')}
                >
                  <div className="payment-pill-left">
                    <div className="payment-radio-circle">
                      {paymentMethod === 'cod' && <span className="payment-radio-inner-dot" />}
                    </div>
                    <div className="payment-title-group">
                      <h4>Cash on Delivery (COD)</h4>
                      <p>Pay cash or card upon package delivery at your doorstep</p>
                    </div>
                  </div>
                  <span className="payment-badge-tag">Pay on Arrival</span>
                </div>

                {/* Option 3: UPI */}
                <div
                  className={`payment-option-pill ${paymentMethod === 'upi' ? 'selected' : ''}`}
                  onClick={() => setPaymentMethod('upi')}
                >
                  <div className="payment-pill-left">
                    <div className="payment-radio-circle">
                      {paymentMethod === 'upi' && <span className="payment-radio-inner-dot" />}
                    </div>
                    <div className="payment-title-group">
                      <h4>UPI / QR Pay</h4>
                      <p>Instant simulated UPI &amp; Mobile Banking authorization</p>
                    </div>
                  </div>
                  <span className="payment-badge-tag">UPI Direct</span>
                </div>
              </div>

              <div className="payment-direct-notice">
                <IconShield size={18} color="#166534" />
                <span>
                  <strong>Direct Placement Mode Enabled:</strong> Clicking <em>Pay &amp; Place Order</em> confirms and logs your order immediately into your MacroPace order history.
                </span>
              </div>
            </section>
          </div>

          {/* ──────────────────────────────────────────────────────────
              RIGHT COLUMN: STICKY ORDER SUMMARY
             ────────────────────────────────────────────────────────── */}
          <aside className="checkout-summary-sidebar">
            <h3 className="summary-title">Order Summary ({cartCount})</h3>

            <div className="summary-items-list">
              {cartItems.map((item) => (
                <div className="summary-item-row" key={item.id}>
                  <div className="summary-item-left">
                    <div className="summary-item-img-placeholder">
                      {item.category === 'supplements' ? (
                        <IconUtensils size={18} />
                      ) : (
                        <IconDumbbell size={18} />
                      )}
                    </div>
                    <div className="summary-item-info">
                      <h4>{item.name}</h4>
                      <span>{item.flavor} · Qty: {item.quantity}</span>
                    </div>
                  </div>

                  <div className="summary-item-price">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            {/* Promo Code Form */}
            <div className="summary-promo-form">
              <input
                type="text"
                placeholder="Promo Code (Try 'MACRO10')"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
              />
              <button type="button" onClick={handleApplyPromo}>
                Apply
              </button>
            </div>

            {/* Totals Breakdown */}
            <div className="summary-totals-block">
              <div className="summary-row">
                <span>Subtotal</span>
                <span>₹{cartSubtotal.toFixed(2)}</span>
              </div>

              {discountPct > 0 && (
                <div className="summary-row discount">
                  <span>Promo Discount ({(discountPct * 100).toFixed(0)}%)</span>
                  <span>-₹{discountAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="summary-row">
                <span>Standard Shipping</span>
                <span>{shippingFee === 0 ? 'FREE' : `₹${shippingFee.toFixed(2)}`}</span>
              </div>

              <div className="summary-row">
                <span>Estimated Tax (8%)</span>
                <span>₹{taxAmount.toFixed(2)}</span>
              </div>

              <div className="summary-row grand-total">
                <span>Total Amount</span>
                <span style={{ color: '#0284c7' }}>₹{grandTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Pay & Place Order CTA */}
            <button
              type="submit"
              className="btn-place-order"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <span className="auth-spinner" />
                  <span>Processing Order...</span>
                </>
              ) : (
                <>
                  <IconLock size={18} />
                  <span>Pay ₹{grandTotal.toFixed(2)} &amp; Place Order</span>
                </>
              )}
            </button>
          </aside>
        </form>
      </div>
    </main>
  );
}
