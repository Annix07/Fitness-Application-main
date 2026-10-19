import express from 'express';
import pool from '../config/db.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET USER HEALTH PROFILE
router.get('/', verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM health_profiles WHERE user_id = ?', [req.user.id]);
    if (rows.length === 0) {
      return res.json({
        success: true,
        profile: {
          age: 26,
          gender: 'male',
          height: 178,
          weight: 71,
          activityLevel: 'moderate',
          goal: 'muscle_gain',
        },
      });
    }

    const p = rows[0];
    return res.json({
      success: true,
      profile: {
        age: p.age,
        gender: p.gender,
        height: Number(p.height_cm),
        weight: Number(p.weight_kg),
        activityLevel: p.activity_level,
        goal: p.fitness_goal,
      },
      assessmentResults: {
        bmi: Number(p.bmi),
        bmiCategory: p.bmi_category,
        targetCalories: p.target_calories,
        targetProtein: p.target_protein,
        targetCarbs: p.target_carbs,
        targetFat: p.target_fat,
      },
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch health profile.' });
  }
});

// UPDATE USER HEALTH PROFILE
router.put('/', verifyToken, async (req, res) => {
  try {
    const { age, gender, height, weight, activityLevel, goal, assessmentResults } = req.body;

    const bmi = assessmentResults?.bmi || (weight / ((height / 100) * (height / 100))).toFixed(1);
    const bmiCategory = assessmentResults?.bmiCategory || 'Normal';
    const targetCalories = assessmentResults?.targetCalories || 2250;
    const targetProtein = assessmentResults?.targetProtein || 150;
    const targetCarbs = assessmentResults?.targetCarbs || 200;
    const targetFat = assessmentResults?.targetFat || 65;

    await pool.query(`
      INSERT INTO health_profiles (
        user_id, age, gender, height_cm, weight_kg, activity_level, fitness_goal,
        target_calories, target_protein, target_carbs, target_fat, bmi, bmi_category
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        age = VALUES(age),
        gender = VALUES(gender),
        height_cm = VALUES(height_cm),
        weight_kg = VALUES(weight_kg),
        activity_level = VALUES(activity_level),
        fitness_goal = VALUES(fitness_goal),
        target_calories = VALUES(target_calories),
        target_protein = VALUES(target_protein),
        target_carbs = VALUES(target_carbs),
        target_fat = VALUES(target_fat),
        bmi = VALUES(bmi),
        bmi_category = VALUES(bmi_category)
    `, [
      req.user.id,
      age || 26,
      gender || 'male',
      height || 178,
      weight || 71,
      activityLevel || 'moderate',
      goal || 'muscle_gain',
      targetCalories,
      targetProtein,
      targetCarbs,
      targetFat,
      bmi,
      bmiCategory,
    ]);

    return res.json({ success: true, message: 'Health profile synchronized successfully.' });
  } catch (error) {
    console.error('Profile update error:', error);
    return res.status(500).json({ success: false, error: 'Failed to update health profile.' });
  }
});

export default router;
