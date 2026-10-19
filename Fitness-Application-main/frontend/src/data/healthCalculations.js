// ============================================
// SCIENTIFIC HEALTH & METABOLIC FORMULAS
// Validated Mifflin-St Jeor, BMI, TDEE & Macro distributions
// ============================================

export const ACTIVITY_LEVELS = [
  {
    id: 'sedentary',
    label: 'Sedentary',
    multiplier: 1.2,
    desc: 'Desk job, little to no regular exercise',
  },
  {
    id: 'light',
    label: 'Lightly Active',
    multiplier: 1.375,
    desc: 'Light workouts / sports 1-3 days per week',
  },
  {
    id: 'moderate',
    label: 'Moderately Active',
    multiplier: 1.55,
    desc: 'Moderate training 3-5 days per week',
  },
  {
    id: 'very_active',
    label: 'Very Active',
    multiplier: 1.725,
    desc: 'Hard exercise / training 6-7 days per week',
  },
  {
    id: 'extra_active',
    label: 'Extremely Active',
    multiplier: 1.9,
    desc: 'Athletic training 2x/day, physical job',
  },
];

export const FITNESS_GOALS = [
  {
    id: 'fat_loss',
    label: 'Fat Loss',
    calorieAdjustment: -450,
    desc: 'Targeted caloric deficit to shed body fat while preserving lean muscle mass',
  },
  {
    id: 'maintenance',
    label: 'Maintenance',
    calorieAdjustment: 0,
    desc: 'Maintain weight, improve body composition and maximize athletic recovery',
  },
  {
    id: 'muscle_gain',
    label: 'Muscle Gain',
    calorieAdjustment: 300,
    desc: 'Controlled caloric surplus to fuel hypertrophy and strength progression',
  },
];

/**
 * Calculates Body Mass Index (BMI) and categorization
 */
export function calculateBMI(weightKg, heightCm) {
  if (!weightKg || !heightCm || heightCm <= 0) return { bmi: 0, category: 'Unknown', color: '#94a3b8' };

  const heightM = heightCm / 100;
  const bmi = parseFloat((weightKg / (heightM * heightM)).toFixed(1));

  let category = 'Normal';
  let color = '#10b981'; // Green

  if (bmi < 18.5) {
    category = 'Underweight';
    color = '#0284c7'; // Blue
  } else if (bmi >= 18.5 && bmi <= 24.9) {
    category = 'Normal';
    color = '#10b981'; // Green
  } else if (bmi >= 25.0 && bmi <= 29.9) {
    category = 'Overweight';
    color = '#f59e0b'; // Amber
  } else {
    category = 'Obese';
    color = '#ef4444'; // Red
  }

  // Ideal weight range for normal BMI (18.5 - 24.9)
  const minIdealWeight = parseFloat((18.5 * heightM * heightM).toFixed(1));
  const maxIdealWeight = parseFloat((24.9 * heightM * heightM).toFixed(1));

  return {
    bmi,
    category,
    color,
    idealWeightRange: `${minIdealWeight} - ${maxIdealWeight} kg`,
    minIdealWeight,
    maxIdealWeight,
  };
}

/**
 * Calculates BMR via Mifflin-St Jeor Equation
 */
export function calculateBMR(gender, age, weightKg, heightCm) {
  if (!age || !weightKg || !heightCm) return 0;

  // Mifflin-St Jeor:
  // Men: 10 * weight(kg) + 6.25 * height(cm) - 5 * age + 5
  // Women: 10 * weight(kg) + 6.25 * height(cm) - 5 * age - 161
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  const bmr = gender === 'female' ? base - 161 : base + 5;

  return Math.round(Math.max(bmr, 800));
}

/**
 * Calculates TDEE & full personalized macro distribution
 */
export function calculateCompleteAssessment({
  gender = 'male',
  age = 25,
  weight = 75,
  height = 178,
  activity = 'moderate',
  goal = 'fat_loss',
}) {
  const weightKg = parseFloat(weight) || 75;
  const heightCm = parseFloat(height) || 178;
  const ageNum = parseInt(age, 10) || 25;

  // 1. BMI
  const bmiData = calculateBMI(weightKg, heightCm);

  // 2. BMR
  const bmr = calculateBMR(gender, ageNum, weightKg, heightCm);

  // 3. Activity Multiplier
  const activityObj = ACTIVITY_LEVELS.find((a) => a.id === activity) || ACTIVITY_LEVELS[2];
  const tdee = Math.round(bmr * activityObj.multiplier);

  // 4. Target Daily Calories
  const goalObj = FITNESS_GOALS.find((g) => g.id === goal) || FITNESS_GOALS[0];
  const targetCalories = Math.max(1200, Math.round(tdee + goalObj.calorieAdjustment));

  // 5. Macro Distribution (Grams & Percentages)
  // Protein: 2.0g per kg of bodyweight
  const proteinGrams = Math.round(weightKg * 2.0);
  const proteinCalories = proteinGrams * 4;

  // Fat: 25% of total target calories
  const fatCalories = Math.round(targetCalories * 0.25);
  const fatGrams = Math.round(fatCalories / 9);

  // Carbs: Remaining calories
  const carbCalories = Math.max(0, targetCalories - (proteinCalories + fatCalories));
  const carbGrams = Math.round(carbCalories / 4);

  const proteinPct = Math.round((proteinCalories / targetCalories) * 100);
  const fatPct = Math.round((fatCalories / targetCalories) * 100);
  const carbPct = Math.max(0, 100 - (proteinPct + fatPct));

  // 6. Water Target (Liters)
  const waterLiters = parseFloat((weightKg * 0.033 + (activityObj.multiplier > 1.4 ? 0.6 : 0.3)).toFixed(1));

  return {
    bmi: bmiData.bmi,
    bmiCategory: bmiData.category,
    bmiColor: bmiData.color,
    idealWeightRange: bmiData.idealWeightRange,
    bmr,
    tdee,
    targetCalories,
    calorieAdjustment: goalObj.calorieAdjustment,
    goalLabel: goalObj.label,
    activityLabel: activityObj.label,
    macros: {
      protein: { grams: proteinGrams, calories: proteinCalories, pct: proteinPct },
      carbs: { grams: carbGrams, calories: carbCalories, pct: carbPct },
      fat: { grams: fatGrams, calories: fatCalories, pct: fatPct },
    },
    waterLiters,
  };
}
