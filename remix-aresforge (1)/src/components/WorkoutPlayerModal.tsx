import React, { useEffect, useState } from 'react';
import {
  ArrowLeftRight,
  Check,
  Clock,
  HeartPulse,
  Pause,
  Play,
  PlayCircle,
  Plus,
  RotateCcw,
  Timer,
  X,
} from 'lucide-react';
import type {
  ExerciseSessionSummary,
  ExperienceLevel,
  MovementPattern,
  ProgramDay,
  ProgramExercise,
  UnitSystem,
  WorkoutProgram,
  WorkoutSession,
  WorkoutSetLog,
} from '../types/fitness';
import { DynamicWarmupPanel } from './DynamicWarmupPanel';
import {
  formatTimerMMSS,
  WorkoutTimersPanel,
  type RepPaceOption,
  type RepTimerMode,
} from './WorkoutTimersPanel';

interface WorkoutPlayerModalProps {
  program: WorkoutProgram;
  activeDay: ProgramDay;
  dateKey: string;
  unitSystem: UnitSystem;
  experienceLevel?: ExperienceLevel;
  liveHeartRate: number | null;
  onRequestSwapExercise: (program: WorkoutProgram, exercise: ProgramExercise) => void;
  onWatchFormVideo: (name: string, exerciseId?: string, pattern?: MovementPattern) => void;
  onCompleteSession: (session: WorkoutSession) => void;
  onClose: () => void;
}

function playRestChime() {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  } catch {
    // ignore audio block
  }
}

function playRepCompleteChime() {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;
    [660, 990].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.14);
      gain.gain.setValueAtTime(0.08, now + idx * 0.14);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.14 + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.14);
      osc.stop(now + idx * 0.14 + 0.25);
    });
  } catch {
    // ignore audio block
  }
}

function playRepCadenceTick() {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(520, ctx.currentTime);
    gain.gain.setValueAtTime(0.035, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  } catch {
    // ignore audio block
  }
}

function parseExerciseDurationSeconds(repsText: string): number | null {
  const minMatch = repsText.match(/(\d+)\s*(?:min|mins|minute|minutes)\b/i);
  if (minMatch) {
    const mins = Number(minMatch[1]);
    if (Number.isFinite(mins) && mins > 0) return Math.min(3600, mins * 60);
  }
  const secMatch = repsText.match(/(\d+)\s*(?:s|sec|secs|second|seconds)\b/i);
  if (secMatch) {
    const secs = Number(secMatch[1]);
    if (Number.isFinite(secs) && secs >= 5) return Math.min(3600, secs);
  }
  return null;
}

export const WorkoutPlayerModal: React.FC<WorkoutPlayerModalProps> = ({
  program,
  activeDay,
  dateKey,
  unitSystem,
  experienceLevel = 'Intermediate',
  liveHeartRate,
  onRequestSwapExercise,
  onWatchFormVideo,
  onCompleteSession,
  onClose,
}) => {
  const isImperial = unitSystem === 'imperial';
  const weightUnit = isImperial ? 'lbs' : 'kg';
  const dayExercises = activeDay.exercises.length > 0 ? activeDay.exercises : program.exercises;

  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Rest Timer state
  const [restSecondsLeft, setRestSecondsLeft] = useState<number | null>(null);
  const [restPaused, setRestPaused] = useState(false);
  const [restPresetSeconds, setRestPresetSeconds] = useState(60);

  // Rep Timer state
  const [repMode, setRepMode] = useState<RepTimerMode>('countdown');
  const [repTargetSeconds, setRepTargetSeconds] = useState(45);
  const [repSeconds, setRepSeconds] = useState(45);
  const [repRunning, setRepRunning] = useState(false);
  const [repPaceSeconds, setRepPaceSeconds] = useState<RepPaceOption>(0);
  const [autoRestAfterRep, setAutoRestAfterRep] = useState(true);
  const [activeTimerExerciseName, setActiveTimerExerciseName] = useState<string | null>(null);
  const [activeTimerExerciseRestSec, setActiveTimerExerciseRestSec] = useState<number>(60);

  const [notes, setNotes] = useState('');

  const [setsByExercise, setSetsByExercise] = useState<Record<string, WorkoutSetLog[]>>(() => {
    const init: Record<string, WorkoutSetLog[]> = {};
    for (const ex of dayExercises) {
      const parsedReps = parseInt(ex.reps, 10);
      const defaultReps = Number.isFinite(parsedReps) && parsedReps > 0 ? parsedReps : 10;
      init[ex.id] = Array.from({ length: ex.sets }, (_, i) => ({
        setNumber: i + 1,
        weightKg: 20,
        reps: defaultReps,
        completed: false,
      }));
    }
    return init;
  });

  useEffect(() => {
    const id = window.setInterval(() => {
      setElapsedSeconds((s) => s + 1);
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  // Rest Timer tick
  useEffect(() => {
    if (restSecondsLeft === null || restPaused) return;
    if (restSecondsLeft <= 0) {
      playRestChime();
      setRestSecondsLeft(null);
      setRestPaused(false);
      return;
    }
    const id = window.setTimeout(() => {
      setRestSecondsLeft((s) => (s !== null ? s - 1 : null));
    }, 1000);
    return () => window.clearTimeout(id);
  }, [restSecondsLeft, restPaused]);

  // Rep Timer tick
  useEffect(() => {
    if (!repRunning) return;
    if (repMode === 'countdown' && repSeconds <= 0) {
      playRepCompleteChime();
      setRepRunning(false);
      if (autoRestAfterRep) {
        setRestPaused(false);
        setRestSecondsLeft(activeTimerExerciseRestSec);
      }
      return;
    }
    const id = window.setTimeout(() => {
      setRepSeconds((prev) => {
        const next = repMode === 'countdown' ? prev - 1 : prev + 1;
        if (repPaceSeconds > 0) {
          const elapsed =
            repMode === 'countdown' ? Math.max(0, repTargetSeconds - next) : next;
          if (elapsed > 0 && elapsed % repPaceSeconds === 0 && (repMode === 'stopwatch' || next > 0)) {
            playRepCadenceTick();
          }
        }
        return next;
      });
    }, 1000);
    return () => window.clearTimeout(id);
  }, [
    repRunning,
    repMode,
    repSeconds,
    repTargetSeconds,
    repPaceSeconds,
    autoRestAfterRep,
    activeTimerExerciseRestSec,
  ]);

  const formatTimer = formatTimerMMSS;

  const displayWeight = (kg: number) => (isImperial ? Math.round(kg * 2.20462) : Math.round(kg * 10) / 10);
  const inputToKg = (val: number) => (isImperial ? val / 2.20462 : val);

  const startRestTimer = (seconds: number) => {
    setRestPaused(false);
    setRestSecondsLeft(Math.max(1, Math.round(seconds)));
  };

  const handleLaunchExerciseRepTimer = (ex: ProgramExercise) => {
    const parsedDur = parseExerciseDurationSeconds(ex.reps);
    setActiveTimerExerciseName(ex.name);
    setActiveTimerExerciseRestSec(ex.restSeconds || 60);
    if (parsedDur !== null) {
      setRepMode('countdown');
      setRepTargetSeconds(parsedDur);
      setRepSeconds(parsedDur);
      setRepRunning(true);
    } else if (repMode === 'countdown') {
      setRepSeconds(repTargetSeconds);
      setRepRunning(true);
    } else {
      setRepSeconds(0);
      setRepRunning(true);
    }
  };

  const handleToggleRepRun = () => {
    if (!repRunning && repMode === 'countdown' && repSeconds <= 0) {
      setRepSeconds(repTargetSeconds);
    }
    setRepRunning((r) => !r);
  };

  const handleResetRep = () => {
    setRepRunning(false);
    setRepSeconds(repMode === 'countdown' ? repTargetSeconds : 0);
  };

  const handleChangeRepMode = (nextMode: RepTimerMode) => {
    setRepRunning(false);
    setRepMode(nextMode);
    setRepSeconds(nextMode === 'countdown' ? repTargetSeconds : 0);
  };

  const handleChangeRepTarget = (seconds: number) => {
    const clamped = Math.min(3600, Math.max(5, Math.round(seconds)));
    setRepTargetSeconds(clamped);
    if (repMode === 'countdown' && !repRunning) {
      setRepSeconds(clamped);
    } else if (repMode === 'countdown') {
      setRepSeconds(clamped);
    }
  };

  const toggleSetComplete = (exId: string, setIdx: number, restDuration: number) => {
    setSetsByExercise((prev) => {
      const list = prev[exId] || [];
      const target = list[setIdx];
      const nextCompleted = !target.completed;
      if (nextCompleted) {
        setRepRunning(false);
        startRestTimer(restDuration);
      }
      return {
        ...prev,
        [exId]: list.map((s, idx) => (idx === setIdx ? { ...s, completed: nextCompleted } : s)),
      };
    });
  };

  const updateSetField = (
    exId: string,
    setIdx: number,
    field: 'weightKg' | 'reps',
    value: number
  ) => {
    setSetsByExercise((prev) => ({
      ...prev,
      [exId]: (prev[exId] || []).map((s, idx) =>
        idx === setIdx ? { ...s, [field]: Math.max(0, value) } : s
      ),
    }));
  };

  const addExtraSet = (exId: string) => {
    setSetsByExercise((prev) => {
      const current = prev[exId] || [];
      const last = current[current.length - 1] || { weightKg: 20, reps: 10 };
      return {
        ...prev,
        [exId]: [
          ...current,
          {
            setNumber: current.length + 1,
            weightKg: last.weightKg,
            reps: last.reps,
            completed: false,
          },
        ],
      };
    });
  };

  const totalCompletedSets = Object.values(setsByExercise)
    .flat()
    .filter((s) => s.completed).length;

  const totalVolumeKg = Object.values(setsByExercise)
    .flat()
    .filter((s) => s.completed)
    .reduce((acc, s) => acc + s.weightKg * s.reps, 0);

  const handleFinish = () => {
    const durationMinutes = Math.max(1, Math.round(elapsedSeconds / 60));
    const estimatedCalories = Math.max(
      45,
      Math.round(durationMinutes * 6.5 + totalCompletedSets * 5)
    );

    const exercisesSummary: ExerciseSessionSummary[] = dayExercises.slice(0, 25).map((ex) => {
      const completed = (setsByExercise[ex.id] || []).filter((s) => s.completed);
      return {
        name: ex.name,
        completedSets: completed.length,
        topWeightKg: completed.reduce((m, s) => Math.max(m, s.weightKg), 0),
        totalVolumeKg: Math.round(completed.reduce((sum, s) => sum + s.weightKg * s.reps, 0)),
      };
    });

    const formattedTitle = `${program.title} · Day ${activeDay.dayNumber}: ${activeDay.focus}`.slice(0, 80);

    onCompleteSession({
      id: `sess_${Date.now()}`,
      programId: program.id,
      programTitle: formattedTitle,
      dateKey,
      durationMinutes,
      caloriesBurned: estimatedCalories,
      totalVolumeKg: Math.round(totalVolumeKg),
      completedSets: totalCompletedSets,
      exercisesSummary,
      notes: notes.trim(),
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-slate-50 dark:bg-slate-950"
      role="dialog"
      aria-modal="true"
      aria-label={`Active workout: ${program.title} Day ${activeDay.dayNumber}`}
    >
      {/* Top Session Bar */}
      <div className="sticky top-0 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onClose}
            aria-label="Discard or exit workout"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <h2 className="text-base font-bold text-slate-900 dark:text-white truncate">
              {program.title} · Day {activeDay.dayNumber}
            </h2>
            <p className="text-[11px] font-medium text-blue-600 dark:text-blue-400 truncate">
              {activeDay.focus}
            </p>
            <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-mono">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {formatTimer(elapsedSeconds)}
              </span>
              <span>{totalCompletedSets} sets</span>
              {liveHeartRate !== null && (
                <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400 font-semibold">
                  <HeartPulse className="w-3.5 h-3.5" />
                  {liveHeartRate} bpm
                </span>
              )}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleFinish}
          className="min-h-[44px] px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold whitespace-nowrap shrink-0 transition-colors"
        >
          Finish Workout
        </button>
      </div>

      {/* Sticky Live Rep / Rest Timer Banner (shown when either timer is running or active) */}
      {(repRunning ||
        (repMode === 'countdown' && repSeconds > 0 && repSeconds < repTargetSeconds) ||
        (repMode === 'stopwatch' && repSeconds > 0) ||
        restSecondsLeft !== null) && (
        <div className="bg-slate-900 text-white px-4 py-2 flex flex-wrap items-center justify-between gap-2 border-b border-slate-800">
          {(repRunning ||
            (repMode === 'countdown' && repSeconds > 0 && repSeconds < repTargetSeconds) ||
            (repMode === 'stopwatch' && repSeconds > 0)) && (
            <div className="flex items-center gap-2">
              <Timer className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-xs font-medium text-slate-300">Rep</span>
              <span className="text-sm font-bold font-mono tabular-nums text-white">
                {formatTimer(repSeconds)}
              </span>
              {repPaceSeconds > 0 && (
                <span className="text-[11px] font-mono tabular-nums text-blue-300">
                  · Rep{' '}
                  {Math.floor(
                    (repMode === 'countdown'
                      ? Math.max(0, repTargetSeconds - repSeconds)
                      : repSeconds) / repPaceSeconds
                  ) + 1}
                </span>
              )}
              <button
                type="button"
                onClick={handleToggleRepRun}
                aria-label={repRunning ? 'Pause rep timer' : 'Resume rep timer'}
                className="min-h-[32px] px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold flex items-center gap-1"
              >
                {repRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              </button>
              <button
                type="button"
                onClick={() => {
                  setRepRunning(false);
                  setRepSeconds(repMode === 'countdown' ? repTargetSeconds : 0);
                  startRestTimer(activeTimerExerciseRestSec);
                }}
                className="min-h-[32px] px-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-xs font-semibold text-white"
              >
                Done → Rest
              </button>
              <button
                type="button"
                onClick={handleResetRep}
                aria-label="Reset rep timer"
                className="min-h-[32px] px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            </div>
          )}

          {restSecondsLeft !== null && (
            <div className="flex items-center gap-1.5 ml-auto">
              <Timer className="w-4 h-4 text-blue-400 shrink-0" />
              <span className="text-xs font-medium text-slate-300">Rest</span>
              <span className="text-sm font-bold font-mono tabular-nums text-white mr-1">
                {formatTimer(restSecondsLeft)}
              </span>
              <button
                type="button"
                onClick={() => setRestPaused((p) => !p)}
                aria-label={restPaused ? 'Resume rest timer' : 'Pause rest timer'}
                className="min-h-[32px] px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs flex items-center justify-center"
              >
                {restPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
              </button>
              <button
                type="button"
                onClick={() => setRestSecondsLeft((s) => (s !== null ? Math.max(0, s - 15) : null))}
                className="min-h-[32px] px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono"
              >
                -15s
              </button>
              <button
                type="button"
                onClick={() => setRestSecondsLeft((s) => (s !== null ? s + 15 : 15))}
                className="min-h-[32px] px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono"
              >
                +15s
              </button>
              <button
                type="button"
                onClick={() => {
                  setRestSecondsLeft(null);
                  setRestPaused(false);
                }}
                className="min-h-[32px] px-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-semibold"
              >
                Skip
              </button>
            </div>
          )}
        </div>
      )}

      {/* Dynamic Warmup + Rep/Rest Timers + Exercises List */}
      <div className="flex-1 overflow-y-auto px-4 py-5 max-w-3xl w-full mx-auto space-y-5 pb-20">
        <WorkoutTimersPanel
          repMode={repMode}
          repTargetSeconds={repTargetSeconds}
          repSeconds={repSeconds}
          repRunning={repRunning}
          repPaceSeconds={repPaceSeconds}
          autoRestAfterRep={autoRestAfterRep}
          activeExerciseName={activeTimerExerciseName}
          activeExerciseRestSec={activeTimerExerciseRestSec}
          restSecondsLeft={restSecondsLeft}
          restPaused={restPaused}
          restPresetSeconds={restPresetSeconds}
          onChangeRepMode={handleChangeRepMode}
          onChangeRepTarget={handleChangeRepTarget}
          onToggleRepRun={handleToggleRepRun}
          onResetRep={handleResetRep}
          onChangeRepPace={setRepPaceSeconds}
          onToggleAutoRest={setAutoRestAfterRep}
          onStartRest={startRestTimer}
          onToggleRestPause={() => setRestPaused((p) => !p)}
          onAdjustRest={(delta) =>
            setRestSecondsLeft((s) => (s !== null ? Math.max(0, s + delta) : null))
          }
          onSkipRest={() => {
            setRestSecondsLeft(null);
            setRestPaused(false);
          }}
          onChangeRestPreset={setRestPresetSeconds}
        />

        <DynamicWarmupPanel
          program={program}
          activeDay={activeDay}
          exercises={dayExercises}
          experienceLevel={experienceLevel}
          onWatchFormVideo={onWatchFormVideo}
        />

        {dayExercises.map((ex, exIndex) => {
          const sets = setsByExercise[ex.id] || [];
          const parsedDuration = parseExerciseDurationSeconds(ex.reps);
          return (
            <div
              key={ex.id}
              className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Exercise {exIndex + 1} · {ex.muscleGroup} · Target {ex.sets}×{ex.reps}
                    {ex.equipment ? ` · ${ex.equipment}` : ''}
                  </p>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                    {ex.name}
                  </h3>
                  {ex.replacedFromName && (
                    <p className="text-[11px] text-blue-600 dark:text-blue-400 mt-0.5">
                      Swapped from {ex.replacedFromName}
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleLaunchExerciseRepTimer(ex)}
                    aria-label={`Start rep timer for ${ex.name}`}
                    className="min-h-[40px] px-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/50 dark:hover:bg-amber-900/50 text-amber-700 dark:text-amber-300 text-xs font-semibold flex items-center gap-1 whitespace-nowrap shrink-0 transition-colors"
                  >
                    <Timer className="w-3.5 h-3.5" />
                    {parsedDuration ? `Rep ${parsedDuration}s` : 'Rep Timer'}
                  </button>
                  <button
                    type="button"
                    onClick={() => onRequestSwapExercise(program, ex)}
                    aria-label={`Replace ${ex.name} with a similar exercise`}
                    className="min-h-[40px] px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1 whitespace-nowrap shrink-0 transition-colors"
                  >
                    <ArrowLeftRight className="w-3.5 h-3.5" />
                    Swap
                  </button>
                  <button
                    type="button"
                    onClick={() => onWatchFormVideo(ex.name, ex.exerciseId, ex.pattern)}
                    className="min-h-[40px] px-3 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 text-blue-600 dark:text-blue-400 text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors"
                  >
                    <PlayCircle className="w-4 h-4" />
                    Form Video
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="grid grid-cols-12 gap-2 text-[11px] font-medium text-slate-500 dark:text-slate-400 px-1">
                  <div className="col-span-2">Set</div>
                  <div className="col-span-4">Weight ({weightUnit})</div>
                  <div className="col-span-4">Reps</div>
                  <div className="col-span-2 text-right">Done</div>
                </div>

                {sets.map((setItem, sIdx) => (
                  <div
                    key={setItem.setNumber}
                    className={`grid grid-cols-12 gap-2 items-center p-1.5 rounded-xl transition-colors ${
                      setItem.completed
                        ? 'bg-emerald-50/70 dark:bg-emerald-950/25'
                        : 'bg-slate-50 dark:bg-slate-800/50'
                    }`}
                  >
                    <div className="col-span-2 pl-2 font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
                      {setItem.setNumber}
                    </div>
                    <div className="col-span-4">
                      <input
                        type="number"
                        min={0}
                        step={isImperial ? 5 : 2.5}
                        value={displayWeight(setItem.weightKg)}
                        onChange={(e) =>
                          updateSetField(ex.id, sIdx, 'weightKg', inputToKg(Number(e.target.value) || 0))
                        }
                        aria-label={`Set ${setItem.setNumber} weight`}
                        className="w-full min-h-[40px] px-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-mono text-slate-900 dark:text-white"
                      />
                    </div>
                    <div className="col-span-4">
                      <input
                        type="number"
                        min={0}
                        value={setItem.reps}
                        onChange={(e) =>
                          updateSetField(ex.id, sIdx, 'reps', Number(e.target.value) || 0)
                        }
                        aria-label={`Set ${setItem.setNumber} reps`}
                        className="w-full min-h-[40px] px-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-mono text-slate-900 dark:text-white"
                      />
                    </div>
                    <div className="col-span-2 flex justify-end">
                      <button
                        type="button"
                        onClick={() => toggleSetComplete(ex.id, sIdx, ex.restSeconds)}
                        aria-label={`Mark set ${setItem.setNumber} complete`}
                        className={`min-h-[44px] min-w-[44px] rounded-xl flex items-center justify-center transition-colors ${
                          setItem.completed
                            ? 'bg-emerald-600 text-white'
                            : 'bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-400 hover:border-blue-500'
                        }`}
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => addExtraSet(ex.id)}
                className="min-h-[40px] w-full rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Set
              </button>
            </div>
          );
        })}

        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 space-y-2">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Session Notes
          </label>
          <textarea
            rows={2}
            maxLength={300}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="How did the session feel? Any PRs or form adjustments?"
            className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white"
          />
        </div>
      </div>
    </div>
  );
};
