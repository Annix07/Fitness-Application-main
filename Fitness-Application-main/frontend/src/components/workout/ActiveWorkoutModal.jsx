import { useState, useEffect, useCallback, useRef } from 'react';
import {
  IconCheck,
  IconCheckCircle,
  IconPlay,
  IconPause,
  IconRotateCcw,
  IconSkipForward,
} from '../common/Icons';
import '../../styles/ActiveWorkoutModal.css';

const SET_REST_DURATION = 15;
const EXERCISE_REST_DURATION = 30;
const DEFAULT_SET_WORK_DURATION = 45;

export default function ActiveWorkoutModal({
  isOpen,
  onClose,
  exercises = [],
  initialExerciseIndex = 0,
  onUpdateExercise,
  onCompleteWorkout,
}) {
  const [exIndex, setExIndex] = useState(initialExerciseIndex);
  const [setIndex, setSetIndex] = useState(0);
  const [phase, setPhase] = useState('WORK');
  const [timeLeft, setTimeLeft] = useState(DEFAULT_SET_WORK_DURATION);
  const [isRunning, setIsRunning] = useState(true);

  const exercisesRef = useRef(exercises);
  useEffect(() => {
    exercisesRef.current = exercises;
  }, [exercises]);

  const wasOpenRef = useRef(false);

  // Compute work duration for a set
  const getWorkDuration = useCallback((st, ex) => {
    if (ex?.exercise?.type === 'cardio_duration') {
      const mins = Number(st?.duration) || Number(ex?.exercise?.defaultDuration) || 5;
      return mins * 60;
    }
    return st?.estDurationSec || DEFAULT_SET_WORK_DURATION;
  }, []);

  // Initialize modal state ONLY when modal transitions from closed to open
  useEffect(() => {
    if (isOpen && !wasOpenRef.current) {
      const currentList = exercisesRef.current || [];
      const idx = Math.max(0, Math.min(initialExerciseIndex || 0, Math.max(0, currentList.length - 1)));
      setExIndex(idx);

      const ex = currentList[idx];
      const sets = ex?.sets || [];
      const firstIncomp = sets.findIndex((s) => !s.completed);
      const targetSetIdx = firstIncomp >= 0 ? firstIncomp : 0;

      setSetIndex(targetSetIdx);
      setPhase('WORK');
      const dur = getWorkDuration(sets[targetSetIdx], ex);
      setTimeLeft(dur);
      setIsRunning(true);
    }
    wasOpenRef.current = isOpen;
  }, [isOpen, initialExerciseIndex, getWorkDuration]);

  const currentExercise = (exercises && exercises[exIndex]) || (exercisesRef.current && exercisesRef.current[exIndex]) || null;
  const currentSets = currentExercise?.sets || [];
  const currentSet = currentSets[setIndex] || null;
  const nextExercise = (exercises && exercises[exIndex + 1]) || (exercisesRef.current && exercisesRef.current[exIndex + 1]) || null;

  // Advance after completing a work set
  const handleFinishWorkSet = useCallback(() => {
    const currentList = exercisesRef.current || [];
    const ex = currentList[exIndex];
    if (!ex) return;

    const sets = ex.sets || [];
    const isLastSet = setIndex >= sets.length - 1;
    const isLastEx = exIndex >= currentList.length - 1;

    // Mark current set done in parent
    const updatedSets = sets.map((s, idx) =>
      idx === setIndex ? { ...s, completed: true } : s
    );

    if (isLastSet) {
      // Entire exercise is complete
      const updatedEx = {
        ...ex,
        sets: updatedSets,
        completed: true,
      };
      onUpdateExercise?.(updatedEx);

      if (isLastEx) {
        setPhase('ALL_DONE');
        setIsRunning(false);
        onCompleteWorkout?.();
      } else {
        setPhase('EXERCISE_REST');
        setTimeLeft(EXERCISE_REST_DURATION);
        setIsRunning(true);
      }
    } else {
      // Partial set finished
      const updatedEx = {
        ...ex,
        sets: updatedSets,
        completed: false,
      };
      onUpdateExercise?.(updatedEx);

      // 15 Seconds Break after set
      setPhase('SET_REST');
      setTimeLeft(SET_REST_DURATION);
      setIsRunning(true);
    }
  }, [exIndex, setIndex, onUpdateExercise, onCompleteWorkout]);

  // Advance after 15s set rest break
  const handleFinishSetRest = useCallback(() => {
    const currentList = exercisesRef.current || [];
    const ex = currentList[exIndex];
    const sets = ex?.sets || [];

    setSetIndex((prevSetIdx) => {
      const nextSetIdx = prevSetIdx + 1;
      setPhase('WORK');
      const dur = getWorkDuration(sets[nextSetIdx], ex);
      setTimeLeft(dur);
      setIsRunning(true);
      return nextSetIdx;
    });
  }, [exIndex, getWorkDuration]);

  // Advance after 30s exercise rest break
  const handleFinishExerciseRest = useCallback(() => {
    const currentList = exercisesRef.current || [];

    setExIndex((prevExIdx) => {
      const nextIdx = prevExIdx + 1;
      if (nextIdx < currentList.length) {
        setSetIndex(0);
        setPhase('WORK');
        const nextEx = currentList[nextIdx];
        const dur = getWorkDuration(nextEx?.sets?.[0], nextEx);
        setTimeLeft(dur);
        setIsRunning(true);
        return nextIdx;
      } else {
        setPhase('ALL_DONE');
        setIsRunning(false);
        onCompleteWorkout?.();
        return prevExIdx;
      }
    });
  }, [getWorkDuration, onCompleteWorkout]);

  // Main Timer Countdown Loop
  useEffect(() => {
    if (!isOpen || !isRunning || phase === 'ALL_DONE') return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (phase === 'WORK') {
            handleFinishWorkSet();
          } else if (phase === 'SET_REST') {
            handleFinishSetRest();
          } else if (phase === 'EXERCISE_REST') {
            handleFinishExerciseRest();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [
    isOpen,
    isRunning,
    phase,
    handleFinishWorkSet,
    handleFinishSetRest,
    handleFinishExerciseRest,
  ]);

  if (!isOpen) return null;

  // Format time MM:SS
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Skip / Manual jump to next exercise
  const handleSkipExercise = () => {
    const currentList = exercisesRef.current || [];

    setExIndex((prevExIdx) => {
      const nextIdx = prevExIdx + 1;
      if (nextIdx < currentList.length) {
        setSetIndex(0);
        setPhase('WORK');
        const nextEx = currentList[nextIdx];
        const dur = getWorkDuration(nextEx?.sets?.[0], nextEx);
        setTimeLeft(dur);
        setIsRunning(true);
        return nextIdx;
      } else {
        setPhase('ALL_DONE');
        setIsRunning(false);
        onCompleteWorkout?.();
        return prevExIdx;
      }
    });
  };

  const isCardio = currentExercise?.exercise?.type === 'cardio_duration';

  return (
    <div className="simple-timer-overlay" onClick={onClose}>
      <div
        className="simple-timer-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="simple-timer-header">
          <div className="simple-timer-header-left">
            <span className="simple-timer-step">
              Exercise {exIndex + 1} of {exercises.length}
            </span>
          </div>
          <button
            type="button"
            className="simple-timer-close"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* ALL WORKOUT COMPLETED VIEW */}
        {phase === 'ALL_DONE' ? (
          <div className="simple-done-view">
            <div className="simple-done-icon">
              <IconCheckCircle size={44} color="#16a34a" />
            </div>
            <h2>Workout Completed!</h2>
            <p>Great job! You finished all {exercises.length} scheduled exercises.</p>

            <div className="simple-done-stats">
              <div className="simple-done-stat">
                <strong>{exercises.length}</strong>
                <span>Exercises</span>
              </div>
              <div className="simple-done-stat">
                <strong>
                  {exercises.reduce((sum, ex) => sum + (ex.sets?.length || 0), 0)}
                </strong>
                <span>Total Sets</span>
              </div>
            </div>

            <button
              type="button"
              className="simple-btn-finish"
              onClick={onClose}
            >
              Done &amp; Close
            </button>
          </div>
        ) : (
          /* WORKOUT ACTIVE WORK & BREAK VIEW */
          <div className="simple-timer-body">
            {/* Exercise Title & Tags */}
            <div className="simple-ex-info">
              {phase === 'EXERCISE_REST' ? (
                <>
                  <div className="simple-ex-tags">
                    <span className="simple-tag-completed-badge">✓ Exercise Completed</span>
                  </div>
                  <h2 className="simple-ex-name">{currentExercise?.exercise?.name}</h2>
                  <div className="next-exercise-preview-box">
                    <span className="next-preview-lbl">Up Next:</span>
                    <strong className="next-preview-name">
                      {nextExercise?.exercise?.name || 'Workout Completion'}
                    </strong>
                    <span className="next-preview-meta">
                      {nextExercise?.exercise?.muscleGroup} · {nextExercise?.sets?.length || 3} sets
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="simple-ex-tags">
                    <span className="simple-tag-muscle">
                      {currentExercise?.exercise?.muscleGroup || 'General'}
                    </span>
                    <span className="simple-tag-equip">
                      {currentExercise?.exercise?.equipment || 'Standard'}
                    </span>
                  </div>
                  <h2 className="simple-ex-name">{currentExercise?.exercise?.name}</h2>
                  {currentExercise?.exercise?.instructions && (
                    <p className="simple-ex-desc">{currentExercise.exercise.instructions}</p>
                  )}
                </>
              )}
            </div>

            {/* Set Progression Pills */}
            <div className="simple-set-tracker-row">
              {currentSets.map((s, idx) => {
                const isSetDone = s.completed || (phase === 'EXERCISE_REST') || (idx < setIndex);
                const isCurrent = idx === setIndex && phase === 'WORK';

                return (
                  <div
                    key={s.setNumber || idx}
                    className={`simple-set-chip ${isCurrent ? 'active' : ''} ${isSetDone ? 'done' : ''}`}
                  >
                    <span className="chip-set-title">Set {idx + 1}</span>
                    <span className="chip-set-sub">
                      {isCardio
                        ? `${s.duration || 20}m`
                        : `${s.reps || 10}r @ ${s.weight || 0}kg`}
                    </span>
                    {isSetDone && <span className="chip-check">✓</span>}
                  </div>
                );
              })}
            </div>

            {/* Clean Prominent Timer Display */}
            <div className={`simple-timer-display-box ${phase.toLowerCase()}`}>
              {/* Phase Banner */}
              <div className="timer-phase-tag">
                {phase === 'WORK' && `Active Set ${setIndex + 1} of ${currentSets.length}`}
                {phase === 'SET_REST' && '15s Rest Break'}
                {phase === 'EXERCISE_REST' && '30s Exercise Transition Break'}
              </div>

              {/* Large Digital Clock */}
              <div className="timer-large-digits">
                {formatTime(timeLeft)}
              </div>

              {/* Target / Next Subtitle */}
              <div className="timer-sub-target">
                {phase === 'WORK' && (
                  <span>
                    Target: <strong>{currentSet?.reps || 10} reps</strong> @ <strong>{currentSet?.weight || 0} kg</strong>
                  </span>
                )}
                {phase === 'SET_REST' && (
                  <span>
                    Catch your breath · Next: <strong>Set {setIndex + 2}</strong>
                  </span>
                )}
                {phase === 'EXERCISE_REST' && (
                  <span>
                    Catch your breath · Next Exercise: <strong>{nextExercise?.exercise?.name || 'Finish'}</strong>
                  </span>
                )}
              </div>
            </div>

            {/* Timer Playback Controls */}
            <div className="timer-controls-row">
              <button
                type="button"
                className="btn-timer-ctrl"
                onClick={() => {
                  const dur =
                    phase === 'WORK'
                      ? getWorkDuration(currentSet, currentExercise)
                      : phase === 'SET_REST'
                        ? SET_REST_DURATION
                        : EXERCISE_REST_DURATION;
                  setTimeLeft(dur);
                  setIsRunning(true);
                }}
                title="Restart Timer"
              >
                <IconRotateCcw size={15} />
                <span>Reset</span>
              </button>

              <button
                type="button"
                className={`btn-timer-play ${isRunning ? 'running' : 'paused'}`}
                onClick={() => setIsRunning(!isRunning)}
              >
                {isRunning ? (
                  <>
                    <IconPause size={17} />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <IconPlay size={17} />
                    <span>Resume</span>
                  </>
                )}
              </button>

              <button
                type="button"
                className="btn-timer-ctrl"
                onClick={() => setTimeLeft((prev) => prev + 15)}
                title="Add 15 seconds"
              >
                <span>+15s</span>
              </button>
            </div>

            {/* Primary Action Buttons based on Phase */}
            <div className="timer-action-buttons">
              {phase === 'WORK' && (
                <button
                  type="button"
                  className="btn-timer-main-action finish"
                  onClick={handleFinishWorkSet}
                >
                  <IconCheck size={16} />
                  <span>Mark Set {setIndex + 1} Finished (Start 15s Break)</span>
                </button>
              )}

              {phase === 'SET_REST' && (
                <button
                  type="button"
                  className="btn-timer-main-action skip"
                  onClick={handleFinishSetRest}
                >
                  <IconSkipForward size={16} />
                  <span>Skip Break · Start Set {setIndex + 2}</span>
                </button>
              )}

              {phase === 'EXERCISE_REST' && (
                <button
                  type="button"
                  className="btn-timer-main-action next"
                  onClick={handleFinishExerciseRest}
                >
                  <IconSkipForward size={16} />
                  <span>Skip Break · Start Next Exercise</span>
                </button>
              )}

              {phase !== 'EXERCISE_REST' && exIndex + 1 < exercises.length && (
                <button
                  type="button"
                  className="btn-skip-ex-link"
                  onClick={handleSkipExercise}
                >
                  Skip to Next Exercise ⏭
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
