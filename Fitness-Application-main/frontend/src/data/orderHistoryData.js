// ============================================
// MACROPACE STORE ORDER HISTORY DATASET
// Realistic, structured purchase records
// ============================================

export const ORDER_STATUSES = {
  DELIVERED: { label: 'Delivered', color: '#10b981', bg: 'rgba(16, 185, 129, 0.12)' },
  IN_TRANSIT: { label: 'In Transit', color: '#0284c7', bg: 'rgba(2, 132, 199, 0.12)' },
  PROCESSING: { label: 'Processing', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.12)' },
};

export const INITIAL_ORDER_HISTORY = [
  {
    id: 'MP-94821',
    orderDate: 'Aug 18, 2026',
    deliveredDate: 'Aug 21, 2026',
    status: 'DELIVERED',
    trackingNumber: 'TRK-98421049281',
    subtotal: 84.97,
    shipping: 0.00,
    tax: 6.80,
    total: 91.77,
    paymentMethod: 'Visa ending in 4242',
    shippingAddress: {
      street: '742 Evergreen Terrace',
      city: 'San Francisco',
      state: 'CA',
      zip: '94107',
      country: 'United States',
    },
    items: [
      {
        id: 'item-1',
        name: 'MacroPace Ultra Whey Isolate 100%',
        flavor: 'Rich Double Chocolate',
        size: '2 kg (4.4 lbs)',
        quantity: 1,
        unitPrice: 59.99,
        category: 'Supplements',
      },
      {
        id: 'item-2',
        name: 'Micro-Refined Pure Creatine Monohydrate',
        flavor: 'Unflavored',
        size: '300g (60 Servings)',
        quantity: 1,
        unitPrice: 24.98,
        category: 'Supplements',
      },
    ],
  },
  {
    id: 'MP-89104',
    orderDate: 'Jul 28, 2026',
    deliveredDate: 'Aug 01, 2026',
    status: 'DELIVERED',
    trackingNumber: 'TRK-77192039481',
    subtotal: 42.98,
    shipping: 4.99,
    tax: 3.44,
    total: 51.41,
    paymentMethod: 'Mastercard ending in 8891',
    shippingAddress: {
      street: '742 Evergreen Terrace',
      city: 'San Francisco',
      state: 'CA',
      zip: '94107',
      country: 'United States',
    },
    items: [
      {
        id: 'item-3',
        name: 'Heavy-Duty 5-Level Loop Resistance Bands',
        flavor: 'Standard Set',
        size: '5 Resistances (X-Light to X-Heavy)',
        quantity: 1,
        unitPrice: 22.99,
        category: 'Gear & Equipment',
      },
      {
        id: 'item-4',
        name: 'Insulated Stainless Steel Shaker Bottle',
        flavor: 'Matte Stealth Black',
        size: '750 ml / 25 oz',
        quantity: 1,
        unitPrice: 19.99,
        category: 'Accessories',
      },
    ],
  },
  {
    id: 'MP-82015',
    orderDate: 'Jun 12, 2026',
    deliveredDate: 'Jun 16, 2026',
    status: 'DELIVERED',
    trackingNumber: 'TRK-66102938472',
    subtotal: 34.50,
    shipping: 0.00,
    tax: 2.76,
    total: 37.26,
    paymentMethod: 'Apple Pay',
    shippingAddress: {
      street: '742 Evergreen Terrace',
      city: 'San Francisco',
      state: 'CA',
      zip: '94107',
      country: 'United States',
    },
    items: [
      {
        id: 'item-5',
        name: 'High-Density Trigger Point Foam Roller',
        flavor: 'Deep Grid Texture',
        size: '18 Inch Length',
        quantity: 1,
        unitPrice: 34.50,
        category: 'Recovery',
      },
    ],
  },
];

const ORDER_STORAGE_KEY = 'macropace_order_history';

export function getOrderHistory() {
  try {
    const saved = localStorage.getItem(ORDER_STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return INITIAL_ORDER_HISTORY;
}

export function addNewOrder(newOrder) {
  try {
    const current = getOrderHistory();
    const updated = [newOrder, ...current];
    localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [newOrder, ...INITIAL_ORDER_HISTORY];
  }
}

