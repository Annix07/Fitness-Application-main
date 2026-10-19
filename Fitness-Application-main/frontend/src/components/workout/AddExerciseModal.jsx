import { useState, useEffect, useMemo, useRef } from 'react';
import { EXERCISE_DATABASE } from '../../data/exerciseDatabase';
import {
  IconDumbbell,
  IconPlus,
  IconTrash,
} from '../common/Icons';
import '../../styles/AddExerciseModal.css';

const MUSCLE_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'Chest', label: 'Chest' },
  { id: 'Back', label: 'Back' },
  { id: 'Legs', label: 'Legs' },
  { id: 'Shoulders', label: 'Shoulders' },
  { id: 'Arms', label: 'Arms' },
  { id: 'Core', label: 'Core' },
  { id: 'Cardio', label: 'Cardio' },
];

export default function AddExerciseModal({
  isOpen,
  onClose,
  onSave,
  editItem = null,
}) {
  const [muscleFilter, setMuscleFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [stagedExercises, setStagedExercises] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');

  // Edit Mode specific states
  const [editExercise, setEditExercise] = useState(null);
  const [editSets, setEditSets] = useState([]);

  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const containerRef = useRef(null);

  // Initialize or reset on open / editItem change
  useEffect(() => {
    if (isOpen) {
      if (editItem) {
        setEditExercise(editItem.exercise || null);
        setSearchQuery(editItem.exercise?.name || '');
        setMuscleFilter(editItem.exercise?.muscleGroup || 'all');
        setEditSets(
          editItem.sets && editItem.sets.length > 0
            ? editItem.sets.map((s, idx) => ({ ...s, setNumber: idx + 1 }))
            : [{ setNumber: 1, reps: 10, weight: 50, duration: 0, completed: false }]
        );
        setStagedExercises([]);
      } else {
        setEditExercise(null);
        setSearchQuery('');
        setMuscleFilter('all');
        setEditSets([]);
        setStagedExercises([]);
        setHighlightedIndex(0);
      }
      setIsDropdownOpen(false);
      setErrorMsg('');

      setTimeout(() => {
        inputRef.current?.focus();
      }, 60);
    }
  }, [isOpen, editItem]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter exercises by muscle category and search text
  const filteredExercises = useMemo(() => {
    let list = EXERCISE_DATABASE;
    if (muscleFilter !== 'all') {
      list = list.filter((ex) => ex.muscleGroup.toLowerCase() === muscleFilter.toLowerCase());
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (ex) =>
          ex.name.toLowerCase().includes(q) ||
          ex.muscleGroup.toLowerCase().includes(q) ||
          ex.equipment.toLowerCase().includes(q)
      );
    }
    return list;
  }, [muscleFilter, searchQuery]);

  // Reset highlight index when query or filter changes
  useEffect(() => {
    setHighlightedIndex(0);
  }, [searchQuery, muscleFilter]);

  // Auto-scroll dropdown to highlighted item
  useEffect(() => {
    if (isDropdownOpen && dropdownRef.current) {
      const activeEl = dropdownRef.current.children[highlightedIndex];
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex, isDropdownOpen]);

  // Helper to generate default sets for an exercise
  const generateInitialSets = (ex, setCount = null) => {
    const count = setCount || ex.defaultSets || 3;
    const initialSets = [];
    for (let i = 1; i <= count; i++) {
      initialSets.push({
        setNumber: i,
        reps: ex.defaultReps || 10,
        weight: ex.defaultWeight ?? 0,
        duration: ex.defaultDuration ?? 0,
        completed: false,
      });
    }
    return initialSets;
  };

  // Select an exercise from dropdown
  const handleSelectExercise = (exercise) => {
    if (editItem) {
      setEditExercise(exercise);
      setSearchQuery(exercise.name);
      setEditSets(generateInitialSets(exercise));
      setIsDropdownOpen(false);
      setErrorMsg('');
      return;
    }

    // Add to staged exercises
    const initialSets = generateInitialSets(exercise);
    const newStaged = {
      id: `ex-log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      exerciseId: exercise.id,
      exercise,
      sets: initialSets,
      estMinutes: exercise.type === 'cardio_duration' ? Math.round((exercise.defaultDuration || 20)) : 6,
      completed: false,
    };

    setStagedExercises((prev) => [...prev, newStaged]);
    setSearchQuery('');
    setIsDropdownOpen(false);
    setErrorMsg('');
  };

  // Keyboard navigation for search input
  const handleKeyDown = (e) => {
    if (!isDropdownOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        setIsDropdownOpen(true);
        return;
      }
    }

    if (isDropdownOpen && filteredExercises.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlightedIndex((prev) => (prev + 1) % filteredExercises.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlightedIndex((prev) => (prev - 1 + filteredExercises.length) % filteredExercises.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const item = filteredExercises[highlightedIndex];
        if (item) {
          handleSelectExercise(item);
        }
      } else if (e.key === 'Escape') {
        setIsDropdownOpen(false);
      }
    }
  };

  // Multi-exercise controls: update sets count
  const handleUpdateStagedSetsCount = (stagedIdx, delta) => {
    setStagedExercises((prev) =>
      prev.map((item, idx) => {
        if (idx !== stagedIdx) return item;
        const currentSets = item.sets || [];
        const newCount = Math.max(1, Math.min(10, currentSets.length + delta));
        if (newCount === currentSets.length) return item;

        let updatedSets = [];
        if (delta > 0) {
          const lastSet = currentSets[currentSets.length - 1] || {
            reps: item.exercise.defaultReps || 10,
            weight: item.exercise.defaultWeight || 0,
            duration: item.exercise.defaultDuration || 0,
          };
          updatedSets = [
            ...currentSets,
            {
              setNumber: currentSets.length + 1,
              reps: lastSet.reps,
              weight: lastSet.weight,
              duration: lastSet.duration,
              completed: false,
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
      })
    );
  };

  // Multi-exercise controls: update reps or weight across sets
  const handleUpdateStagedSetVal = (stagedIdx, field, delta) => {
    setStagedExercises((prev) =>
      prev.map((item, idx) => {
        if (idx !== stagedIdx) return item;
        const updatedSets = item.sets.map((s) => {
          const currentVal = s[field] || 0;
          const newVal = Math.max(0, currentVal + delta);
          return { ...s, [field]: newVal };
        });
        return { ...item, sets: updatedSets };
      })
    );
  };

  // Remove exercise from staged list
  const handleRemoveStagedExercise = (index) => {
    setStagedExercises((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Edit Mode Set Handlers
  const handleAddEditSet = () => {
    const lastSet = editSets[editSets.length - 1];
    setEditSets((prev) => [
      ...prev,
      {
        setNumber: prev.length + 1,
        reps: lastSet ? lastSet.reps : 10,
        weight: lastSet ? lastSet.weight : 50,
        duration: lastSet ? lastSet.duration : 0,
        completed: false,
      },
    ]);
  };

  const handleRemoveEditSet = (index) => {
    if (editSets.length <= 1) {
      setErrorMsg('An exercise must contain at least 1 set.');
      return;
    }
    const updated = editSets.filter((_, idx) => idx !== index).map((s, idx) => ({ ...s, setNumber: idx + 1 }));
    setEditSets(updated);
    setErrorMsg('');
  };

  const handleEditSetField = (index, field, value) => {
    const num = parseFloat(value);
    setEditSets((prev) =>
      prev.map((s, idx) => {
        if (idx === index) {
          return { ...s, [field]: isNaN(num) ? '' : Math.max(0, num) };
        }
        return s;
      })
    );
  };

  // Live Workout Breakdown Metrics
  const summaryMetrics = useMemo(() => {
    if (editItem && editExercise) {
      const isCardio = editExercise.type === 'cardio_duration';
      const setsCount = editSets.length;
      let volume = 0;
      let durationMins = 0;
      let calories = 0;

      if (isCardio) {
        durationMins = editSets.reduce((sum, s) => sum + (Number(s.duration) || 0), 0);
        calories = durationMins * (editExercise.caloriesPerMinute || 8);
      } else {
        volume = editSets.reduce((sum, s) => sum + (Number(s.weight) || 0) * (Number(s.reps) || 0), 0);
        durationMins = Math.max(3, setsCount * 2);
        calories = setsCount * (editExercise.caloriesPerSet || 10);
      }

      return {
        count: 1,
        setsCount,
        volume,
        durationMins,
        calories: Math.round(calories),
      };
    }

    let setsCount = 0;
    let volume = 0;
    let durationMins = 0;
    let calories = 0;

    stagedExercises.forEach((item) => {
      const isCardio = item.exercise?.type === 'cardio_duration';
      const count = item.sets?.length || 0;
      setsCount += count;

      if (isCardio) {
        const d = (item.sets || []).reduce((sum, s) => sum + (Number(s.duration) || 0), 0);
        durationMins += d;
        calories += d * (item.exercise.caloriesPerMinute || 8);
      } else {
        const v = (item.sets || []).reduce((sum, s) => sum + (Number(s.weight) || 0) * (Number(s.reps) || 0), 0);
        volume += v;
        durationMins += Math.max(3, count * 2);
        calories += count * (item.exercise.caloriesPerSet || 10);
      }
    });

    return {
      count: stagedExercises.length,
      setsCount,
      volume,
      durationMins,
      calories: Math.round(calories),
    };
  }, [editItem, editExercise, editSets, stagedExercises]);

  // Submit Handler
  const handleSubmit = (e) => {
    e?.preventDefault?.();
    setErrorMsg('');

    if (editItem) {
      if (!editExercise) {
        setErrorMsg('Please select an exercise.');
        return;
      }
      if (editSets.length === 0) {
        setErrorMsg('Please add at least 1 set.');
        return;
      }

      const isCardio = editExercise.type === 'cardio_duration';
      const updated = {
        id: editItem.id,
        exerciseId: editExercise.id,
        exercise: editExercise,
        sets: editSets.map((s) => ({
          setNumber: s.setNumber,
          reps: Number(s.reps) || 0,
          weight: Number(s.weight) || 0,
          duration: Number(s.duration) || 0,
          completed: s.completed || false,
        })),
        estMinutes: isCardio
          ? editSets.reduce((sum, s) => sum + (Number(s.duration) || 0), 0)
          : Math.max(3, editSets.length * 2),
        completed: editItem.completed || false,
      };

      onSave(updated);
      onClose();
      return;
    }

    if (stagedExercises.length === 0) {
      setErrorMsg('Please select at least one exercise to add.');
      return;
    }

    onSave(stagedExercises);
    onClose();
  };

  if (!isOpen) return null;

  const totalExercisesCount = editItem ? (editExercise ? 1 : 0) : stagedExercises.length;
  const isCardioEdit = editExercise?.type === 'cardio_duration';

  return (
    <div className="simple-modal-overlay" onClick={onClose}>
      <div
        className="simple-modal-box exercise-modal-box"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="simple-modal-header">
          <h2>{editItem ? 'Edit Logged Exercise' : 'Add Exercise to Workout'}</h2>
          <button
            type="button"
            className="simple-modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Modal Content */}
        <div className="simple-modal-content">
          {/* 1. Target Muscle Group / Category */}
          <div className="simple-field-group">
            <label className="simple-label">Muscle Group Filter</label>
            <div className="simple-muscle-pills">
              {MUSCLE_FILTERS.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  className={`simple-muscle-pill ${muscleFilter === m.id ? 'active' : ''}`}
                  onClick={() => setMuscleFilter(m.id)}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Exercise Search & Dropdown */}
          <div className="simple-field-group" ref={containerRef}>
            <label className="simple-label">
              {editItem ? 'Selected Exercise' : 'Click to select exercise from database'}
            </label>
            <div className="simple-input-wrap">
              <input
                ref={inputRef}
                type="text"
                className="simple-food-input"
                placeholder={stagedExercises.length > 0 ? "+ Select another exercise..." : "Click to select or type (e.g. Bench Press, Squat)..."}
                value={searchQuery}
                onFocus={() => setIsDropdownOpen(true)}
                onClick={() => setIsDropdownOpen(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsDropdownOpen(true);
                }}
                onKeyDown={handleKeyDown}
              />
              {searchQuery && (
                <button
                  type="button"
                  className="simple-clear-btn"
                  onClick={() => {
                    setSearchQuery('');
                    setIsDropdownOpen(true);
                    inputRef.current?.focus();
                  }}
                >
                  ✕
                </button>
              )}
            </div>

            {/* Dropdown Options List */}
            {isDropdownOpen && (
              <div className="simple-dropdown-menu" ref={dropdownRef}>
                {filteredExercises.map((ex, i) => (
                  <div
                    key={ex.id}
                    className={`simple-dropdown-option ${i === highlightedIndex ? 'highlighted' : ''}`}
                    onMouseEnter={() => setHighlightedIndex(i)}
                    onClick={() => handleSelectExercise(ex)}
                  >
                    <div className="simple-ex-opt-left">
                      <span className="simple-opt-name">{ex.name}</span>
                      <span className="simple-opt-sub">{ex.muscleGroup} · {ex.equipment}</span>
                    </div>
                    <span className="simple-opt-cals">
                      {ex.type === 'cardio_duration' ? 'Cardio' : `${ex.defaultSets || 3} sets`}
                    </span>
                  </div>
                ))}
                {filteredExercises.length === 0 && (
                  <div className="simple-dropdown-empty">No exercises found</div>
                )}
              </div>
            )}
          </div>

          {/* Edit Mode: Sets Table */}
          {editItem && editExercise && (
            <div className="edit-sets-container">
              <div className="edit-sets-header">
                <span className="edit-sets-title">
                  {editExercise.name} ({editSets.length} sets)
                </span>
                <button
                  type="button"
                  className="btn-add-set-small"
                  onClick={handleAddEditSet}
                >
                  <IconPlus size={13} /> Add Set
                </button>
              </div>

              <div className="edit-sets-table">
                <div className="edit-sets-thead">
                  <div>Set</div>
                  {isCardioEdit ? (
                    <div>Duration (Mins)</div>
                  ) : (
                    <>
                      <div>Reps</div>
                      <div>Weight (kg)</div>
                    </>
                  )}
                  <div style={{ textAlign: 'center' }}>Remove</div>
                </div>

                <div className="edit-sets-tbody">
                  {editSets.map((s, idx) => (
                    <div className="edit-sets-row" key={idx}>
                      <span className="edit-set-num">#{s.setNumber}</span>

                      {isCardioEdit ? (
                        <input
                          type="number"
                          min="1"
                          max="300"
                          className="edit-set-input"
                          value={s.duration}
                          onChange={(e) => handleEditSetField(idx, 'duration', e.target.value)}
                        />
                      ) : (
                        <>
                          <input
                            type="number"
                            min="1"
                            max="200"
                            className="edit-set-input"
                            value={s.reps}
                            onChange={(e) => handleEditSetField(idx, 'reps', e.target.value)}
                          />
                          <input
                            type="number"
                            min="0"
                            max="500"
                            step="0.5"
                            className="edit-set-input"
                            value={s.weight}
                            onChange={(e) => handleEditSetField(idx, 'weight', e.target.value)}
                          />
                        </>
                      )}

                      <div style={{ textAlign: 'center' }}>
                        <button
                          type="button"
                          className="simple-btn-del"
                          onClick={() => handleRemoveEditSet(idx)}
                          title="Remove set"
                        >
                          <IconTrash size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Multi-Exercise Staging List */}
          {!editItem && stagedExercises.length > 0 && (
            <div className="simple-added-list">
              <span className="simple-added-title">Added Exercises ({stagedExercises.length})</span>
              {stagedExercises.map((item, idx) => {
                const isCardio = item.exercise.type === 'cardio_duration';
                const firstSet = item.sets[0] || {};

                return (
                  <div className="simple-exercise-staged-row" key={item.id || idx}>
                    <div className="staged-ex-info">
                      <span className="staged-ex-name">{item.exercise.name}</span>
                      <span className="staged-ex-meta">
                        {item.exercise.muscleGroup} · {item.exercise.equipment}
                      </span>
                    </div>

                    <div className="staged-ex-controls">
                      {/* Sets Count Stepper */}
                      <div className="staged-stepper-block" title="Number of Sets">
                        <span className="stepper-label">Sets</span>
                        <div className="simple-servings-wrap">
                          <button
                            type="button"
                            className="simple-btn-step"
                            onClick={() => handleUpdateStagedSetsCount(idx, -1)}
                            disabled={item.sets.length <= 1}
                          >
                            –
                          </button>
                          <span className="simple-servings-val">{item.sets.length}</span>
                          <button
                            type="button"
                            className="simple-btn-step"
                            onClick={() => handleUpdateStagedSetsCount(idx, 1)}
                            disabled={item.sets.length >= 8}
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Reps Stepper */}
                      {!isCardio && (
                        <div className="staged-stepper-block" title="Reps per set">
                          <span className="stepper-label">Reps</span>
                          <div className="simple-servings-wrap">
                            <button
                              type="button"
                              className="simple-btn-step"
                              onClick={() => handleUpdateStagedSetVal(idx, 'reps', -1)}
                              disabled={(firstSet.reps || 10) <= 1}
                            >
                              –
                            </button>
                            <span className="simple-servings-val">{firstSet.reps || 10}</span>
                            <button
                              type="button"
                              className="simple-btn-step"
                              onClick={() => handleUpdateStagedSetVal(idx, 'reps', 1)}
                            >
                              +
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Weight / Duration Stepper */}
                      {!isCardio ? (
                        <div className="staged-stepper-block" title="Weight (kg)">
                          <span className="stepper-label">Kg</span>
                          <div className="simple-servings-wrap">
                            <button
                              type="button"
                              className="simple-btn-step"
                              onClick={() => handleUpdateStagedSetVal(idx, 'weight', -5)}
                              disabled={(firstSet.weight || 0) <= 0}
                            >
                              –
                            </button>
                            <span className="simple-servings-val">{firstSet.weight || 0}</span>
                            <button
                              type="button"
                              className="simple-btn-step"
                              onClick={() => handleUpdateStagedSetVal(idx, 'weight', 5)}
                            >
                              +
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="staged-stepper-block" title="Duration (mins)">
                          <span className="stepper-label">Mins</span>
                          <div className="simple-servings-wrap">
                            <button
                              type="button"
                              className="simple-btn-step"
                              onClick={() => handleUpdateStagedSetVal(idx, 'duration', -5)}
                              disabled={(firstSet.duration || 20) <= 5}
                            >
                              –
                            </button>
                            <span className="simple-servings-val">{firstSet.duration || 20}</span>
                            <button
                              type="button"
                              className="simple-btn-step"
                              onClick={() => handleUpdateStagedSetVal(idx, 'duration', 5)}
                            >
                              +
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Remove Button */}
                      <button
                        type="button"
                        className="simple-btn-del"
                        onClick={() => handleRemoveStagedExercise(idx)}
                        title="Remove exercise"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {errorMsg && <div className="simple-error-msg">{errorMsg}</div>}

          {/* 3. Workout Breakdown & Impact Box */}
          <div className="simple-breakdown-box">
            <div className="simple-breakdown-title">
              <IconDumbbell size={14} color="#0284c7" />
              <span>Workout Impact Summary</span>
              {totalExercisesCount > 0 && (
                <span className="simple-breakdown-count">
                  ({totalExercisesCount} {totalExercisesCount === 1 ? 'exercise' : 'exercises'})
                </span>
              )}
            </div>

            <div className="simple-breakdown-grid">
              <div className="simple-stat-box highlight">
                <span className="stat-val">{summaryMetrics.setsCount}</span>
                <span className="stat-lbl">Total Sets</span>
              </div>
              <div className="simple-stat-box">
                <span className="stat-val">{summaryMetrics.volume.toLocaleString()} kg</span>
                <span className="stat-lbl">Est. Volume</span>
              </div>
              <div className="simple-stat-box">
                <span className="stat-val">{summaryMetrics.durationMins} mins</span>
                <span className="stat-lbl">Est. Duration</span>
              </div>
              <div className="simple-stat-box">
                <span className="stat-val">~{summaryMetrics.calories}</span>
                <span className="stat-lbl">Burn (kcal)</span>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Modal Footer */}
        <div className="simple-modal-footer">
          <button
            type="button"
            className="simple-btn-cancel"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="simple-btn-submit"
            onClick={handleSubmit}
            disabled={totalExercisesCount === 0}
          >
            {editItem
              ? `Save Changes (${summaryMetrics.setsCount} sets)`
              : totalExercisesCount > 1
              ? `Log ${totalExercisesCount} Exercises (${summaryMetrics.setsCount} sets)`
              : `Log Exercise (${summaryMetrics.setsCount} sets)`}
          </button>
        </div>
      </div>
    </div>
  );
}
