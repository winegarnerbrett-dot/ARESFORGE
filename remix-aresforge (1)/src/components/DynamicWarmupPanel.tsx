import React, { useEffect, useMemo, useState } from 'react';
import {
  Check,
  ChevronDown,
  ChevronUp,
  Flame,
  Pause,
  Play,
  PlayCircle,
  RotateCcw,
  SkipForward,
  Sparkles,
} from 'lucide-react';
import {
  generateDynamicWarmup,
  getRecommendedWarmupMinutes,
  type WarmupDurationChoice,
  type WarmupPhase,
} from '../lib/warmupGenerator';
import type {
  ExperienceLevel,
  MovementPattern,
  ProgramDay,
  ProgramExercise,
  WorkoutProgram,
} from '../types/fitness';

interface DynamicWarmupPanelProps {
  program: WorkoutProgram;
  activeDay: ProgramDay;
  exercises: ProgramExercise[];
  experienceLevel: ExperienceLevel;
  onWatchFormVideo: (name: string, exerciseId?: string, pattern?: MovementPattern) => void;
}

function playStepChime() {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(660, ctx.currentTime);
    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.25);
  } catch {
    // ignore audio block
  }
}

const PHASE_BADGE_CLASS: Record<WarmupPhase, string> = {
  Raise: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300',
  Mobilize: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300',
  Activate: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300',
  Potentiate: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
};

function formatClock(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export const DynamicWarmupPanel: React.FC<DynamicWarmupPanelProps> = ({
  program,
  activeDay,
  exercises,
  experienceLevel,
  onWatchFormVideo,
}) => {
  const [targetMinutes, setTargetMinutes] = useState<WarmupDurationChoice>(() =>
    getRecommendedWarmupMinutes(program, exercises, experienceLevel)
  );
  const [isExpanded, setIsExpanded] = useState(true);
  const [completedIds, setCompletedIds] = useState<Record<string, boolean>>({});
  const [activeDrillIndex, setActiveDrillIndex] = useState(0);
  const [drillSecondsLeft, setDrillSecondsLeft] = useState<number>(0);
  const [isRunning, setIsRunning] = useState(false);

  const sequence = useMemo(
    () =>
      generateDynamicWarmup({
        program,
        activeDay,
        exercises,
        experienceLevel,
        targetMinutes,
      }),
    [program, activeDay, exercises, experienceLevel, targetMinutes]
  );

  // Sync drill timer when sequence or targetMinutes updates
  useEffect(() => {
    const firstPending = sequence.drills.findIndex((d) => !completedIds[d.id]);
    const idx = firstPending >= 0 ? firstPending : 0;
    setActiveDrillIndex(idx);
    setDrillSecondsLeft(sequence.drills[idx]?.durationSeconds ?? 60);
    setIsRunning(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetMinutes, program.id, activeDay.dayNumber, exercises.length]);

  useEffect(() => {
    if (!isRunning) return;
    if (drillSecondsLeft <= 0) {
      playStepChime();
      const finishedDrill = sequence.drills[activeDrillIndex];
      if (finishedDrill) {
        setCompletedIds((prev) => ({ ...prev, [finishedDrill.id]: true }));
      }
      const nextIdx = activeDrillIndex + 1;
      if (nextIdx < sequence.drills.length) {
        setActiveDrillIndex(nextIdx);
        setDrillSecondsLeft(sequence.drills[nextIdx].durationSeconds);
      } else {
        setIsRunning(false);
      }
      return;
    }

    const id = window.setTimeout(() => {
      setDrillSecondsLeft((s) => Math.max(0, s - 1));
    }, 1000);
    return () => window.clearTimeout(id);
  }, [isRunning, drillSecondsLeft, activeDrillIndex, sequence.drills]);

  const completedCount = sequence.drills.filter((d) => completedIds[d.id]).length;
  const allCompleted =
    sequence.drills.length > 0 && completedCount === sequence.drills.length;

  const activeDrill = sequence.drills[activeDrillIndex] || sequence.drills[0];

  const handleSelectDrill = (idx: number) => {
    const drill = sequence.drills[idx];
    if (!drill) return;
    setActiveDrillIndex(idx);
    setDrillSecondsLeft(drill.durationSeconds);
  };

  const handleToggleDrillDone = (idx: number) => {
    const drill = sequence.drills[idx];
    if (!drill) return;
    const nextDone = !completedIds[drill.id];
    setCompletedIds((prev) => ({ ...prev, [drill.id]: nextDone }));
    if (nextDone && idx === activeDrillIndex) {
      const nextPending = sequence.drills.findIndex(
        (d, i) => i > idx && !completedIds[d.id]
      );
      if (nextPending >= 0) {
        setActiveDrillIndex(nextPending);
        setDrillSecondsLeft(sequence.drills[nextPending].durationSeconds);
      } else {
        setIsRunning(false);
      }
    }
  };

  const handleAdvanceDrill = () => {
    const current = sequence.drills[activeDrillIndex];
    if (current) {
      setCompletedIds((prev) => ({ ...prev, [current.id]: true }));
    }
    const nextIdx = activeDrillIndex + 1;
    if (nextIdx < sequence.drills.length) {
      setActiveDrillIndex(nextIdx);
      setDrillSecondsLeft(sequence.drills[nextIdx].durationSeconds);
    } else {
      setIsRunning(false);
    }
  };

  const handleResetWarmup = () => {
    setIsRunning(false);
    setCompletedIds({});
    setActiveDrillIndex(0);
    setDrillSecondsLeft(sequence.drills[0]?.durationSeconds ?? 60);
  };

  const progressPct =
    sequence.drills.length > 0
      ? Math.round((completedCount / sequence.drills.length) * 100)
      : 0;

  return (
    <section
      aria-label="Dynamic Pre-Workout Warmup"
      className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden"
    >
      {/* Header Row */}
      <div className="p-4 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setIsExpanded((v) => !v)}
          className="flex-1 min-w-0 text-left flex items-start gap-3"
        >
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              allCompleted
                ? 'bg-emerald-600 text-white'
                : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
            }`}
          >
            {allCompleted ? <Check className="w-5 h-5" /> : <Flame className="w-5 h-5" />}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Dynamic Warmup · {sequence.displayMinutes} min ({formatClock(sequence.totalSeconds)})
              </span>
              {completedCount > 0 && (
                <span className="text-[11px] font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                  {completedCount}/{sequence.drills.length} ready
                </span>
              )}
            </div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate mt-0.5">
              {allCompleted
                ? 'Warmup Complete — Primed for Working Sets'
                : sequence.focusSummary}
            </h3>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setIsExpanded((v) => !v)}
          aria-label={isExpanded ? 'Collapse warmup' : 'Expand warmup'}
          className="min-h-[40px] min-w-[40px] rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0"
        >
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Progress Strip */}
      <div className="h-1 bg-slate-100 dark:bg-slate-800">
        <div
          className="h-full bg-blue-600 dark:bg-blue-500 transition-all duration-300"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {isExpanded && (
        <div className="p-4 pt-3.5 space-y-3.5 border-t border-slate-100 dark:border-slate-800">
          {/* Duration Selector & Guided Timer Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div
              className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 self-start"
              role="group"
              aria-label="Warmup duration"
            >
              {([5, 8, 10] as const).map((mins) => {
                const active = targetMinutes === mins;
                return (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setTargetMinutes(mins)}
                    className={`min-h-[34px] px-3 rounded-lg text-xs font-semibold transition-colors ${
                      active
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {mins} min
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {activeDrill && !allCompleted && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-mono font-bold text-slate-900 dark:text-white">
                  <span className="text-[11px] font-sans font-medium text-slate-500 dark:text-slate-400">
                    Drill {activeDrillIndex + 1}/{sequence.drills.length}:
                  </span>
                  <span className="tabular-nums">{formatClock(drillSecondsLeft)}</span>
                </div>
              )}

              {!allCompleted && (
                <button
                  type="button"
                  onClick={() => setIsRunning((r) => !r)}
                  className="min-h-[38px] px-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  {isRunning ? (
                    <>
                      <Pause className="w-3.5 h-3.5" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      {completedCount > 0 ? 'Resume Warmup' : 'Start Guided Warmup'}
                    </>
                  )}
                </button>
              )}

              {!allCompleted && (
                <button
                  type="button"
                  onClick={handleAdvanceDrill}
                  aria-label="Complete current warmup drill and advance"
                  className="min-h-[38px] px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1"
                >
                  <SkipForward className="w-3.5 h-3.5" />
                  Next
                </button>
              )}

              {completedCount > 0 && (
                <button
                  type="button"
                  onClick={handleResetWarmup}
                  aria-label="Reset warmup checklist"
                  className="min-h-[38px] min-w-[38px] rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Warmup Drill Cards */}
          <div className="space-y-2">
            {sequence.drills.map((drill, idx) => {
              const isDone = Boolean(completedIds[drill.id]);
              const isCurrent = idx === activeDrillIndex && !allCompleted;
              return (
                <div
                  key={drill.id}
                  onClick={() => handleSelectDrill(idx)}
                  className={`rounded-xl border p-3 transition-colors cursor-pointer flex items-start justify-between gap-3 ${
                    isDone
                      ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200/80 dark:border-emerald-900/60'
                      : isCurrent
                      ? 'bg-blue-50/50 dark:bg-blue-950/25 border-blue-300 dark:border-blue-800'
                      : 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide ${PHASE_BADGE_CLASS[drill.phase]}`}
                      >
                        {drill.phase}
                      </span>
                      <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 tabular-nums">
                        {formatClock(drill.durationSeconds)} · {drill.prescription}
                      </span>
                    </div>
                    <p
                      className={`text-sm font-bold leading-snug ${
                        isDone
                          ? 'text-slate-500 dark:text-slate-400 line-through'
                          : 'text-slate-900 dark:text-white'
                      }`}
                    >
                      {idx + 1}. {drill.name}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {drill.cue}
                    </p>
                    {drill.targetExercises.length > 0 && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Preps for: <span className="font-medium">{drill.targetExercises.join(', ')}</span>
                      </p>
                    )}
                  </div>

                  <div
                    className="flex items-center gap-1.5 shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {(drill.exerciseId || drill.pattern) && (
                      <button
                        type="button"
                        onClick={() =>
                          onWatchFormVideo(drill.name, drill.exerciseId, drill.pattern)
                        }
                        aria-label={`Watch form guide for ${drill.name}`}
                        className="min-h-[38px] px-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-blue-600 dark:text-blue-400 text-xs font-semibold flex items-center gap-1 hover:bg-blue-50 dark:hover:bg-slate-800"
                      >
                        <PlayCircle className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Form</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleToggleDrillDone(idx)}
                      aria-label={
                        isDone ? `Unmark ${drill.name}` : `Mark ${drill.name} complete`
                      }
                      className={`min-h-[38px] min-w-[38px] rounded-xl flex items-center justify-center transition-colors ${
                        isDone
                          ? 'bg-emerald-600 text-white'
                          : 'bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-400 hover:border-blue-500'
                      }`}
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
};
