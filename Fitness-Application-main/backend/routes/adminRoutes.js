import express from 'express';
import pool from '../config/db.js';
import { verifyToken, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Enforce admin protection on all routes in this file
router.use(verifyToken, requireAdmin);

// 1. ADMIN DASHBOARD STATS & KPI METRICS
router.get('/stats', async (req, res) => {
  try {
    const [userRows] = await pool.query('SELECT COUNT(*) AS total, SUM(CASE WHEN status = "Active" THEN 1 ELSE 0 END) AS active FROM users');
    const [productRows] = await pool.query('SELECT COUNT(*) AS total, SUM(CASE WHEN status = "Active" THEN 1 ELSE 0 END) AS active, SUM(CASE WHEN stock <= 10 THEN 1 ELSE 0 END) AS lowStock FROM products');
    const [orderRows] = await pool.query('SELECT COUNT(*) AS total, SUM(CASE WHEN status IN ("Pending", "Processing") THEN 1 ELSE 0 END) AS pending, SUM(CASE WHEN status != "Cancelled" THEN total_amount ELSE 0 END) AS revenue FROM orders');

    return res.json({
      success: true,
      stats: {
        totalUsers: Number(userRows[0]?.total || 0),
        activeUsersCount: Number(userRows[0]?.active || 0),
        totalProducts: Number(productRows[0]?.total || 0),
        activeProductsCount: Number(productRows[0]?.active || 0),
        lowStockCount: Number(productRows[0]?.lowStock || 0),
        totalOrders: Number(orderRows[0]?.total || 0),
        pendingOrdersCount: Number(orderRows[0]?.pending || 0),
        monthlyRevenue: Number(orderRows[0]?.revenue || 0),
      },
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return res.status(500).json({ success: false, error: 'Failed to retrieve admin stats.' });
  }
});

// 2. GET ALL USERS (with aggregated order count & lifetime spend)
router.get('/users', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        u.id, u.name, u.email, u.role, u.status, u.avatar_color,
        DATE_FORMAT(u.created_at, '%Y-%m-%d') AS joinDate,
        COUNT(o.id) AS ordersCount,
        COALESCE(SUM(CASE WHEN o.status != 'Cancelled' THEN o.total_amount ELSE 0 END), 0) AS spentTotal
      FROM users u
      LEFT JOIN orders o ON u.id = o.user_id
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `);

    const formatted = rows.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role.charAt(0).toUpperCase() + u.role.slice(1),
      status: u.status,
      avatarColor: u.avatar_color || '#0284c7',
      joinDate: u.joinDate || new Date().toISOString().split('T')[0],
      ordersCount: Number(u.ordersCount || 0),
      spentTotal: Number(u.spentTotal || 0),
    }));

    return res.json({ success: true, users: formatted });
  } catch (error) {
    console.error('Admin get users error:', error);
    return res.status(500).json({ success: false, error: 'Failed to retrieve users.' });
  }
});

// 3. UPDATE USER
router.put('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, status } = req.body;

    await pool.query(
      'UPDATE users SET name = COALESCE(?, name), email = COALESCE(?, email), role = COALESCE(?, role), status = COALESCE(?, status) WHERE id = ?',
      [name, email ? email.toLowerCase() : null, role ? role.toLowerCase() : null, status, id]
    );

    return res.json({ success: true, message: 'User updated successfully.' });
  } catch (error) {
    console.error('Admin update user error:', error);
    return res.status(500).json({ success: false, error: 'Failed to update user.' });
  }
});

// 4. DELETE USER
router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM users WHERE id = ?', [id]);
    return res.json({ success: true, message: 'User deleted successfully.' });
  } catch (error) {
    console.error('Admin delete user error:', error);
    return res.status(500).json({ success: false, error: 'Failed to delete user.' });
  }
});

// 5. GET ALL PRODUCTS
router.get('/products', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM products ORDER BY created_at DESC');
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
    console.error('Admin get products error:', error);
    return res.status(500).json({ success: false, error: 'Failed to retrieve products.' });
  }
});

// 6. CREATE PRODUCT
router.post('/products', async (req, res) => {
  try {
    const { name, category, price, stock, description, image, status } = req.body;
    const prodId = `PRD-${Date.now().toString().slice(-5)}`;

    await pool.query(`
      INSERT INTO products (id, name, category, price, stock, description, image_url, status, sales_count)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)
    `, [
      prodId,
      name,
      category || 'Supplements',
      price || 0,
      stock || 0,
      description || '',
      image || 'https://images.unsplash.com/photo-1579722820308-d74e571900a9?w=300&q=80',
      status || 'Active',
    ]);

    return res.status(201).json({
      success: true,
      product: {
        id: prodId,
        name,
        category: category || 'Supplements',
        price: Number(price || 0),
        stock: Number(stock || 0),
        description: description || '',
        image: image || 'https://images.unsplash.com/photo-1579722820308-d74e571900a9?w=300&q=80',
        status: status || 'Active',
        salesCount: 0,
      },
    });
  } catch (error) {
    console.error('Admin create product error:', error);
    return res.status(500).json({ success: false, error: 'Failed to create product.' });
  }
});

// 7. UPDATE PRODUCT
router.put('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, price, stock, description, image, status } = req.body;

    await pool.query(`
      UPDATE products SET
        name = COALESCE(?, name),
        category = COALESCE(?, category),
        price = COALESCE(?, price),
        stock = COALESCE(?, stock),
        description = COALESCE(?, description),
        image_url = COALESCE(?, image_url),
        status = COALESCE(?, status)
      WHERE id = ?
    `, [name, category, price, stock, description, image, status, id]);

    return res.json({ success: true, message: 'Product updated successfully.' });
  } catch (error) {
    console.error('Admin update product error:', error);
    return res.status(500).json({ success: false, error: 'Failed to update product.' });
  }
});

// 8. DELETE PRODUCT
router.delete('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM products WHERE id = ?', [id]);
    return res.json({ success: true, message: 'Product deleted successfully.' });
  } catch (error) {
    console.error('Admin delete product error:', error);
    return res.status(500).json({ success: false, error: 'Failed to delete product.' });
  }
});

// 9. GET ALL ORDERS WITH LINE ITEMS
router.get('/orders', async (req, res) => {
  try {
    const [orders] = await pool.query(`
      SELECT 
        id, user_id, customer_name, customer_email, total_amount, status,
        shipping_address, phone, payment_method,
        DATE_FORMAT(created_at, '%Y-%m-%d %h:%i %p') AS date
      FROM orders
      ORDER BY created_at DESC
    `);

    const [items] = await pool.query('SELECT * FROM order_items');

    const formattedOrders = orders.map((o) => {
      const lineItems = items
        .filter((item) => item.order_id === o.id)
        .map((item) => ({
          id: item.product_id,
          name: item.product_name,
          price: Number(item.price),
          qty: item.quantity,
          subtotal: Number(item.subtotal),
        }));

      return {
        id: o.id,
        customer: {
          name: o.customer_name,
          email: o.customer_email,
          phone: o.phone || '',
          address: o.shipping_address,
        },
        date: o.date,
        total: Number(o.total_amount),
        status: o.status,
        paymentMethod: o.payment_method || 'Credit Card',
        items: lineItems.length > 0 ? lineItems : [
          { name: 'Store Purchase', price: Number(o.total_amount), qty: 1, subtotal: Number(o.total_amount) }
        ],
      };
    });

    return res.json({ success: true, orders: formattedOrders });
  } catch (error) {
    console.error('Admin get orders error:', error);
    return res.status(500).json({ success: false, error: 'Failed to retrieve orders.' });
  }
});

// 10. UPDATE ORDER STATUS
router.put('/orders/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    await pool.query('UPDATE orders SET status = ? WHERE id = ?', [status, id]);
    return res.json({ success: true, message: `Order ${id} status updated to ${status}.` });
  } catch (error) {
    console.error('Admin update order status error:', error);
    return res.status(500).json({ success: false, error: 'Failed to update order status.' });
  }
});

export default router;
