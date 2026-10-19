import { useState, useEffect } from 'react';
import Sidebar from '../../components/dashboard/Sidebar';
import ActiveWorkoutModal from '../../components/workout/ActiveWorkoutModal';
import {
  getRoutineForDate,
  calculateWorkoutStats,
} from '../../data/exerciseDatabase';
import {
  IconWorkout,
  IconDumbbell,
  IconCheckCircle,
  IconCheck,
  IconPlay,
} from '../../components/common/Icons';
import api from '../../services/api';
import '../../styles/WorkoutPage.css';

export default function WorkoutPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Workouts dictionary by date
  const [workoutsByDate, setWorkoutsByDate] = useState(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const defaultToday = getRoutineForDate(todayStr);
    return {
      [todayStr]: defaultToday,
    };
  });

  // Active workout live timer modal
  const [activeTimerOpen, setActiveTimerOpen] = useState(false);
  const [activeTimerExIndex, setActiveTimerExIndex] = useState(0);

  // Sync with backend on date change or mount
  useEffect(() => {
    const fetchWorkoutLog = async () => {
      try {
        const res = await api.get(`/workout/logs?date=${selectedDate}`);
        if (res?.success && res.workouts?.length > 0) {
          const log = res.workouts[0];
          setWorkoutsByDate((prev) => {
            const current = prev[selectedDate] || getRoutineForDate(selectedDate);
            return {
              ...prev,
              [selectedDate]: {
                ...current,
                completed: true,
                completedAt: new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              },
            };
          });
        }
      } catch (err) {
        // Not logged in or network error, silently retain local state
      }
    };
    fetchWorkoutLog();
  }, [selectedDate]);

  // Date parsing & display
  const dateParts = selectedDate.split('-').map(Number);
  const currentDateObj = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
  const todayStr = new Date().toISOString().split('T')[0];
  const isToday = selectedDate === todayStr;

  const formattedDate = currentDateObj.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  // Active routine for selected date
  const currentWorkout = workoutsByDate[selectedDate] || getRoutineForDate(selectedDate);
  const currentExercises = currentWorkout.exercises || [];
  const stats = calculateWorkoutStats(currentWorkout);

  // Date navigation handlers
  const handleDateChange = (days) => {
    const nextDate = new Date(currentDateObj);
    nextDate.setDate(nextDate.getDate() + days);
    const dateString = nextDate.toISOString().split('T')[0];
    setSelectedDate(dateString);

    if (!workoutsByDate[dateString]) {
      const routine = getRoutineForDate(dateString);
      setWorkoutsByDate((prev) => ({
        ...prev,
        [dateString]: routine,
      }));
    }
  };

  const handleJumpToToday = () => {
    setSelectedDate(todayStr);
    if (!workoutsByDate[todayStr]) {
      setWorkoutsByDate((prev) => ({
        ...prev,
        [todayStr]: getRoutineForDate(todayStr),
      }));
    }
  };

  // Toggle entire workout completion
  const handleToggleComplete = async () => {
    const isComp = !currentWorkout.completed;
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const updatedExercises = (currentWorkout.exercises || []).map((ex) => ({
      ...ex,
      completed: isComp,
      sets: (ex.sets || []).map((s) => ({ ...s, completed: isComp })),
    }));

    setWorkoutsByDate((prev) => ({
      ...prev,
      [selectedDate]: {
        ...currentWorkout,
        exercises: updatedExercises,
        completed: isComp,
        completedAt: isComp ? nowTime : null,
      },
    }));

    if (isComp) {
      try {
        await api.post('/workout/logs', {
          date: selectedDate,
          title: currentWorkout.title || 'Daily Workout Routine',
          duration: stats.estDuration || 45,
          caloriesBurned: stats.estCalories || 320,
        });
      } catch (err) {
        console.error('Failed to sync workout with database:', err);
      }
    }
  };

  // Reset standard routine for the selected date
  const handleResetStandardRoutine = () => {
    const standard = getRoutineForDate(selectedDate);
    setWorkoutsByDate((prev) => ({
      ...prev,
      [selectedDate]: standard,
    }));
  };

  // Live timer handlers
  const handleStartTimer = (exerciseIdx = 0) => {
    setActiveTimerExIndex(exerciseIdx);
    setActiveTimerOpen(true);
  };

  const handleUpdateExerciseFromTimer = (updatedEx) => {
    setWorkoutsByDate((prev) => {
      const existing = prev[selectedDate] || getRoutineForDate(selectedDate);
      const exList = existing.exercises || [];
      const updatedList = exList.map((e) => (e.id === updatedEx.id ? updatedEx : e));

      const allDone = updatedList.length > 0 && updatedList.every((e) => e.completed);
      const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      if (allDone && !existing.completed) {
        api.post('/workout/logs', {
          date: selectedDate,
          title: existing.title || 'Daily Workout Routine',
          duration: stats.estDuration || 45,
          caloriesBurned: stats.estCalories || 320,
        }).catch((err) => console.error('Workout log sync error:', err));
      }

      return {
        ...prev,
        [selectedDate]: {
          ...existing,
          exercises: updatedList,
          completed: allDone,
          completedAt: allDone ? (existing.completedAt || nowTime) : null,
        },
      };
    });
  };

  const handleCompleteWorkoutFromTimer = () => {
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setWorkoutsByDate((prev) => {
      const existing = prev[selectedDate] || getRoutineForDate(selectedDate);
      return {
        ...prev,
        [selectedDate]: {
          ...existing,
          completed: true,
          completedAt: existing.completedAt || nowTime,
        },
      };
    });

    api.post('/workout/logs', {
      date: selectedDate,
      title: currentWorkout.title || 'Daily Workout Routine',
      duration: stats.estDuration || 45,
      caloriesBurned: stats.estCalories || 320,
    }).catch((err) => console.error('Workout log sync error:', err));
  };

  // 1-Click toggle for individual exercise completion
  const handleToggleExercise = (item, e) => {
    e?.stopPropagation?.();
    const newStatus = !item.completed;
    const updatedSets = (item.sets || []).map((s) => ({ ...s, completed: newStatus }));
    const updatedItem = { ...item, completed: newStatus, sets: updatedSets };
    handleUpdateExerciseFromTimer(updatedItem);
  };

  // ── INLINE CONTROLS: ADJUST SETS COUNT ON THE FLY ──
  const handleUpdateSetsCount = (exerciseId, delta) => {
    setWorkoutsByDate((prev) => {
      const existing = prev[selectedDate] || getRoutineForDate(selectedDate);
      const updatedExercises = (existing.exercises || []).map((item) => {
        if (item.id !== exerciseId) return item;

        const currentSets = item.sets || [];
        const newCount = Math.max(1, Math.min(10, currentSets.length + delta));
        if (newCount === currentSets.length) return item;

        let updatedSets = [];
        if (delta > 0) {
          const lastSet = currentSets[currentSets.length - 1] || {
            reps: item.exercise?.defaultReps || 10,
            weight: item.exercise?.defaultWeight || 50,
            duration: item.exercise?.defaultDuration || 0,
            completed: false,
          };
          updatedSets = [
            ...currentSets,
            {
              setNumber: currentSets.length + 1,
              reps: lastSet.reps,
              weight: lastSet.weight,
              duration: lastSet.duration,
              completed: item.completed || false,
            },
          ];
        } else {
          updatedSets = currentSets.slice(0, newCount);
        }

        return {
          ...item,
          sets: updatedSets,
          estMinutes: Math.max(2, updatedSets.length * 2),
        };
      });

      return {
        ...prev,
        [selectedDate]: {
          ...existing,
          exercises: updatedExercises,
        },
      };
    });
  };

  // ── INLINE CONTROLS: ADJUST REPS PER SET ──
  const handleUpdateReps = (exerciseId, delta) => {
    setWorkoutsByDate((prev) => {
      const existing = prev[selectedDate] || getRoutineForDate(selectedDate);
      const updatedExercises = (existing.exercises || []).map((item) => {
        if (item.id !== exerciseId) return item;

        const updatedSets = (item.sets || []).map((s) => ({
          ...s,
          reps: Math.max(1, Math.min(100, (s.reps || 10) + delta)),
        }));

        return {
          ...item,
          sets: updatedSets,
        };
      });

      return {
        ...prev,
        [selectedDate]: {
          ...existing,
          exercises: updatedExercises,
        },
      };
    });
  };

  // ── INLINE CONTROLS: ADJUST WEIGHT PER SET ──
  const handleUpdateWeight = (exerciseId, delta) => {
    setWorkoutsByDate((prev) => {
      const existing = prev[selectedDate] || getRoutineForDate(selectedDate);
      const updatedExercises = (existing.exercises || []).map((item) => {
        if (item.id !== exerciseId) return item;

        const updatedSets = (item.sets || []).map((s) => ({
          ...s,
          weight: Math.max(0, Math.min(500, (s.weight || 0) + delta)),
        }));

        return {
          ...item,
          sets: updatedSets,
        };
      });

      return {
        ...prev,
        [selectedDate]: {
          ...existing,
          exercises: updatedExercises,
        },
      };
    });
  };

  // ── INLINE CONTROLS: ADJUST CARDIO DURATION ──
  const handleUpdateCardioDuration = (exerciseId, delta) => {
    setWorkoutsByDate((prev) => {
      const existing = prev[selectedDate] || getRoutineForDate(selectedDate);
      const updatedExercises = (existing.exercises || []).map((item) => {
        if (item.id !== exerciseId) return item;

        const updatedSets = (item.sets || []).map((s) => ({
          ...s,
          duration: Math.max(5, Math.min(180, (s.duration || 20) + delta)),
        }));

        const totalMins = updatedSets.reduce((sum, s) => sum + (s.duration || 0), 0);

        return {
          ...item,
          sets: updatedSets,
          estMinutes: totalMins,
        };
      });

      return {
        ...prev,
        [selectedDate]: {
          ...existing,
          exercises: updatedExercises,
        },
      };
    });
  };

  // Calculate volume per exercise
  const getExerciseVolume = (item) => {
    if (item.exercise?.type === 'cardio_duration') {
      const totalMins = (item.sets || []).reduce((sum, s) => sum + (s.duration || 0), 0);
      return `${totalMins} mins`;
    }
    const vol = (item.sets || []).reduce((sum, s) => sum + ((s.weight || 0) * (s.reps || 0)), 0);
    return `${vol.toLocaleString()} kg`;
  };

  const firstIncompleteIdx = currentExercises.findIndex((ex) => !ex.completed);
  const startIdx = firstIncompleteIdx >= 0 ? firstIncompleteIdx : 0;

  return (
    <div className="workout-page-container">
      {/* Sidebar Navigation */}
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      <main className="workout-content">
        {/* Top Header */}
        <header className="workout-header">
          <div className="workout-header-left">
            <h1>Workout &amp; Exercise Tracker</h1>
            <p>Your predefined daily training routine with inline sets &amp; weight controls</p>
          </div>

          <div className="workout-header-actions">
            {/* Date Navigator */}
            <div className="workout-date-nav">
              <button
                type="button"
                className="workout-date-nav-btn"
                onClick={() => handleDateChange(-1)}
                title="Previous Day"
                aria-label="Previous Day"
              >
                ‹
              </button>

              <input
                type="date"
                className="workout-date-picker-field"
                value={selectedDate}
                onChange={(e) => {
                  if (e.target.value) setSelectedDate(e.target.value);
                }}
                onClick={(e) => {
                  try {
                    e.target.showPicker?.();
                  } catch { }
                }}
                title="Select date"
                aria-label="Select Date"
              />

              <button
                type="button"
                className="workout-date-nav-btn"
                onClick={() => handleDateChange(1)}
                title="Next Day"
                aria-label="Next Day"
              >
                ›
              </button>

              {!isToday && (
                <button
                  type="button"
                  className="btn-today-quick"
                  onClick={handleJumpToToday}
                >
                  Today
                </button>
              )}
            </div>

            {/* Master Start Workout Session Button */}
            {currentExercises.length > 0 && (
              <button
                type="button"
                className="btn-start-workout-master"
                onClick={() => handleStartTimer(startIdx)}
                title="Launch interactive workout timer"
              >
                <IconPlay size={15} />
                <span>{currentWorkout.completed ? 'Replay Workout' : 'Start Workout'}</span>
              </button>
            )}

            {/* Mark Workout Complete Toggle */}
            <button
              type="button"
              className={`btn-mark-complete ${currentWorkout.completed ? 'completed' : ''}`}
              onClick={handleToggleComplete}
              title={currentWorkout.completed ? 'Mark In Progress' : 'Mark Completed'}
            >
              <IconCheckCircle size={16} />
              <span>{currentWorkout.completed ? 'Completed' : 'Mark Complete'}</span>
            </button>
          </div>
        </header>

        {/* Clean Workout Summary Card */}
        <section className="workout-summary-card">
          <div className="workout-summary-header">
            <div>
              <h2 className="workout-routine-title">{currentWorkout.title || 'Daily Workout Routine'}</h2>
              <span className="workout-routine-sub">
                {currentWorkout.focus || 'Target Muscle Training'} · {currentWorkout.estDuration || '50 mins'} est. duration ({formattedDate})
              </span>
            </div>

            <div className="workout-status-badge-wrap">
              {currentWorkout.completed ? (
                <span className="workout-status-badge completed">
                  <IconCheck size={14} /> Completed {currentWorkout.completedAt ? `at ${currentWorkout.completedAt}` : ''}
                </span>
              ) : (
                <span className="workout-status-badge in-progress">
                  {stats.completedCount} of {stats.totalExercises} done ({stats.completionPercentage}%)
                </span>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="workout-progress-strip">
            <div className="workout-progress-track">
              <div
                className="workout-progress-fill"
                style={{
                  width: `${stats.completionPercentage}%`,
                  backgroundColor: currentWorkout.completed ? '#16a34a' : '#0284c7',
                }}
              />
            </div>
          </div>

          {/* 4 Clean Metric Cards */}
          <div className="workout-metrics-grid">
            <div className="workout-metric-item">
              <div className="metric-header">
                <span className="metric-title">Exercises</span>
                <span className="metric-vals">
                  <strong>{stats.completedCount}</strong> / {stats.totalExercises}
                </span>
              </div>
              <div className="metric-bar-track">
                <div
                  className="metric-bar-fill blue"
                  style={{ width: `${stats.completionPercentage}%` }}
                />
              </div>
            </div>

            <div className="workout-metric-item">
              <div className="metric-header">
                <span className="metric-title">Sets Done</span>
                <span className="metric-vals">
                  <strong>{stats.completedSets}</strong> / {stats.totalSets}
                </span>
              </div>
              <div className="metric-bar-track">
                <div
                  className="metric-bar-fill sky"
                  style={{ width: `${stats.totalSets > 0 ? (stats.completedSets / stats.totalSets) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div className="workout-metric-item">
              <div className="metric-header">
                <span className="metric-title">Volume Lifted</span>
                <span className="metric-vals">
                  <strong>{stats.completedVolume.toLocaleString()}</strong> kg
                </span>
              </div>
              <div className="metric-bar-track">
                <div
                  className="metric-bar-fill purple"
                  style={{ width: `${stats.totalVolume > 0 ? (stats.completedVolume / stats.totalVolume) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div className="workout-metric-item">
              <div className="metric-header">
                <span className="metric-title">Energy Burn</span>
                <span className="metric-vals">
                  <strong>~{stats.completedCalories}</strong> / {stats.estCalories} kcal
                </span>
              </div>
              <div className="metric-bar-track">
                <div
                  className="metric-bar-fill orange"
                  style={{ width: `${stats.estCalories > 0 ? (stats.completedCalories / stats.estCalories) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Exercises Section Panel with Inline Set Controls */}
        <section className="workout-exercises-panel">
          <div className="exercises-panel-header">
            <div className="panel-header-left">
              <h2>Routine Exercises </h2>
              <p>Adjust sets, reps, or weights inline, then click the checkmark or Start Timer</p>
            </div>

            <div className="panel-header-actions">
              <button
                type="button"
                className="btn-reset-routine"
                onClick={handleResetStandardRoutine}
                title="Reset standard routine for this day"
              >
                ↺ Reset Routine
              </button>
            </div>
          </div>

          {/* Exercises List */}
          {currentExercises.length > 0 ? (
            <div className="workout-exercises-list">
              {currentExercises.map((item, idx) => {
                const muscleClass = (item.exercise?.muscleGroup || 'core').toLowerCase();
                const isCompleted = item.completed;
                const isCardio = item.exercise?.type === 'cardio_duration';
                const firstSet = item.sets?.[0] || {};

                return (
                  <div
                    className={`exercise-row-card ${isCompleted ? 'completed' : ''}`}
                    key={item.id}
                  >
                    <div className="exercise-row-left">
                      {/* Interactive 1-Click Checkbox Circle */}
                      <button
                        type="button"
                        className={`btn-check-circle ${isCompleted ? 'checked' : ''}`}
                        onClick={(e) => handleToggleExercise(item, e)}
                        title={isCompleted ? 'Mark Incomplete' : 'Mark Completed'}
                        aria-label="Toggle Completion"
                      >
                        {isCompleted ? <IconCheck size={14} /> : idx + 1}
                      </button>

                      <div className="exercise-icon-box">
                        <IconDumbbell size={18} color={isCompleted ? '#16a34a' : '#0284c7'} />
                      </div>

                      <div className="exercise-details">
                        <div className="exercise-name-row">
                          <span className="exercise-title">{item.exercise?.name || 'Exercise'}</span>
                          <span className={`muscle-tag ${muscleClass}`}>
                            {item.exercise?.muscleGroup || 'General'}
                          </span>
                          {isCompleted && (
                            <span className="done-badge">✓ Done</span>
                          )}
                        </div>

                        {/* Inline Controls: Sets, Reps, Weight / Duration Steppers */}
                        <div className="exercise-inline-controls">
                          {/* Sets Stepper */}
                          <div className="inline-control-pill" title="Adjust number of sets">
                            <span className="control-lbl">Sets:</span>
                            <button
                              type="button"
                              className="btn-inline-step"
                              onClick={() => handleUpdateSetsCount(item.id, -1)}
                              disabled={(item.sets?.length || 0) <= 1}
                              title="Decrease sets"
                            >
                              –
                            </button>
                            <span className="control-val">{item.sets?.length || 0}</span>
                            <button
                              type="button"
                              className="btn-inline-step"
                              onClick={() => handleUpdateSetsCount(item.id, 1)}
                              disabled={(item.sets?.length || 0) >= 10}
                              title="Increase sets"
                            >
                              +
                            </button>
                          </div>

                          {/* Reps Stepper (for weight training) */}
                          {!isCardio ? (
                            <div className="inline-control-pill" title="Adjust reps per set">
                              <span className="control-lbl">Reps:</span>
                              <button
                                type="button"
                                className="btn-inline-step"
                                onClick={() => handleUpdateReps(item.id, -1)}
                                disabled={(firstSet.reps || 10) <= 1}
                                title="Decrease reps"
                              >
                                –
                              </button>
                              <span className="control-val">{firstSet.reps || 10}</span>
                              <button
                                type="button"
                                className="btn-inline-step"
                                onClick={() => handleUpdateReps(item.id, 1)}
                                title="Increase reps"
                              >
                                +
                              </button>
                            </div>
                          ) : null}

                          {/* Weight Stepper (for weight training) */}
                          {!isCardio ? (
                            <div className="inline-control-pill" title="Adjust weight (kg)">
                              <span className="control-lbl">Weight:</span>
                              <button
                                type="button"
                                className="btn-inline-step"
                                onClick={() => handleUpdateWeight(item.id, -5)}
                                disabled={(firstSet.weight || 0) <= 0}
                                title="Decrease weight by 5kg"
                              >
                                –
                              </button>
                              <span className="control-val">{firstSet.weight || 0} kg</span>
                              <button
                                type="button"
                                className="btn-inline-step"
                                onClick={() => handleUpdateWeight(item.id, 5)}
                                title="Increase weight by 5kg"
                              >
                                +
                              </button>
                            </div>
                          ) : (
                            /* Duration Stepper (for cardio) */
                            <div className="inline-control-pill" title="Adjust duration">
                              <span className="control-lbl">Duration:</span>
                              <button
                                type="button"
                                className="btn-inline-step"
                                onClick={() => handleUpdateCardioDuration(item.id, -5)}
                                disabled={(firstSet.duration || 20) <= 5}
                                title="Decrease duration by 5m"
                              >
                                –
                              </button>
                              <span className="control-val">{firstSet.duration || 20} min</span>
                              <button
                                type="button"
                                className="btn-inline-step"
                                onClick={() => handleUpdateCardioDuration(item.id, 5)}
                                title="Increase duration by 5m"
                              >
                                +
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="exercise-row-right">
                      <div className="exercise-volume-block">
                        <span className="volume-val">{getExerciseVolume(item)}</span>
                        <span className="volume-time">
                          ~{item.estMinutes || 6} mins · {item.sets?.length || 0} sets
                        </span>
                      </div>

                      {/* Start Exercise Timer CTA */}
                      <button
                        type="button"
                        className={`btn-start-single ${isCompleted ? 'done' : ''}`}
                        onClick={() => handleStartTimer(idx)}
                        title="Start timer for this exercise"
                      >
                        {isCompleted ? (
                          <>
                            <IconCheck size={13} />
                            <span>Done</span>
                          </>
                        ) : (
                          <>
                            <IconPlay size={13} />
                            <span>Start</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Clean Empty / Rest Day State */
            <div className="workout-empty-card">
              <div className="workout-empty-icon">
                <IconWorkout size={28} color="#94a3b8" />
              </div>
              <h3>No Active Exercises for {formattedDate}</h3>
              <p>You can reload the standard routine for this day of the week anytime.</p>
              <div className="empty-actions-row">
                <button
                  type="button"
                  className="btn-reset-routine-primary"
                  onClick={handleResetStandardRoutine}
                >
                  ↺ Load Standard Daily Routine
                </button>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Live Interactive Timer & Exercise Progression Modal */}
      <ActiveWorkoutModal
        isOpen={activeTimerOpen}
        onClose={() => setActiveTimerOpen(false)}
        exercises={currentExercises}
        initialExerciseIndex={activeTimerExIndex}
        onUpdateExercise={handleUpdateExerciseFromTimer}
        onCompleteWorkout={handleCompleteWorkoutFromTimer}
      />
    </div>
  );
}
