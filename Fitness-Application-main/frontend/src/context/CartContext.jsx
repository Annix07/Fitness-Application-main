import { createContext, useContext, useState, useEffect } from 'react';
import { useAuthModal } from './AuthModalContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { isAuthenticated, openModal, user } = useAuthModal();
  const userId = user?.id || user?.email || null;
  const isCustomer = !!user && user.role !== 'admin';

  const getUserCartKey = (uid) => (uid ? `macropace_cart_${uid}` : null);

  const [cartItems, setCartItems] = useState(() => {
    if (isCustomer && userId) {
      try {
        const saved = localStorage.getItem(getUserCartKey(userId));
        if (saved) return JSON.parse(saved);
      } catch { }
    }
    return [];
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [pendingItem, setPendingItem] = useState(null);

  useEffect(() => {
    if (isCustomer && userId) {
      const key = getUserCartKey(userId);
      try {
        const saved = localStorage.getItem(key);
        if (saved) {
          setCartItems(JSON.parse(saved));
          return;
        }
      } catch { }
      setCartItems([]);
    } else {
      setCartItems([]);
      setIsCartOpen(false);
    }
  }, [userId, isCustomer, user?.role]);

  useEffect(() => {
    if (isCustomer && userId) {
      const key = getUserCartKey(userId);
      try {
        localStorage.setItem(key, JSON.stringify(cartItems));
      } catch { }
    }
  }, [cartItems, userId, isCustomer]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 3500);
  };

  const executeAddToCart = (product, { flavor, size, quantity = 1 } = {}) => {
    if (user?.role === 'admin') {
      showToast('Administrators manage inventory and cannot add items to cart or place orders.');
      return;
    }

    const selectedFlavor = flavor || (product.flavors ? product.flavors[0] : 'Standard');
    const selectedSize = size || (product.sizes ? product.sizes[0] : 'Standard');

    setCartItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) =>
          item.productId === product.id &&
          item.flavor === selectedFlavor &&
          item.size === selectedSize
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      }

      const newItem = {
        id: `cart-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        productId: product.id,
        name: product.name,
        flavor: selectedFlavor,
        size: selectedSize,
        price: product.price,
        quantity,
        category: product.category,
      };

      return [newItem, ...prev];
    });

    showToast(`Added ${product.name} to your Cart.`);
  };

  useEffect(() => {
    if (isAuthenticated && pendingItem) {
      if (user?.role === 'admin') {
        setPendingItem(null);
        showToast('Administrators manage inventory and cannot place customer orders.');
        return;
      }
      const { product, options } = pendingItem;
      setPendingItem(null);
      executeAddToCart(product, options);
    }
  }, [isAuthenticated, pendingItem, user?.role]);

  const addToCart = (product, options = {}) => {
    if (!isAuthenticated) {
      setPendingItem({ product, options });
      showToast('Please sign in to add items to your cart.');
      openModal('login');
      return;
    }
    if (user?.role === 'admin') {
      showToast('Administrators manage inventory and cannot add items to cart or place orders.');
      return;
    }
    executeAddToCart(product, options);
  };

  const removeFromCart = (cartItemId) => {
    setCartItems((prev) => prev.filter((item) => item.id !== cartItemId));
  };

  const updateQuantity = (cartItemId, newQty) => {
    if (newQty <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === cartItemId ? { ...item, quantity: newQty } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
    if (userId) {
      try {
        localStorage.removeItem(getUserCartKey(userId));
      } catch { }
    }
  };

  const cartCount = isCustomer ? cartItems.reduce((sum, item) => sum + item.quantity, 0) : 0;
  const cartSubtotal = isCustomer
    ? parseFloat(cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2))
    : 0;

  return (
    <CartContext.Provider
      value={{
        cartItems: isCustomer ? cartItems : [],
        cartCount,
        cartSubtotal,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        toastMessage,
        showToast,
        isCustomer,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
