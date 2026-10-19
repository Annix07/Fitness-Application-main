// ============================================
// COMPREHENSIVE EXERCISE & ROUTINE DATABASE
// Standardized daily routines & exercise library
// ============================================

export const EXERCISE_DATABASE = [
  // CHEST
  {
    id: 'ex-bench-press',
    name: 'Barbell Bench Press',
    muscleGroup: 'Chest',
    secondaryMuscles: ['Triceps', 'Front Delts'],
    equipment: 'Barbell',
    type: 'weight_reps',
    defaultSets: 4,
    defaultReps: 10,
    defaultWeight: 60,
    caloriesPerSet: 12,
    instructions: 'Lower the barbell with control to mid-chest, then drive upwards while keeping shoulders retracted.',
  },
  {
    id: 'ex-incline-db-press',
    name: 'Incline Dumbbell Press',
    muscleGroup: 'Chest',
    secondaryMuscles: ['Front Delts', 'Triceps'],
    equipment: 'Dumbbell',
    type: 'weight_reps',
    defaultSets: 3,
    defaultReps: 12,
    defaultWeight: 22,
    caloriesPerSet: 10,
    instructions: 'Set bench to 30 degrees. Press dumbbells up over upper chest with a slight arc.',
  },
  {
    id: 'ex-cable-chest-fly',
    name: 'Cable Chest Fly',
    muscleGroup: 'Chest',
    secondaryMuscles: ['Front Delts'],
    equipment: 'Cable',
    type: 'weight_reps',
    defaultSets: 3,
    defaultReps: 15,
    defaultWeight: 15,
    caloriesPerSet: 8,
    instructions: 'Maintain a slight bend in elbows and bring handles together in a hugging motion.',
  },
  {
    id: 'ex-pushups',
    name: 'Standard Push-Ups',
    muscleGroup: 'Chest',
    secondaryMuscles: ['Triceps', 'Core'],
    equipment: 'Bodyweight',
    type: 'weight_reps',
    defaultSets: 3,
    defaultReps: 20,
    defaultWeight: 0,
    caloriesPerSet: 9,
    instructions: 'Keep body rigid in a straight plank line. Lower chest to floor and press firmly up.',
  },
  {
    id: 'ex-dips-chest',
    name: 'Chest Dips',
    muscleGroup: 'Chest',
    secondaryMuscles: ['Triceps', 'Front Delts'],
    equipment: 'Bodyweight',
    type: 'weight_reps',
    defaultSets: 3,
    defaultReps: 12,
    defaultWeight: 0,
    caloriesPerSet: 11,
    instructions: 'Lean torso forward slightly to target chest fibers as you lower down to 90-degree elbow flexion.',
  },

  // BACK
  {
    id: 'ex-deadlift',
    name: 'Conventional Deadlift',
    muscleGroup: 'Back',
    secondaryMuscles: ['Hamstrings', 'Glutes', 'Core'],
    equipment: 'Barbell',
    type: 'weight_reps',
    defaultSets: 4,
    defaultReps: 6,
    defaultWeight: 100,
    caloriesPerSet: 18,
    instructions: 'Hinge at hips, grip bar shoulder-width apart, brace core and drive floor away through heels.',
  },
  {
    id: 'ex-lat-pulldown',
    name: 'Wide-Grip Lat Pulldown',
    muscleGroup: 'Back',
    secondaryMuscles: ['Biceps', 'Rear Delts'],
    equipment: 'Cable',
    type: 'weight_reps',
    defaultSets: 4,
    defaultReps: 10,
    defaultWeight: 50,
    caloriesPerSet: 10,
    instructions: 'Pull bar down towards upper chest while retracting and depressing scapulae.',
  },
  {
    id: 'ex-barbell-row',
    name: 'Bent-Over Barbell Row',
    muscleGroup: 'Back',
    secondaryMuscles: ['Biceps', 'Forearms', 'Spinal Erectors'],
    equipment: 'Barbell',
    type: 'weight_reps',
    defaultSets: 3,
    defaultReps: 10,
    defaultWeight: 50,
    caloriesPerSet: 12,
    instructions: 'Hinge forward at 45 degrees, pull bar to lower ribcage keeping elbows tucked close.',
  },
  {
    id: 'ex-seated-cable-row',
    name: 'Seated Cable Row',
    muscleGroup: 'Back',
    secondaryMuscles: ['Biceps', 'Rhomboids'],
    equipment: 'Cable',
    type: 'weight_reps',
    defaultSets: 3,
    defaultReps: 12,
    defaultWeight: 45,
    caloriesPerSet: 9,
    instructions: 'Sit upright, pull V-bar to midsection while squeezing shoulder blades together.',
  },
  {
    id: 'ex-pullups',
    name: 'Overhand Pull-Ups',
    muscleGroup: 'Back',
    secondaryMuscles: ['Biceps', 'Core'],
    equipment: 'Bodyweight',
    type: 'weight_reps',
    defaultSets: 3,
    defaultReps: 8,
    defaultWeight: 0,
    caloriesPerSet: 12,
    instructions: 'Grip bar slightly wider than shoulder width. Pull chest up to bar with strict form.',
  },

  // LEGS & GLUTES
  {
    id: 'ex-barbell-squat',
    name: 'Barbell Back Squat',
    muscleGroup: 'Legs',
    secondaryMuscles: ['Glutes', 'Hamstrings', 'Core'],
    equipment: 'Barbell',
    type: 'weight_reps',
    defaultSets: 4,
    defaultReps: 8,
    defaultWeight: 80,
    caloriesPerSet: 16,
    instructions: 'Rest bar on upper traps. Squat down until thighs are parallel to the floor, driving knees outward.',
  },
  {
    id: 'ex-romanian-deadlift',
    name: 'Romanian Deadlift (RDL)',
    muscleGroup: 'Legs',
    secondaryMuscles: ['Hamstrings', 'Glutes', 'Lower Back'],
    equipment: 'Barbell',
    type: 'weight_reps',
    defaultSets: 3,
    defaultReps: 10,
    defaultWeight: 60,
    caloriesPerSet: 13,
    instructions: 'Keep slight knee bend and hinge deeply at hips, lowering bar until deep hamstring stretch.',
  },
  {
    id: 'ex-leg-press',
    name: '45-Degree Leg Press',
    muscleGroup: 'Legs',
    secondaryMuscles: ['Quads', 'Glutes'],
    equipment: 'Machine',
    type: 'weight_reps',
    defaultSets: 3,
    defaultReps: 12,
    defaultWeight: 140,
    caloriesPerSet: 14,
    instructions: 'Place feet shoulder-width on sled platform. Lower smoothly without lifting lower back.',
  },
  {
    id: 'ex-bulgarian-split-squat',
    name: 'Bulgarian Split Squat',
    muscleGroup: 'Legs',
    secondaryMuscles: ['Quads', 'Glutes', 'Balance'],
    equipment: 'Dumbbell',
    type: 'weight_reps',
    defaultSets: 3,
    defaultReps: 10,
    defaultWeight: 16,
    caloriesPerSet: 12,
    instructions: 'Rest rear foot on a bench. Lower hips until front thigh is parallel to floor.',
  },
  {
    id: 'ex-leg-curl',
    name: 'Lying Hamstring Leg Curl',
    muscleGroup: 'Legs',
    secondaryMuscles: ['Hamstrings', 'Calves'],
    equipment: 'Machine',
    type: 'weight_reps',
    defaultSets: 3,
    defaultReps: 12,
    defaultWeight: 40,
    caloriesPerSet: 8,
    instructions: 'Lie prone, flex knees to pull roller pad towards glutes, hold peak contraction for 1 sec.',
  },
  {
    id: 'ex-calf-raise',
    name: 'Standing Calf Raise',
    muscleGroup: 'Legs',
    secondaryMuscles: ['Calves', 'Ankles'],
    equipment: 'Machine',
    type: 'weight_reps',
    defaultSets: 4,
    defaultReps: 15,
    defaultWeight: 50,
    caloriesPerSet: 7,
    instructions: 'Elevate on balls of feet through full range of motion, pausing at top stretch.',
  },

  // SHOULDERS
  {
    id: 'ex-overhead-press',
    name: 'Standing Overhead Barbell Press',
    muscleGroup: 'Shoulders',
    secondaryMuscles: ['Triceps', 'Upper Chest', 'Core'],
    equipment: 'Barbell',
    type: 'weight_reps',
    defaultSets: 4,
    defaultReps: 8,
    defaultWeight: 40,
    caloriesPerSet: 12,
    instructions: 'Press bar overhead in a vertical line, locking out arms with head pushed slightly through.',
  },
  {
    id: 'ex-db-lateral-raise',
    name: 'Dumbbell Lateral Raise',
    muscleGroup: 'Shoulders',
    secondaryMuscles: ['Side Delts', 'Traps'],
    equipment: 'Dumbbell',
    type: 'weight_reps',
    defaultSets: 4,
    defaultReps: 15,
    defaultWeight: 10,
    caloriesPerSet: 7,
    instructions: 'Raise dumbbells to sides with slight internal rotation until arms are parallel to floor.',
  },
  {
    id: 'ex-face-pull',
    name: 'Cable Face Pull',
    muscleGroup: 'Shoulders',
    secondaryMuscles: ['Rear Delts', 'Rotator Cuff', 'Upper Back'],
    equipment: 'Cable',
    type: 'weight_reps',
    defaultSets: 3,
    defaultReps: 15,
    defaultWeight: 20,
    caloriesPerSet: 7,
    instructions: 'Attach rope to high pulley. Pull towards forehead while externally rotating shoulders.',
  },
  {
    id: 'ex-arnold-press',
    name: 'Arnold Dumbbell Press',
    muscleGroup: 'Shoulders',
    secondaryMuscles: ['Front Delts', 'Side Delts', 'Triceps'],
    equipment: 'Dumbbell',
    type: 'weight_reps',
    defaultSets: 3,
    defaultReps: 10,
    defaultWeight: 18,
    caloriesPerSet: 10,
    instructions: 'Start with palms facing you at chest height. Rotate palms outward as you press overhead.',
  },

  // ARMS (BICEPS & TRICEPS)
  {
    id: 'ex-barbell-curl',
    name: 'Barbell Bicep Curl',
    muscleGroup: 'Arms',
    secondaryMuscles: ['Biceps', 'Brachialis'],
    equipment: 'Barbell',
    type: 'weight_reps',
    defaultSets: 3,
    defaultReps: 10,
    defaultWeight: 30,
    caloriesPerSet: 8,
    instructions: 'Keep elbows pinned to your sides. Curl weight up without swinging hips or shoulders.',
  },
  {
    id: 'ex-incline-db-curl',
    name: 'Incline Dumbbell Bicep Curl',
    muscleGroup: 'Arms',
    secondaryMuscles: ['Biceps Long Head'],
    equipment: 'Dumbbell',
    type: 'weight_reps',
    defaultSets: 3,
    defaultReps: 12,
    defaultWeight: 12,
    caloriesPerSet: 7,
    instructions: 'Sit on an incline bench. Let arms hang back to achieve maximum bicep stretch before curling.',
  },
  {
    id: 'ex-tricep-rope-pushdown',
    name: 'Tricep Rope Pushdown',
    muscleGroup: 'Arms',
    secondaryMuscles: ['Triceps Lateral Head'],
    equipment: 'Cable',
    type: 'weight_reps',
    defaultSets: 3,
    defaultReps: 12,
    defaultWeight: 25,
    caloriesPerSet: 7,
    instructions: 'Push rope down and spread handles apart at bottom lockout for maximum tricep contraction.',
  },
  {
    id: 'ex-skull-crushers',
    name: 'EZ-Bar Skull Crushers',
    muscleGroup: 'Arms',
    secondaryMuscles: ['Triceps Long Head'],
    equipment: 'Barbell',
    type: 'weight_reps',
    defaultSets: 3,
    defaultReps: 10,
    defaultWeight: 25,
    caloriesPerSet: 8,
    instructions: 'Lie on flat bench. Lower EZ bar down towards forehead by bending elbows, then press up.',
  },
  {
    id: 'ex-hammer-curl',
    name: 'Neutral Grip Hammer Curl',
    muscleGroup: 'Arms',
    secondaryMuscles: ['Brachioradialis', 'Forearms'],
    equipment: 'Dumbbell',
    type: 'weight_reps',
    defaultSets: 3,
    defaultReps: 12,
    defaultWeight: 14,
    caloriesPerSet: 7,
    instructions: 'Hold dumbbells with palms facing each other. Curl upwards maintaining neutral wrist alignment.',
  },

  // CORE & ABS
  {
    id: 'ex-plank',
    name: 'Forearm Core Plank',
    muscleGroup: 'Core',
    secondaryMuscles: ['Transverse Abdominis', 'Lower Back'],
    equipment: 'Bodyweight',
    type: 'weight_reps',
    defaultSets: 3,
    defaultReps: 60, // 60 seconds
    defaultWeight: 0,
    caloriesPerSet: 8,
    instructions: 'Hold rigid bridge position on elbows and toes with neutral spine and engaged glutes.',
  },
  {
    id: 'ex-hanging-leg-raise',
    name: 'Hanging Leg Raise',
    muscleGroup: 'Core',
    secondaryMuscles: ['Lower Abs', 'Hip Flexors'],
    equipment: 'Bodyweight',
    type: 'weight_reps',
    defaultSets: 3,
    defaultReps: 12,
    defaultWeight: 0,
    caloriesPerSet: 9,
    instructions: 'Hang from pull-up bar. Raise legs straight until parallel with floor without swinging.',
  },
  {
    id: 'ex-cable-woodchopper',
    name: 'Cable Standing Woodchopper',
    muscleGroup: 'Core',
    secondaryMuscles: ['Obliques', 'Rotational Core'],
    equipment: 'Cable',
    type: 'weight_reps',
    defaultSets: 3,
    defaultReps: 12,
    defaultWeight: 18,
    caloriesPerSet: 8,
    instructions: 'Rotate torso diagonally across body against cable resistance with core braced.',
  },

  // CARDIO & CONDITIONING
  {
    id: 'ex-treadmill-hiit',
    name: 'Treadmill Incline Sprints',
    muscleGroup: 'Cardio',
    secondaryMuscles: ['Quads', 'Calves', 'Heart Rate'],
    equipment: 'Cardio',
    type: 'cardio_duration',
    defaultSets: 1,
    defaultReps: 1,
    defaultDuration: 20, // mins
    caloriesPerSet: 220,
    instructions: 'Alternate between 30-second all-out sprint intervals and 60-second recovery walks.',
  },
  {
    id: 'ex-kettlebell-swings',
    name: 'Kettlebell Russian Swings',
    muscleGroup: 'Cardio',
    secondaryMuscles: ['Glutes', 'Hamstrings', 'Lower Back'],
    equipment: 'Kettlebell',
    type: 'weight_reps',
    defaultSets: 4,
    defaultReps: 20,
    defaultWeight: 20,
    caloriesPerSet: 15,
    instructions: 'Drive hips forcefully forward to swing kettlebell to shoulder height. Do not squat.',
  },
  {
    id: 'ex-rowing-intervals',
    name: 'Concept2 Rowing Intervals',
    muscleGroup: 'Cardio',
    secondaryMuscles: ['Full Body', 'Cardiorespiratory'],
    equipment: 'Cardio',
    type: 'cardio_duration',
    defaultSets: 1,
    defaultReps: 1,
    defaultDuration: 15,
    caloriesPerSet: 180,
    instructions: 'Drive with legs first, lean back slightly, then pull handle to sternum with smooth cadence.',
  },
];

// ============================================
// STANDARDIZED 7-DAY FIXED WORKOUT ROUTINE
// Everyday's set of exercise is fixed & standardized
// ============================================

export const FIXED_WEEKLY_ROUTINES = {
  // Monday (Day 1): Legs & Lower Body Power
  1: {
    dayName: 'Monday',
    title: 'Legs & Lower Body Compound',
    focus: 'Quads, Hamstrings & Glutes',
    estDuration: '50 mins',
    targetMuscles: ['Legs', 'Glutes', 'Calves'],
    overview: 'High-intensity lower body training focusing on squat strength, posterior chain hinge, and quad isolation.',
    exercises: [
      { exerciseId: 'ex-barbell-squat', sets: 4, reps: 8, weight: 80, estDurationSec: 45, restSec: 90 },
      { exerciseId: 'ex-romanian-deadlift', sets: 3, reps: 10, weight: 60, estDurationSec: 45, restSec: 75 },
      { exerciseId: 'ex-leg-press', sets: 3, reps: 12, weight: 140, estDurationSec: 45, restSec: 60 },
      { exerciseId: 'ex-bulgarian-split-squat', sets: 3, reps: 10, weight: 16, estDurationSec: 45, restSec: 60 },
      { exerciseId: 'ex-leg-curl', sets: 3, reps: 12, weight: 40, estDurationSec: 40, restSec: 45 },
      { exerciseId: 'ex-calf-raise', sets: 4, reps: 15, weight: 50, estDurationSec: 35, restSec: 45 },
    ],
  },

  // Tuesday (Day 2): Biceps, Back & Pull Strength
  2: {
    dayName: 'Tuesday',
    title: 'Biceps & Back Pull Power',
    focus: 'Biceps, Lats & Upper Back',
    estDuration: '50 mins',
    targetMuscles: ['Arms', 'Back', 'Shoulders'],
    overview: 'Targeted pull routine focusing on heavy back recruitment, lat width, and dedicated bicep peak hypertrophy.',
    exercises: [
      { exerciseId: 'ex-deadlift', sets: 4, reps: 6, weight: 100, estDurationSec: 50, restSec: 90 },
      { exerciseId: 'ex-lat-pulldown', sets: 4, reps: 10, weight: 50, estDurationSec: 45, restSec: 60 },
      { exerciseId: 'ex-barbell-row', sets: 3, reps: 10, weight: 50, estDurationSec: 45, restSec: 60 },
      { exerciseId: 'ex-barbell-curl', sets: 3, reps: 10, weight: 30, estDurationSec: 40, restSec: 60 },
      { exerciseId: 'ex-incline-db-curl', sets: 3, reps: 12, weight: 12, estDurationSec: 40, restSec: 45 },
      { exerciseId: 'ex-hammer-curl', sets: 3, reps: 12, weight: 14, estDurationSec: 40, restSec: 45 },
    ],
  },

  // Wednesday (Day 3): Chest, Shoulders & Triceps
  3: {
    dayName: 'Wednesday',
    title: 'Push Power & Upper Torso',
    focus: 'Chest, Delts & Triceps',
    estDuration: '50 mins',
    targetMuscles: ['Chest', 'Shoulders', 'Triceps'],
    overview: 'High-density push session focused on horizontal pressing strength, shoulder lateral width, and tricep extension.',
    exercises: [
      { exerciseId: 'ex-bench-press', sets: 4, reps: 10, weight: 60, estDurationSec: 45, restSec: 90 },
      { exerciseId: 'ex-incline-db-press', sets: 3, reps: 12, weight: 22, estDurationSec: 45, restSec: 60 },
      { exerciseId: 'ex-overhead-press', sets: 3, reps: 8, weight: 40, estDurationSec: 45, restSec: 75 },
      { exerciseId: 'ex-cable-chest-fly', sets: 3, reps: 15, weight: 15, estDurationSec: 40, restSec: 45 },
      { exerciseId: 'ex-db-lateral-raise', sets: 4, reps: 15, weight: 10, estDurationSec: 35, restSec: 45 },
      { exerciseId: 'ex-tricep-rope-pushdown', sets: 3, reps: 12, weight: 25, estDurationSec: 40, restSec: 45 },
    ],
  },

  // Thursday (Day 4): Legs & Core Hypertrophy
  4: {
    dayName: 'Thursday',
    title: 'Lower Chain & Core Hypertrophy',
    focus: 'Quads, Posterior Chain & Abdominals',
    estDuration: '45 mins',
    targetMuscles: ['Legs', 'Core', 'Glutes'],
    overview: 'Unilateral leg strength, athletic single-leg stability, and progressive core rotational conditioning.',
    exercises: [
      { exerciseId: 'ex-leg-press', sets: 4, reps: 12, weight: 130, estDurationSec: 45, restSec: 60 },
      { exerciseId: 'ex-bulgarian-split-squat', sets: 3, reps: 10, weight: 16, estDurationSec: 45, restSec: 60 },
      { exerciseId: 'ex-leg-curl', sets: 3, reps: 12, weight: 40, estDurationSec: 40, restSec: 45 },
      { exerciseId: 'ex-calf-raise', sets: 4, reps: 15, weight: 50, estDurationSec: 35, restSec: 45 },
      { exerciseId: 'ex-hanging-leg-raise', sets: 3, reps: 12, weight: 0, estDurationSec: 40, restSec: 45 },
      { exerciseId: 'ex-plank', sets: 3, reps: 60, weight: 0, estDurationSec: 60, restSec: 45 },
    ],
  },

  // Friday (Day 5): Arms & Upper Body Hypertrophy
  5: {
    dayName: 'Friday',
    title: 'Arms & Upper Symmetrical Mass',
    focus: 'Biceps, Triceps & Upper Body',
    estDuration: '45 mins',
    targetMuscles: ['Arms', 'Chest', 'Back'],
    overview: 'Complete arm pump session supersetting biceps and triceps alongside upper-body stabilizer compound work.',
    exercises: [
      { exerciseId: 'ex-incline-db-press', sets: 3, reps: 12, weight: 22, estDurationSec: 45, restSec: 60 },
      { exerciseId: 'ex-seated-cable-row', sets: 3, reps: 12, weight: 45, estDurationSec: 45, restSec: 60 },
      { exerciseId: 'ex-barbell-curl', sets: 3, reps: 10, weight: 30, estDurationSec: 40, restSec: 45 },
      { exerciseId: 'ex-skull-crushers', sets: 3, reps: 10, weight: 25, estDurationSec: 40, restSec: 45 },
      { exerciseId: 'ex-hammer-curl', sets: 3, reps: 12, weight: 14, estDurationSec: 40, restSec: 45 },
      { exerciseId: 'ex-dips-chest', sets: 3, reps: 12, weight: 0, estDurationSec: 40, restSec: 60 },
    ],
  },

  // Saturday (Day 6): Conditioning & Functional HIIT
  6: {
    dayName: 'Saturday',
    title: 'Conditioning & Functional HIIT',
    focus: 'Cardiorespiratory & Full Body',
    estDuration: '40 mins',
    targetMuscles: ['Cardio', 'Chest', 'Back', 'Legs'],
    overview: 'High-energy metabolic conditioning and interval sprints to maximize cardiovascular endurance.',
    exercises: [
      { exerciseId: 'ex-kettlebell-swings', sets: 4, reps: 20, weight: 20, estDurationSec: 45, restSec: 45 },
      { exerciseId: 'ex-treadmill-hiit', sets: 1, reps: 1, weight: 0, duration: 20, estDurationSec: 1200, restSec: 60 },
      { exerciseId: 'ex-pushups', sets: 3, reps: 15, weight: 0, estDurationSec: 35, restSec: 45 },
      { exerciseId: 'ex-pullups', sets: 3, reps: 8, weight: 0, estDurationSec: 35, restSec: 60 },
      { exerciseId: 'ex-plank', sets: 3, reps: 60, weight: 0, estDurationSec: 60, restSec: 45 },
    ],
  },

  // Sunday (Day 0): Active Recovery & Core Mobility
  0: {
    dayName: 'Sunday',
    title: 'Active Recovery & Core Mobility',
    focus: 'Cardio Base & Core Health',
    estDuration: '35 mins',
    targetMuscles: ['Core', 'Cardio'],
    overview: 'Low-impact cardiovascular conditioning, core stability, and total-body joint recovery.',
    exercises: [
      { exerciseId: 'ex-rowing-intervals', sets: 1, reps: 1, weight: 0, duration: 20, estDurationSec: 1200, restSec: 60 },
      { exerciseId: 'ex-hanging-leg-raise', sets: 3, reps: 10, weight: 0, estDurationSec: 40, restSec: 45 },
      { exerciseId: 'ex-plank', sets: 3, reps: 60, weight: 0, estDurationSec: 60, restSec: 45 },
      { exerciseId: 'ex-cable-woodchopper', sets: 3, reps: 12, weight: 15, estDurationSec: 40, restSec: 45 },
    ],
  },
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Returns the standardized routine template for a specific calendar date (YYYY-MM-DD)
 */
export function getRoutineForDate(dateStr) {
  const parts = dateStr.split('-').map(Number);
  const dateObj = new Date(parts[0], parts[1] - 1, parts[2]);
  const dayOfWeek = dateObj.getDay(); // 0 = Sun, 1 = Mon ... 6 = Sat

  const template = FIXED_WEEKLY_ROUTINES[dayOfWeek] || FIXED_WEEKLY_ROUTINES[1];

  // Enrich with full exercise objects from EXERCISE_DATABASE
  const enrichedExercises = template.exercises.map((item, idx) => {
    const fullEx = EXERCISE_DATABASE.find((e) => e.id === item.exerciseId) || {
      id: item.exerciseId,
      name: 'Custom Exercise',
      muscleGroup: 'General',
      equipment: 'General',
      type: 'weight_reps',
      caloriesPerSet: 10,
    };

    // Generate set records
    const setList = [];
    const setsCount = item.sets || fullEx.defaultSets || 3;
    const estWorkSec = item.estDurationSec || 45;
    const estRestSec = item.restSec || 60;

    for (let s = 1; s <= setsCount; s++) {
      setList.push({
        setNumber: s,
        reps: item.reps || fullEx.defaultReps || 10,
        weight: item.weight ?? fullEx.defaultWeight ?? 0,
        duration: item.duration ?? fullEx.defaultDuration ?? 0,
        estDurationSec: estWorkSec,
        restSec: estRestSec,
        completed: false,
      });
    }

    const estMinutes = Math.max(
      1,
      Math.round((setsCount * (estWorkSec + estRestSec)) / 60)
    );

    return {
      id: `std-ex-${idx}-${item.exerciseId}`,
      exerciseId: item.exerciseId,
      exercise: fullEx,
      sets: setList,
      estMinutes,
      completed: false,
      notes: '',
    };
  });

  return {
    ...template,
    date: dateStr,
    exercises: enrichedExercises,
    completed: false,
    completedAt: null,
  };
}

/**
 * Calculates volume and estimated energy expenditure for a logged workout
 */
export function calculateWorkoutStats(workoutLog) {
  if (!workoutLog || !workoutLog.exercises) {
    return {
      totalVolume: 0,
      completedVolume: 0,
      totalSets: 0,
      completedSets: 0,
      estCalories: 0,
      completedCalories: 0,
      completedCount: 0,
      totalExercises: 0,
      completionPercentage: 0,
    };
  }

  let totalVolume = 0;
  let completedVolume = 0;
  let totalSets = 0;
  let completedSets = 0;
  let estCalories = 0;
  let completedCalories = 0;
  let completedCount = 0;

  workoutLog.exercises.forEach((item) => {
    if (item.completed) completedCount++;

    (item.sets || []).forEach((set) => {
      totalSets++;
      const calRate = item.exercise?.caloriesPerSet || 10;
      estCalories += calRate;

      const setVol = (set.weight || 0) * (set.reps || 0);
      totalVolume += setVol;

      if (set.completed || item.completed) {
        completedSets++;
        completedCalories += calRate;
        completedVolume += setVol;
      }
    });
  });

  const totalExercises = workoutLog.exercises.length;
  const completionPercentage = totalExercises > 0
    ? Math.round((completedCount / totalExercises) * 100)
    : 0;

  return {
    totalVolume,
    completedVolume,
    totalSets,
    completedSets,
    estCalories,
    completedCalories,
    completedCount,
    totalExercises,
    completionPercentage,
  };
}

