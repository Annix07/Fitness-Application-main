import { useState } from 'react';
import Sidebar from '../../components/dashboard/Sidebar';
import { useHealthProfile } from '../../context/HealthProfileContext';
import {
  ACTIVITY_LEVELS,
  FITNESS_GOALS,
} from '../../data/healthCalculations';
import {
  IconHealth,
  IconScale,
  IconFlame,
  IconTarget,
  IconCheck,
} from '../../components/common/Icons';
import '../../styles/HealthAssessmentPage.css';

export default function HealthAssessmentPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { profile, assessmentResults: results, updateProfile, applyTargets } = useHealthProfile();
  const [toastMessage, setToastMessage] = useState('');

  const gender = profile.gender;
  const age = profile.age;
  const weight = profile.weight;
  const height = profile.height;
  const activity = profile.activity;
  const goal = profile.goal;

  const handleApplyTargets = () => {
    applyTargets();
    setToastMessage(`Applied! Daily target updated to ${results.targetCalories} kcal with ${results.macros.protein.grams}g Protein across MacroPace.`);
    setTimeout(() => {
      setToastMessage('');
    }, 4000);
  };

  return (
    <div className="health-page-container">
      {/* Sidebar Navigation */}
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      <main className="health-content">
        {/* Top Header */}
        <header className="health-header">
          <div className="health-header-left">
            <h1>Health Assessment &amp; Macro Calculator</h1>
            <p>Calculate your daily caloric target, BMI, and personalized macronutrient split</p>
          </div>

          <div className="health-header-actions">
            <button
              type="button"
              className="btn-apply-targets"
              onClick={handleApplyTargets}
            >
              <IconTarget size={16} />
              <span>Apply Targets to Diet Tracker</span>
            </button>
          </div>
        </header>

        {/* 2-Column Clean Layout */}
        <div className="health-grid-layout">
          {/* Left Form Column: User Parameters */}
          <section className="health-form-card">
            <div className="health-card-header">
              <IconScale size={18} color="#0284c7" />
              <h2>Biometric Parameters</h2>
            </div>

            {/* Gender Toggle */}
            <div className="health-field-group">
              <label className="health-label">Biological Sex</label>
              <div className="gender-toggle-group">
                <button
                  type="button"
                  className={`gender-btn ${gender === 'male' ? 'active' : ''}`}
                  onClick={() => updateProfile({ gender: 'male' })}
                >
                  Male
                </button>
                <button
                  type="button"
                  className={`gender-btn ${gender === 'female' ? 'active' : ''}`}
                  onClick={() => updateProfile({ gender: 'female' })}
                >
                  Female
                </button>
              </div>
            </div>

            {/* Inputs Grid: Age, Height, Weight */}
            <div className="health-inputs-grid">
              <div className="health-field-group">
                <label className="health-label" htmlFor="input-age">Age</label>
                <div className="input-with-unit">
                  <input
                    id="input-age"
                    type="number"
                    min="14"
                    max="100"
                    value={age ?? ''}
                    onChange={(e) => updateProfile({ age: e.target.value === '' ? '' : Number(e.target.value) })}
                    onBlur={(e) => {
                      if (!e.target.value || Number(e.target.value) < 14) {
                        updateProfile({ age: Math.max(14, Number(e.target.value) || 25) });
                      }
                    }}
                    placeholder="25"
                    required
                  />
                  <span className="unit-tag">yrs</span>
                </div>
              </div>

              <div className="health-field-group">
                <label className="health-label" htmlFor="input-height">Height</label>
                <div className="input-with-unit">
                  <input
                    id="input-height"
                    type="number"
                    min="100"
                    max="250"
                    value={height ?? ''}
                    onChange={(e) => updateProfile({ height: e.target.value === '' ? '' : Number(e.target.value) })}
                    onBlur={(e) => {
                      if (!e.target.value || Number(e.target.value) < 100) {
                        updateProfile({ height: Math.max(100, Number(e.target.value) || 175) });
                      }
                    }}
                    placeholder="175"
                    required
                  />
                  <span className="unit-tag">cm</span>
                </div>
              </div>

              <div className="health-field-group">
                <label className="health-label" htmlFor="input-weight">Weight</label>
                <div className="input-with-unit">
                  <input
                    id="input-weight"
                    type="number"
                    min="30"
                    max="250"
                    step="0.5"
                    value={weight ?? ''}
                    onChange={(e) => updateProfile({ weight: e.target.value === '' ? '' : Number(e.target.value) })}
                    onBlur={(e) => {
                      if (!e.target.value || Number(e.target.value) < 30) {
                        updateProfile({ weight: Math.max(30, Number(e.target.value) || 70) });
                      }
                    }}
                    placeholder="70"
                    required
                  />
                  <span className="unit-tag">kg</span>
                </div>
              </div>
            </div>

            {/* Activity Level Selector */}
            <div className="health-field-group">
              <label className="health-label" htmlFor="select-activity">Lifestyle &amp; Activity Level</label>
              <select
                id="select-activity"
                className="health-select"
                value={activity}
                onChange={(e) => updateProfile({ activity: e.target.value })}
              >
                {ACTIVITY_LEVELS.map((lvl) => (
                  <option key={lvl.id} value={lvl.id}>
                    {lvl.label} (×{lvl.multiplier}) — {lvl.desc}
                  </option>
                ))}
              </select>
            </div>

            {/* Physique Goal Selection */}
            <div className="health-field-group">
              <label className="health-label">Physique &amp; Calorie Goal</label>
              <div className="goals-select-list">
                {FITNESS_GOALS.map((g) => {
                  const isSelected = goal === g.id;
                  return (
                    <div
                      key={g.id}
                      className={`goal-card-item ${isSelected ? 'active' : ''}`}
                      onClick={() => updateProfile({ goal: g.id })}
                      role="button"
                      tabIndex={0}
                    >
                      <div className="goal-card-info">
                        <div className="goal-card-title-row">
                          <span className="goal-title">{g.label}</span>
                          <span className="goal-delta">
                            {g.calorieAdjustment > 0
                              ? `+${g.calorieAdjustment} kcal`
                              : g.calorieAdjustment < 0
                              ? `${g.calorieAdjustment} kcal`
                              : '0 kcal (Maintenance)'}
                          </span>
                        </div>
                        <p className="goal-desc">{g.desc}</p>
                      </div>
                      <div className={`goal-check-circle ${isSelected ? 'checked' : ''}`}>
                        {isSelected && <IconCheck size={12} />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Right Column: Assessment Results & Macros */}
          <div className="health-results-column">
            {/* Top Primary Summary Card */}
            <section className="health-summary-card">
              <div className="health-summary-top">
                <div className="summary-left">
                  <span className="summary-lbl">Recommended Daily Target</span>
                  <div className="summary-target-val">
                    <span className="cals-number">{results.targetCalories}</span>
                    <span className="cals-unit">kcal / day</span>
                  </div>
                  <span className="summary-goal-badge">
                    {results.goalLabel} ({results.calorieAdjustment >= 0 ? `+${results.calorieAdjustment}` : results.calorieAdjustment} kcal)
                  </span>
                </div>

                <div className="summary-right">
                  <div className="bmi-badge-box" style={{ borderColor: results.bmiColor }}>
                    <span className="bmi-val" style={{ color: results.bmiColor }}>
                      {results.bmi} BMI
                    </span>
                    <span className="bmi-cat">{results.bmiCategory} Weight</span>
                  </div>
                </div>
              </div>

              <div className="ideal-weight-notice">
                Healthy weight range for your height ({height} cm): <strong>{results.idealWeightRange}</strong>
              </div>
            </section>

            {/* Clean Macro Breakdown Card (Matching Diet Tracker Design) */}
            <section className="health-macro-card">
              <div className="health-card-header">
                <IconFlame size={18} color="#0284c7" />
                <h2>Personalized Daily Macronutrient Split</h2>
              </div>

              <div className="health-macro-grid">
                {/* Protein */}
                <div className="macro-meter-box protein">
                  <div className="macro-meter-head">
                    <span className="macro-meter-name">Protein</span>
                    <span className="macro-meter-share">{results.macros.protein.pct}%</span>
                  </div>
                  <div className="macro-meter-val">
                    <strong>{results.macros.protein.grams}g</strong>
                    <span>({results.macros.protein.calories} kcal)</span>
                  </div>
                  <div className="macro-meter-track">
                    <div
                      className="macro-meter-fill protein"
                      style={{ width: `${results.macros.protein.pct}%` }}
                    />
                  </div>
                  <span className="macro-sub-info">2.0g per kg bodyweight</span>
                </div>

                {/* Carbs */}
                <div className="macro-meter-box carbs">
                  <div className="macro-meter-head">
                    <span className="macro-meter-name">Carbohydrates</span>
                    <span className="macro-meter-share">{results.macros.carbs.pct}%</span>
                  </div>
                  <div className="macro-meter-val">
                    <strong>{results.macros.carbs.grams}g</strong>
                    <span>({results.macros.carbs.calories} kcal)</span>
                  </div>
                  <div className="macro-meter-track">
                    <div
                      className="macro-meter-fill carbs"
                      style={{ width: `${results.macros.carbs.pct}%` }}
                    />
                  </div>
                  <span className="macro-sub-info">Primary energy fuel</span>
                </div>

                {/* Fat */}
                <div className="macro-meter-box fat">
                  <div className="macro-meter-head">
                    <span className="macro-meter-name">Fats</span>
                    <span className="macro-meter-share">{results.macros.fat.pct}%</span>
                  </div>
                  <div className="macro-meter-val">
                    <strong>{results.macros.fat.grams}g</strong>
                    <span>({results.macros.fat.calories} kcal)</span>
                  </div>
                  <div className="macro-meter-track">
                    <div
                      className="macro-meter-fill fat"
                      style={{ width: `${results.macros.fat.pct}%` }}
                    />
                  </div>
                  <span className="macro-sub-info">Hormones &amp; cellular health</span>
                </div>
              </div>
            </section>

            {/* Core Metabolic Metrics Card */}
            <section className="health-metrics-card">
              <div className="health-card-header">
                <IconHealth size={18} color="#0284c7" />
                <h2>Metabolic Rates &amp; Energy Balance</h2>
              </div>

              <div className="health-metabolic-grid">
                <div className="metabolic-item">
                  <span className="metabolic-lbl">Basal Rate (BMR)</span>
                  <span className="metabolic-val">
                    <strong>{results.bmr}</strong> kcal
                  </span>
                  <span className="metabolic-sub">Calories at rest</span>
                </div>

                <div className="metabolic-item">
                  <span className="metabolic-lbl">Daily Burn (TDEE)</span>
                  <span className="metabolic-val">
                    <strong>{results.tdee}</strong> kcal
                  </span>
                  <span className="metabolic-sub">Total energy expenditure</span>
                </div>

                <div className="metabolic-item">
                  <span className="metabolic-lbl">Calorie Delta</span>
                  <span className="metabolic-val" style={{ color: results.calorieAdjustment < 0 ? '#0284c7' : results.calorieAdjustment > 0 ? '#ea580c' : '#16a34a' }}>
                    <strong>{results.calorieAdjustment > 0 ? `+${results.calorieAdjustment}` : results.calorieAdjustment}</strong> kcal
                  </span>
                  <span className="metabolic-sub">{results.goalLabel}</span>
                </div>

                <div className="metabolic-item">
                  <span className="metabolic-lbl">Daily Hydration</span>
                  <span className="metabolic-val">
                    <strong>{results.waterLiters}</strong> L
                  </span>
                  <span className="metabolic-sub">Recommended intake</span>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Confirmation Toast Alert */}
      {toastMessage && (
        <div className="toast-notification">
          <IconCheck size={18} color="#16a34a" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
