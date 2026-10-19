import express from 'express';
import pool from '../config/db.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET WORKOUT LOGS FOR A SPECIFIC DATE
router.get('/logs', verifyToken, async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date || new Date().toISOString().split('T')[0];

    const [rows] = await pool.query(
      'SELECT * FROM workout_logs WHERE user_id = ? AND log_date = ? ORDER BY created_at DESC',
      [req.user.id, targetDate]
    );

    return res.json({ success: true, workouts: rows });
  } catch (error) {
    console.error('Fetch workout logs error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch workout logs.' });
  }
});

// LOG COMPLETED WORKOUT
router.post('/logs', verifyToken, async (req, res) => {
  try {
    const { date, title, duration, caloriesBurned, notes } = req.body;
    const workoutId = `wo-${Date.now()}`;
    const targetDate = date || new Date().toISOString().split('T')[0];

    await pool.query(`
      INSERT INTO workout_logs (id, user_id, log_date, title, duration_mins, calories_burned, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      workoutId,
      req.user.id,
      targetDate,
      title || 'Daily Workout Routine',
      duration || 45,
      caloriesBurned || 320,
      notes || '',
    ]);

    return res.status(201).json({
      success: true,
      workout: {
        id: workoutId,
        log_date: targetDate,
        title: title || 'Daily Workout Routine',
        duration_mins: duration || 45,
        calories_burned: caloriesBurned || 320,
      },
    });
  } catch (error) {
    console.error('Save workout log error:', error);
    return res.status(500).json({ success: false, error: 'Failed to save workout log.' });
  }
});

export default router;
