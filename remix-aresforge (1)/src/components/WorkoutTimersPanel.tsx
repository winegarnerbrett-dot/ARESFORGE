import React, { useEffect, useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Pause,
  Play,
  RotateCcw,
  Timer,
} from 'lucide-react';

export type RepTimerMode = 'countdown' | 'stopwatch';
export type RepPaceOption = 0 | 2 | 3 | 4;

interface WorkoutTimersPanelProps {
  repMode: RepTimerMode;
  repTargetSeconds: number;
  repSeconds: number;
  repRunning: boolean;
  repPaceSeconds: RepPaceOption;
  autoRestAfterRep: boolean;
  activeExerciseName: string | null;
  activeExerciseRestSec: number;
  restSecondsLeft: number | null;
  restPaused: boolean;
  restPresetSeconds: number;
  onChangeRepMode: (mode: RepTimerMode) => void;
  onChangeRepTarget: (seconds: number) => void;
  onToggleRepRun: () => void;
  onResetRep: () => void;
  onChangeRepPace: (pace: RepPaceOption) => void;
  onToggleAutoRest: (next: boolean) => void;
  onStartRest: (seconds: number) => void;
  onToggleRestPause: () => void;
  onAdjustRest: (deltaSeconds: number) => void;
  onSkipRest: () => void;
  onChangeRestPreset: (seconds: number) => void;
}

const REP_PRESETS = [
  { label: '30s', seconds: 30 },
  { label: '45s', seconds: 45 },
  { label: '60s', seconds: 60 },
  { label: '90s', seconds: 90 },
  { label: '2m', seconds: 120 },
];

const REST_PRESETS = [
  { label: '30s', seconds: 30 },
  { label: '60s', seconds: 60 },
  { label: '90s', seconds: 90 },
  { label: '2m', seconds: 120 },
];

const PACE_OPTIONS: Array<{ label: string; value: RepPaceOption }> = [
  { label: 'Off', value: 0 },
  { label: '2s/rep', value: 2 },
  { label: '3s/rep', value: 3 },
  { label: '4s/rep', value: 4 },
];

export function formatTimerMMSS(secs: number): string {
  const safe = Math.max(0, Math.floor(secs));
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export const WorkoutTimersPanel: React.FC<WorkoutTimersPanelProps> = ({
  repMode,
  repTargetSeconds,
  repSeconds,
  repRunning,
  repPaceSeconds,
  autoRestAfterRep,
  activeExerciseName,
  activeExerciseRestSec,
  restSecondsLeft,
  restPaused,
  restPresetSeconds,
  onChangeRepMode,
  onChangeRepTarget,
  onToggleRepRun,
  onResetRep,
  onChangeRepPace,
  onToggleAutoRest,
  onStartRest,
  onToggleRestPause,
  onAdjustRest,
  onSkipRest,
  onChangeRestPreset,
}) => {
  const [expanded, setExpanded] = useState(true);
  const [customRepInput, setCustomRepInput] = useState(String(repTargetSeconds));
  const [customRestInput, setCustomRestInput] = useState(String(restPresetSeconds));

  useEffect(() => {
    setCustomRepInput(String(repTargetSeconds));
  }, [repTargetSeconds]);

  useEffect(() => {
    setCustomRestInput(String(restPresetSeconds));
  }, [restPresetSeconds]);

  const elapsedInSet =
    repMode === 'countdown' ? Math.max(0, repTargetSeconds - repSeconds) : repSeconds;
  const currentRepNumber =
    repPaceSeconds > 0 && (repRunning || elapsedInSet > 0)
      ? Math.floor(elapsedInSet / repPaceSeconds) + 1
      : null;

  const handleApplyCustomRep = () => {
    const parsed = Math.round(Number(customRepInput));
    if (Number.isFinite(parsed) && parsed >= 5 && parsed <= 3600) {
      onChangeRepTarget(parsed);
    } else {
      setCustomRepInput(String(repTargetSeconds));
    }
  };

  const handleApplyCustomRest = () => {
    const parsed = Math.round(Number(customRestInput));
    if (Number.isFinite(parsed) && parsed >= 5 && parsed <= 3600) {
      onChangeRestPreset(parsed);
      onStartRest(parsed);
    } else {
      setCustomRestInput(String(restPresetSeconds));
    }
  };

  return (
    <section
      aria-label="Workout Rep and Rest Timers"
      className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 space-y-3"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Timer className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Rep &amp; Rest Timers
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
            Rep {formatTimerMMSS(repSeconds)} ({repMode === 'countdown' ? 'Countdown' : 'Stopwatch'})
            {' · '}
            Rest {restSecondsLeft !== null ? formatTimerMMSS(restSecondsLeft) : `${restPresetSeconds}s ready`}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className="min-h-[40px] px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors"
        >
          {expanded ? (
            <>
              Hide
              <ChevronUp className="w-3.5 h-3.5" />
            </>
          ) : (
            <>
              Open Timers
              <ChevronDown className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </div>

      {expanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
          {/* Rep Timer Card */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 dark:text-white">Rep Timer</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {activeExerciseName ? activeExerciseName : 'Time sets, holds, or rep pace'}
                  </p>
                </div>
                <div className="inline-flex items-center gap-0.5 p-0.5 rounded-lg bg-slate-200/70 dark:bg-slate-900 shrink-0">
                  <button
                    type="button"
                    onClick={() => onChangeRepMode('countdown')}
                    className={`min-h-[30px] px-2.5 rounded-md text-[11px] font-semibold transition-colors ${
                      repMode === 'countdown'
                        ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Countdown
                  </button>
                  <button
                    type="button"
                    onClick={() => onChangeRepMode('stopwatch')}
                    className={`min-h-[30px] px-2.5 rounded-md text-[11px] font-semibold transition-colors ${
                      repMode === 'stopwatch'
                        ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Stopwatch
                  </button>
                </div>
              </div>

              <div className="flex items-baseline justify-between gap-3">
                <span className="text-3xl font-extrabold font-mono tabular-nums text-slate-900 dark:text-white tracking-tight">
                  {formatTimerMMSS(repSeconds)}
                </span>
                {currentRepNumber !== null && (
                  <span className="text-xs font-mono tabular-nums font-semibold text-blue-600 dark:text-blue-400">
                    Rep {currentRepNumber} ({repPaceSeconds}s pace)
                  </span>
                )}
              </div>

              {repMode === 'countdown' && (
                <div className="flex flex-wrap items-center gap-1.5">
                  {REP_PRESETS.map((p) => {
                    const active = repTargetSeconds === p.seconds;
                    return (
                      <button
                        key={p.seconds}
                        type="button"
                        onClick={() => {
                          onChangeRepTarget(p.seconds);
                          setCustomRepInput(String(p.seconds));
                        }}
                        className={`min-h-[34px] px-2.5 rounded-lg text-xs font-mono tabular-nums font-semibold border transition-colors ${
                          active
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {p.label}
                      </button>
                    );
                  })}
                  <div className="flex items-center gap-1 ml-auto">
                    <input
                      type="number"
                      min={5}
                      max={3600}
                      value={customRepInput}
                      onChange={(e) => setCustomRepInput(e.target.value)}
                      onBlur={handleApplyCustomRep}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleApplyCustomRep();
                        }
                      }}
                      aria-label="Custom rep timer seconds"
                      className="w-16 min-h-[34px] px-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono tabular-nums text-slate-900 dark:text-white"
                    />
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">s</span>
                  </div>
                </div>
              )}

              {/* Rep Pace / Tempo Cadence */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  Rep Pacer
                </span>
                <div className="flex items-center gap-1">
                  {PACE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => onChangeRepPace(opt.value)}
                      className={`min-h-[30px] px-2 rounded-lg text-[11px] font-mono font-semibold border transition-colors ${
                        repPaceSeconds === opt.value
                          ? 'bg-slate-900 dark:bg-blue-600 text-white border-slate-900 dark:border-blue-600'
                          : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              {repMode === 'countdown' && (
                <label className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={autoRestAfterRep}
                    onChange={(e) => onToggleAutoRest(e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-600"
                  />
                  Auto-start {activeExerciseRestSec}s Rest Timer when reps finish
                </label>
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onToggleRepRun}
                  className={`flex-1 min-h-[42px] px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                    repRunning
                      ? 'bg-amber-500 hover:bg-amber-600 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {repRunning ? (
                    <>
                      <Pause className="w-3.5 h-3.5" />
                      Pause Reps
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5" />
                      {repMode === 'countdown' && repSeconds < repTargetSeconds && repSeconds > 0
                        ? 'Resume Reps'
                        : repMode === 'stopwatch' && repSeconds > 0
                        ? 'Resume Reps'
                        : 'Start Rep Timer'}
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={onResetRep}
                  aria-label="Reset rep timer"
                  className="min-h-[42px] min-w-[42px] px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Rest Timer Card */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">Rest Timer</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Auto-starts when you mark a set done, or start manually
                  </p>
                </div>
              </div>

              <div className="flex items-baseline justify-between gap-3">
                <span className="text-3xl font-extrabold font-mono tabular-nums text-slate-900 dark:text-white tracking-tight">
                  {restSecondsLeft !== null
                    ? formatTimerMMSS(restSecondsLeft)
                    : formatTimerMMSS(restPresetSeconds)}
                </span>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  {restSecondsLeft === null
                    ? 'Ready'
                    : restPaused
                    ? 'Paused'
                    : 'Resting'}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {REST_PRESETS.map((p) => {
                  const active =
                    (restSecondsLeft === null && restPresetSeconds === p.seconds) ||
                    false;
                  return (
                    <button
                      key={p.seconds}
                      type="button"
                      onClick={() => {
                        onChangeRestPreset(p.seconds);
                        setCustomRestInput(String(p.seconds));
                        onStartRest(p.seconds);
                      }}
                      className={`min-h-[34px] px-2.5 rounded-lg text-xs font-mono tabular-nums font-semibold border transition-colors ${
                        active
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {p.label}
                    </button>
                  );
                })}
                <div className="flex items-center gap-1 ml-auto">
                  <input
                    type="number"
                    min={5}
                    max={3600}
                    value={customRestInput}
                    onChange={(e) => setCustomRestInput(e.target.value)}
                    onBlur={handleApplyCustomRest}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleApplyCustomRest();
                      }
                    }}
                    aria-label="Custom rest timer seconds"
                    className="w-16 min-h-[34px] px-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono tabular-nums text-slate-900 dark:text-white"
                  />
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">s</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              {restSecondsLeft === null ? (
                <button
                  type="button"
                  onClick={() => onStartRest(restPresetSeconds)}
                  className="flex-1 min-h-[42px] px-3 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Play className="w-3.5 h-3.5" />
                  Start Rest ({restPresetSeconds}s)
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={onToggleRestPause}
                    className={`flex-1 min-h-[42px] px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                      restPaused
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        : 'bg-amber-500 hover:bg-amber-600 text-white'
                    }`}
                  >
                    {restPaused ? (
                      <>
                        <Play className="w-3.5 h-3.5" />
                        Resume
                      </>
                    ) : (
                      <>
                        <Pause className="w-3.5 h-3.5" />
                        Pause
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => onAdjustRest(-15)}
                    className="min-h-[42px] px-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono font-semibold text-slate-700 dark:text-slate-200"
                  >
                    -15s
                  </button>
                  <button
                    type="button"
                    onClick={() => onAdjustRest(15)}
                    className="min-h-[42px] px-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono font-semibold text-slate-700 dark:text-slate-200"
                  >
                    +15s
                  </button>
                  <button
                    type="button"
                    onClick={onSkipRest}
                    className="min-h-[42px] px-3 rounded-xl bg-slate-900 dark:bg-slate-700 text-white text-xs font-semibold"
                  >
                    Skip
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
