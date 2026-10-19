import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/dashboard/Sidebar';
import { useAuthModal } from '../../context/AuthModalContext';
import { useHealthProfile } from '../../context/HealthProfileContext';
import { getRoutineForDate } from '../../data/exerciseDatabase';
import {
  IconFlame,
  IconUtensils,
  IconWorkout,
  IconHealth,
  IconScale,
  IconCheck,
  IconPieChart,
} from '../../components/common/Icons';
import api from '../../services/api';
import '../../styles/DashboardPage.css';

export default function DashboardPage() {
  const { user } = useAuthModal();
  const { profile, assessmentResults } = useHealthProfile();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mealLogs, setMealLogs] = useState([]);
  const [workoutLogs, setWorkoutLogs] = useState([]);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayDateObj = new Date();
  const formattedToday = todayDateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [dietRes, woRes] = await Promise.all([
          api.get(`/diet/logs?date=${todayStr}`).catch(() => ({ meals: [] })),
          api.get(`/workout/logs?date=${todayStr}`).catch(() => ({ workouts: [] })),
        ]);
        if (dietRes?.meals) setMealLogs(dietRes.meals);
        if (woRes?.workouts) setWorkoutLogs(woRes.workouts);
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
      }
    };
    fetchDashboardData();
  }, [todayStr]);

  const todayRoutine = getRoutineForDate(todayStr);
  const targetCalories = assessmentResults?.targetCalories || 2250;
  
  // Real-time calculations from database logs (fallback to standard baseline if no logs yet)
  const consumedCalories = mealLogs.length > 0
    ? mealLogs.reduce((acc, m) => acc + (Number(m.calories) || 0), 0)
    : 0;

  const consumedProtein = mealLogs.length > 0
    ? mealLogs.reduce((acc, m) => acc + (Number(m.protein_g ?? m.protein) || 0), 0)
    : 0;

  const consumedCarbs = mealLogs.length > 0
    ? mealLogs.reduce((acc, m) => acc + (Number(m.carbs_g ?? m.carbs) || 0), 0)
    : 0;

  const consumedFat = mealLogs.length > 0
    ? mealLogs.reduce((acc, m) => acc + (Number(m.fat_g ?? m.fat) || 0), 0)
    : 0;

  const isWorkoutDone = workoutLogs.length > 0;
  const remainingCalories = Math.max(0, targetCalories - consumedCalories);
  const caloriePercent = Math.min(100, Math.round((consumedCalories / targetCalories) * 100));

  const userBMI = assessmentResults?.bmi || 22.4;
  const userBMICategory = assessmentResults?.bmiCategory || 'Normal';
  const userBMIColor = assessmentResults?.bmiColor || '#10b981';

  // Pie chart calculation for 3 macros
  const totalMacroGrams = (consumedProtein + consumedCarbs + consumedFat) || 1;
  const circ = 2 * Math.PI * 46;
  const proteinPercent = consumedCalories > 0 ? (consumedProtein * 4) / consumedCalories : 0.30;
  const carbsPercent = consumedCalories > 0 ? (consumedCarbs * 4) / consumedCalories : 0.45;
  const fatPercent = consumedCalories > 0 ? (consumedFat * 9) / consumedCalories : 0.25;

  const proteinDash = (proteinPercent || 0.3) * circ;
  const carbsDash = (carbsPercent || 0.45) * circ;
  const fatDash = (fatPercent || 0.25) * circ;

  const carbsOffset = -proteinDash;
  const fatOffset = -(proteinDash + carbsDash);

  // Dynamic Recent Activity list combining live diet and workout logs
  const dynamicActivities = [
    ...workoutLogs.map((wo) => ({
      id: wo.id,
      title: wo.title || 'Workout Completed',
      details: `${wo.duration_mins || wo.duration || 45} mins · Active Routine`,
      tag: `${wo.calories_burned || wo.caloriesBurned || 320} kcal burned`,
      time: wo.created_at
        ? new Date(wo.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : 'Today',
      icon: IconWorkout,
    })),
    ...mealLogs.map((m) => {
      const mealName = m.food_name || m.food?.name || 'Healthy Meal';
      const typeStr = m.meal_type || m.mealType || 'Meal';
      const p = m.protein_g ?? m.protein ?? 0;
      const c = m.carbs_g ?? m.carbs ?? 0;
      const f = m.fat_g ?? m.fat ?? 0;
      const t = m.created_at
        ? new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : (m.timestamp || 'Today');
      return {
        id: m.id,
        title: `${typeStr.charAt(0).toUpperCase() + typeStr.slice(1)}: ${mealName}`,
        details: `${p}g Protein · ${c}g Carbs · ${f}g Fat`,
        tag: `${m.calories || 0} kcal`,
        time: t,
        icon: IconUtensils,
      };
    }),
  ];

  return (
    <div className="dashboard-page-container">
      {/* Sidebar Navigation */}
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      <main className="dashboard-content">
        {/* Top Header */}
        <header className="dash-page-header">
          <div className="dash-header-left">
            <button
              type="button"
              className="mobile-nav-toggle"
              onClick={() => setMobileOpen(true)}
              aria-label="Open Navigation"
            >
              ☰
            </button>
            <div className="dash-page-title">
              <h1>Welcome back, {user?.name || (user?.email ? user.email.split('@')[0] : 'Member')}</h1>
              <p>{formattedToday}</p>
            </div>
          </div>

        </header>

        {/* 4 Core Summary Stat Cards */}
        <section className="dash-metrics-grid">
          {/* 1. Daily Calories */}
          <div className="dash-metric-card">
            <div className="dash-card-top">
              <span className="dash-card-label">Daily Calories</span>
              <IconFlame size={18} color="#0284c7" />
            </div>
            <div className="dash-card-val-row">
              <span className="dash-val-big">{consumedCalories.toLocaleString()}</span>
              <span className="dash-val-sub">/ {targetCalories.toLocaleString()} kcal</span>
            </div>
            <div className="dash-progress-track">
              <div
                className="dash-progress-fill blue"
                style={{ width: `${caloriePercent}%` }}
              />
            </div>
            <div className="dash-card-foot">
              <span>{remainingCalories} kcal remaining</span>
              <strong>{caloriePercent}% consumed</strong>
            </div>
          </div>

          {/* 2. Today's Workout */}
          <div className="dash-metric-card">
            <div className="dash-card-top">
              <span className="dash-card-label">Today&apos;s Workout</span>
              <IconWorkout size={18} color="#16a34a" />
            </div>
            <div className="dash-card-val-row">
              <span className="dash-val-title">{todayRoutine.title}</span>
            </div>
            <div className="dash-progress-track">
              <div
                className="dash-progress-fill green"
                style={{ width: isWorkoutDone ? '100%' : '20%' }}
              />
            </div>
            <div className="dash-card-foot">
              <span>{todayRoutine.exercises?.length || 5} exercises · ~{todayRoutine.estDuration || '45 mins'}</span>
              <span className={isWorkoutDone ? 'badge-completed' : 'badge-in-progress'}>
                {isWorkoutDone ? 'Completed' : 'In Progress'}
              </span>
            </div>
          </div>

          {/* 3. Daily Macros */}
          <div className="dash-metric-card">
            <div className="dash-card-top">
              <span className="dash-card-label">Daily Macros</span>
              <IconUtensils size={18} color="#3b82f6" />
            </div>
            <div className="dash-card-val-row">
              <span className="dash-macro-summary">
                P: {Math.round(consumedProtein)}g · C: {Math.round(consumedCarbs)}g · F: {Math.round(consumedFat)}g
              </span>
            </div>
            <div className="dash-multi-progress-track">
              <div className="dash-multi-fill protein" style={{ width: `${Math.round(proteinPercent * 100)}%` }} title={`Protein ${Math.round(proteinPercent * 100)}%`} />
              <div className="dash-multi-fill carbs" style={{ width: `${Math.round(carbsPercent * 100)}%` }} title={`Carbs ${Math.round(carbsPercent * 100)}%`} />
              <div className="dash-multi-fill fat" style={{ width: `${Math.round(fatPercent * 100)}%` }} title={`Fat ${Math.round(fatPercent * 100)}%`} />
            </div>
            <div className="dash-card-foot">
              <span>Protein: {Math.round(consumedProtein)}/{assessmentResults?.macros?.proteinGrams || 150}g</span>
              <span style={{ color: '#0284c7', fontWeight: 600 }}>
                {Math.round((consumedProtein / (assessmentResults?.macros?.proteinGrams || 150)) * 100)}% target
              </span>
            </div>
          </div>

          {/* 4. Body & Biometrics */}
          <div className="dash-metric-card">
            <div className="dash-card-top">
              <span className="dash-card-label">Body &amp; Biometrics</span>
              <IconScale size={18} color={userBMIColor} />
            </div>
            <div className="dash-card-val-row">
              <span className="dash-val-big">{profile.weight}</span>
              <span className="dash-val-sub">kg ({userBMI} BMI)</span>
            </div>
            <div className="dash-progress-track">
              <div
                className="dash-progress-fill"
                style={{ width: '65%', background: userBMIColor }}
              />
            </div>
            <div className="dash-card-foot">
              <span style={{ color: userBMIColor, fontWeight: 700 }}>{userBMICategory} Weight</span>
              <Link to="/health-assessment" className="dash-card-link">
                Assessment
              </Link>
            </div>
          </div>
        </section>

        {/* 2-Column Daily Overview: Simple Progress Pie Chart vs Today's Workout */}
        <div className="dash-overview-grid">
          {/* Left Column: Simple Graphical Progress & Macro Breakdown */}
          <section className="dash-panel-card dash-pie-progress-card">
            <div className="dash-panel-header">
              <div className="dash-panel-title">
                <IconPieChart size={18} color="#0284c7" />
                <h2>Daily Progress</h2>
              </div>
              <Link to="/diet" className="dash-panel-link">
                Diet Details
              </Link>
            </div>

            {/* Simple Clean Pie / Donut Chart & Legend */}
            <div className="dash-pie-chart-body">
              <div className="dash-donut-container">
                <svg className="dash-donut-svg" viewBox="0 0 120 120">
                  <circle
                    cx="60"
                    cy="60"
                    r="46"
                    fill="none"
                    stroke="#f1f5f9"
                    strokeWidth="14"
                  />

                  {/* Protein Ring Segment */}
                  <circle
                    cx="60"
                    cy="60"
                    r="46"
                    fill="none"
                    stroke="#0284c7"
                    strokeWidth="14"
                    strokeDasharray={`${proteinDash} ${circ}`}
                    strokeDashoffset="0"
                    transform="rotate(-90 60 60)"
                    strokeLinecap="round"
                    className="donut-segment"
                  />

                  {/* Carbs Ring Segment */}
                  <circle
                    cx="60"
                    cy="60"
                    r="46"
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="14"
                    strokeDasharray={`${carbsDash} ${circ}`}
                    strokeDashoffset={carbsOffset}
                    transform="rotate(-90 60 60)"
                    className="donut-segment"
                  />

                  {/* Fat Ring Segment */}
                  <circle
                    cx="60"
                    cy="60"
                    r="46"
                    fill="none"
                    stroke="#f97316"
                    strokeWidth="14"
                    strokeDasharray={`${fatDash} ${circ}`}
                    strokeDashoffset={fatOffset}
                    transform="rotate(-90 60 60)"
                    className="donut-segment"
                  />

                  {/* Centered Calorie Text */}
                  <text x="60" y="56" textAnchor="middle" className="donut-center-val">
                    {caloriePercent}%
                  </text>
                  <text x="60" y="71" textAnchor="middle" className="donut-center-sub">
                    Goal Met
                  </text>
                </svg>
              </div>

              {/* Clean Legend & Macro Stats */}
              <div className="dash-pie-legend">
                {/* Protein */}
                <div className="pie-legend-row">
                  <div className="pie-legend-info">
                    <span className="pie-dot" style={{ background: '#0284c7' }} />
                    <span className="pie-legend-name">Protein</span>
                  </div>
                  <div className="pie-legend-vals">
                    <strong>{Math.round(consumedProtein)}g</strong>
                    <span className="pie-legend-meta">{Math.round(proteinPercent * 100)}% ({Math.round(consumedProtein * 4)} kcal)</span>
                  </div>
                </div>

                {/* Carbs */}
                <div className="pie-legend-row">
                  <div className="pie-legend-info">
                    <span className="pie-dot" style={{ background: '#38bdf8' }} />
                    <span className="pie-legend-name">Carbs</span>
                  </div>
                  <div className="pie-legend-vals">
                    <strong>{Math.round(consumedCarbs)}g</strong>
                    <span className="pie-legend-meta">{Math.round(carbsPercent * 100)}% ({Math.round(consumedCarbs * 4)} kcal)</span>
                  </div>
                </div>

                {/* Fats */}
                <div className="pie-legend-row">
                  <div className="pie-legend-info">
                    <span className="pie-dot" style={{ background: '#f97316' }} />
                    <span className="pie-legend-name">Fats</span>
                  </div>
                  <div className="pie-legend-vals">
                    <strong>{Math.round(consumedFat)}g</strong>
                    <span className="pie-legend-meta">{Math.round(fatPercent * 100)}% ({Math.round(consumedFat * 9)} kcal)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Summary Bar */}
            <div className="dash-pie-footer">
              <div className="pie-footer-item">
                <span className="pie-footer-label">Intake Today</span>
                <strong>{consumedCalories.toLocaleString()} / {targetCalories.toLocaleString()} kcal</strong>
              </div>
              <div className="pie-footer-item right">
                <span className="pie-footer-label">Calorie Deficit</span>
                <span className="pie-deficit-badge">
                  <IconCheck size={13} /> {remainingCalories} kcal left
                </span>
              </div>
            </div>
          </section>

          {/* Right Column: Today's Routine Exercises */}
          <section className="dash-panel-card">
            <div className="dash-panel-header">
              <div className="dash-panel-title">
                <IconWorkout size={18} color="#16a34a" />
                <h2>Today&apos;s Workout</h2>
              </div>
              <Link to="/workout" className="dash-panel-link">
                Workout Tracker
              </Link>
            </div>

            {/* Routine Title Highlight */}
            <div className="dash-workout-banner">
              <div className="dash-workout-banner-info">
                <span className="dash-workout-routine-title">{todayRoutine.title}</span>
                <span className="dash-workout-routine-meta">
                  {todayRoutine.exercises?.length || 5} exercises · ~{todayRoutine.estDuration || '45 mins'}
                </span>
              </div>
              <span className={isWorkoutDone ? 'badge-completed' : 'badge-in-progress'}>
                {isWorkoutDone ? 'Completed' : 'In Progress'}
              </span>
            </div>

            <div className="dash-exercises-list">
              {(todayRoutine.exercises || []).slice(0, 4).map((item, idx) => (
                <div className="dash-exercise-row" key={item.id || idx}>
                  <div className="dash-exercise-left">
                    <div className="dash-exercise-num">{idx + 1}</div>
                    <div className="dash-exercise-details">
                      <span className="dash-exercise-name">{item.exercise?.name}</span>
                      <span className="dash-exercise-sub">
                        {item.exercise?.muscleGroup} · {item.sets?.length || 3} sets
                      </span>
                    </div>
                  </div>
                  <span className="dash-exercise-equip">{item.exercise?.equipment || 'Standard'}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Recent Activity Section */}
        <section className="dash-panel-card">
          <div className="dash-panel-header">
            <div className="dash-panel-title">
              <IconHealth size={17} color="#0284c7" />
              <h2>Recent Activity</h2>
            </div>
          </div>

          <div className="dash-activity-list">
            {dynamicActivities.length > 0 ? (
              dynamicActivities.map((act) => {
                const ActIcon = act.icon;
                return (
                  <div className="dash-activity-row" key={act.id}>
                    <div className="dash-activity-left">
                      <div className="dash-activity-icon-box">
                        <ActIcon size={16} color="#0284c7" />
                      </div>
                      <div className="dash-activity-details">
                        <span className="dash-activity-title">{act.title}</span>
                        <span className="dash-activity-sub">{act.details}</span>
                      </div>
                    </div>

                    <div className="dash-activity-right">
                      <span className="dash-activity-tag">{act.tag}</span>
                      <span className="dash-activity-time">{act.time}</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>
                <p>No activity logged yet today. Track a meal or workout to see your real-time log!</p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
