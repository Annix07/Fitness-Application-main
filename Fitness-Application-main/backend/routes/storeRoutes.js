import express from 'express';
import pool from '../config/db.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET ACTIVE STORE PRODUCTS (Public)
router.get('/products', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM products WHERE status = "Active" ORDER BY sales_count DESC');
    const formatted = rows.map((p) => ({
      id: p.id,
      name: p.name,
      category: p.category,
      price: Number(p.price),
      stock: p.stock,
      description: p.description,
      image: p.image_url,
      status: p.status,
      salesCount: p.sales_count,
    }));
    return res.json({ success: true, products: formatted });
  } catch (error) {
    console.error('Fetch store products error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch store products.' });
  }
});

// CHECKOUT / CREATE ORDER
router.post('/checkout', verifyToken, async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { items, totalAmount, shippingAddress, phone, paymentMethod } = req.body;
    const orderId = `ORD-${Date.now().toString().slice(-6)}`;
    const userId = req.user.id;
    const customerName = req.user.name || 'Valued Customer';
    const customerEmail = req.user.email;

    // 1. Insert Order
    await connection.query(`
      INSERT INTO orders (id, user_id, customer_name, customer_email, total_amount, status, shipping_address, phone, payment_method)
      VALUES (?, ?, ?, ?, ?, "Pending", ?, ?, ?)
    `, [
      orderId,
      userId,
      customerName,
      customerEmail,
      totalAmount || 0,
      shippingAddress || '123 Main St, City, Country',
      phone || '',
      paymentMethod || 'Credit Card',
    ]);

    // 2. Insert Order Items & decrement product stock
    if (items && Array.isArray(items)) {
      for (const item of items) {
        await connection.query(`
          INSERT INTO order_items (order_id, product_id, product_name, price, quantity, subtotal)
          VALUES (?, ?, ?, ?, ?, ?)
        `, [
          orderId,
          item.id || null,
          item.name,
          item.price,
          item.quantity || 1,
          (item.price * (item.quantity || 1)),
        ]);

        if (item.id) {
          await connection.query(`
            UPDATE products
            SET stock = GREATEST(0, stock - ?), sales_count = sales_count + ?
            WHERE id = ?
          `, [item.quantity || 1, item.quantity || 1, item.id]);
        }
      }
    }

    await connection.commit();
    return res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      orderId,
    });
  } catch (error) {
    await connection.rollback();
    console.error('Checkout error:', error);
    return res.status(500).json({ success: false, error: 'Failed to complete checkout process.' });
  } finally {
    connection.release();
  }
});

// GET USER'S OWN ORDER HISTORY
router.get('/orders', verifyToken, async (req, res) => {
  try {
    const [orders] = await pool.query(`
      SELECT id, total_amount, status, shipping_address, payment_method, created_at
      FROM orders
      WHERE user_id = ? OR customer_email = ?
      ORDER BY created_at DESC
    `, [req.user.id, req.user.email]);

    if (orders.length === 0) {
      return res.json({ success: true, orders: [] });
    }

    const orderIds = orders.map((o) => o.id);
    const [items] = await pool.query(`
      SELECT id, order_id, product_name, price, quantity, subtotal
      FROM order_items
      WHERE order_id IN (?)
    `, [orderIds]);

    const itemsByOrder = items.reduce((acc, item) => {
      if (!acc[item.order_id]) acc[item.order_id] = [];
      acc[item.order_id].push({
        name: item.product_name,
        price: Number(item.price),
        qty: item.quantity,
        total: Number(item.subtotal),
      });
      return acc;
    }, {});

    const formatted = orders.map((o) => ({
      id: o.id,
      orderNumber: o.id,
      date: new Date(o.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      createdAt: o.created_at,
      status: o.status,
      totalAmount: Number(o.total_amount),
      total: Number(o.total_amount),
      paymentMethod: o.payment_method || 'Credit Card',
      shippingAddress: o.shipping_address,
      items: itemsByOrder[o.id] || [],
    }));

    return res.json({ success: true, orders: formatted });
  } catch (error) {
    console.error('Fetch user orders error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch user orders.' });
  }
});

export default router;

