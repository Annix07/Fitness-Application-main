import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// 1. REGISTER
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'Name, email, and password are required.' });
    }

    // Check if email already exists
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email.toLowerCase()]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, error: 'An account with this email already exists.' });
    }

    const userId = `USR-${Date.now().toString().slice(-6)}`;
    const passwordHash = await bcrypt.hash(password, 10);

    await pool.query(
      'INSERT INTO users (id, name, email, password_hash, role, status) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, name.trim(), email.toLowerCase().trim(), passwordHash, 'user', 'Active']
    );

    // Initialize default health profile
    await pool.query(
      'INSERT INTO health_profiles (user_id, age, gender, height_cm, weight_kg, fitness_goal, target_calories) VALUES (?, 26, "male", 175.0, 70.0, "maintenance", 2200)',
      [userId]
    );

    const token = jwt.sign(
      { id: userId, email: email.toLowerCase(), name: name.trim(), role: 'user' },
      process.env.JWT_SECRET || 'macropace_secret',
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      success: true,
      token,
      user: {
        id: userId,
        name: name.trim(),
        email: email.toLowerCase().trim(),
        role: 'user',
        status: 'Active',
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error during registration.' });
  }
});

// 2. LOGIN
router.post('/login', async (req, res) => {
  try {
    const { userId, password } = req.body;

    if (!userId || !password) {
      return res.status(400).json({ success: false, error: 'Email/ID and password are required.' });
    }

    const queryKey = userId.toLowerCase().trim();
    // Allow login by email, username, or fixed admin id
    let [rows] = await pool.query(
      'SELECT id, name, email, password_hash, role, status FROM users WHERE email = ? OR id = ?',
      [queryKey, queryKey]
    );

    // Support predefined admin username shorthand "tirth_admin"
    if (rows.length === 0 && (queryKey === 'tirth_admin' || queryKey === 'admin')) {
      [rows] = await pool.query('SELECT id, name, email, password_hash, role, status FROM users WHERE role = "admin" LIMIT 1');
    }

    if (rows.length === 0) {
      return res.status(401).json({ success: false, error: 'Invalid ID/Email or password.' });
    }

    const user = rows[0];

    if (user.status !== 'Active') {
      return res.status(403).json({ success: false, error: 'Account is currently inactive. Please contact admin.' });
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ success: false, error: 'Invalid ID/Email or password.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      process.env.JWT_SECRET || 'macropace_secret',
      { expiresIn: '7d' }
    );

    return res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error during login.' });
  }
});

// 3. GET CURRENT USER
router.get('/me', verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, name, email, role, status FROM users WHERE id = ?', [req.user.id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }
    return res.json({ success: true, user: rows[0] });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to retrieve user session.' });
  }
});

// 4. UPDATE USER PROFILE (Name, etc.)
router.put('/profile', verifyToken, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, error: 'Full name is required.' });
    }

    await pool.query('UPDATE users SET name = ? WHERE id = ?', [name.trim(), req.user.id]);
    const [rows] = await pool.query('SELECT id, name, email, role, status FROM users WHERE id = ?', [req.user.id]);

    return res.json({
      success: true,
      message: 'Profile updated successfully.',
      user: rows[0],
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({ success: false, error: 'Failed to update profile.' });
  }
});

// 5. CHANGE PASSWORD
router.post('/change-password', verifyToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, error: 'Current and new password are required.' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, error: 'New password must be at least 6 characters long.' });
    }

    const [rows] = await pool.query('SELECT password_hash FROM users WHERE id = ?', [req.user.id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }

    const match = await bcrypt.compare(currentPassword, rows[0].password_hash);
    if (!match) {
      return res.status(400).json({ success: false, error: 'Current password does not match.' });
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [newHash, req.user.id]);

    return res.json({ success: true, message: 'Password changed successfully.' });
  } catch (error) {
    console.error('Change password error:', error);
    return res.status(500).json({ success: false, error: 'Failed to change password.' });
  }
});

export default router;

