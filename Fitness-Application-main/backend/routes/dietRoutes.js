import express from 'express';
import pool from '../config/db.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET MEAL LOGS FOR A SPECIFIC DATE
router.get('/logs', verifyToken, async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date || new Date().toISOString().split('T')[0];

    const [rows] = await pool.query(
      'SELECT * FROM meal_logs WHERE user_id = ? AND log_date = ? ORDER BY created_at ASC',
      [req.user.id, targetDate]
    );

    const formattedLogs = rows.map((r) => ({
      id: r.id,
      mealType: r.meal_type,
      food: {
        id: r.id,
        name: r.food_name,
        category: 'Logged Item',
        unit: r.unit,
        servingSize: 1,
      },
      quantity: Number(r.quantity),
      unit: r.unit,
      calories: Number(r.calories),
      protein: Number(r.protein),
      carbs: Number(r.carbs),
      fat: Number(r.fat),
      fiber: Number(r.fiber),
      timestamp: r.log_time || '12:00 PM',
    }));

    return res.json({ success: true, logs: formattedLogs, meals: formattedLogs });
  } catch (error) {
    console.error('Fetch meal logs error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch meal logs.' });
  }
});

// ADD NEW MEAL LOG
router.post('/logs', verifyToken, async (req, res) => {
  try {
    const { date, mealType, food, quantity, unit, calories, protein, carbs, fat, fiber, timestamp } = req.body;

    const logId = `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const targetDate = date || new Date().toISOString().split('T')[0];
    const foodName = food?.name || req.body.food_name || 'Food item';

    await pool.query(`
      INSERT INTO meal_logs (
        id, user_id, log_date, meal_type, food_name, quantity, unit,
        calories, protein, carbs, fat, fiber, log_time
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      logId,
      req.user.id,
      targetDate,
      (mealType || 'breakfast').toLowerCase(),
      foodName,
      quantity || 1,
      unit || 'serving',
      calories || 0,
      protein || 0,
      carbs || 0,
      fat || 0,
      fiber || 0,
      timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    ]);

    return res.status(201).json({
      success: true,
      log: {
        id: logId,
        mealType: (mealType || 'breakfast').toLowerCase(),
        food: { id: logId, name: foodName, unit: unit || 'serving', servingSize: 1 },
        quantity: Number(quantity || 1),
        unit: unit || 'serving',
        calories: Number(calories || 0),
        protein: Number(protein || 0),
        carbs: Number(carbs || 0),
        fat: Number(fat || 0),
        fiber: Number(fiber || 0),
        timestamp: timestamp || '12:00 PM',
      },
    });
  } catch (error) {
    console.error('Create meal log error:', error);
    return res.status(500).json({ success: false, error: 'Failed to save meal log.' });
  }
});

// DELETE MEAL LOG
router.delete('/logs/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM meal_logs WHERE id = ? AND user_id = ?', [id, req.user.id]);
    return res.json({ success: true, message: 'Meal log deleted successfully.' });
  } catch (error) {
    console.error('Delete meal log error:', error);
    return res.status(500).json({ success: false, error: 'Failed to delete meal log.' });
  }
});

export default router;
