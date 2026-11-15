import React from 'react';
import { ArrowLeftRight, Clock, Lock, Play, PlayCircle, RotateCcw } from 'lucide-react';
import { WORKOUT_DURATION_OPTIONS } from '../data/programs';
import type {
  ExperienceLevel,
  MovementPattern,
  ProgramDay,
  ProgramExercise,
  RotationDays,
  WorkoutDurationOption,
  WorkoutProgram,
} from '../types/fitness';

interface NextWorkoutCardProps {
  program: WorkoutProgram;
  nextDay: ProgramDay;
  rotationDays: RotationDays;
  experienceLevel: ExperienceLevel;
  baseDurationMinutes: WorkoutDurationOption;
  todayDurationMinutes: WorkoutDurationOption;
  isDailyOverride: boolean;
  completedCount: number;
  selectedDateKey: string;
  onChangeDailyDuration: (minutes: WorkoutDurationOption | null) => void;
  onStartWorkout: (program: WorkoutProgram, day: ProgramDay) => void;
  onRequestSwapExercise: (program: WorkoutProgram, exercise: ProgramExercise) => void;
  onWatchFormVideo: (name: string, exerciseId?: string, pattern?: MovementPattern) => void;
  onViewAllPrograms: () => void;
}

export const NextWorkoutCard: React.FC<NextWorkoutCardProps> = ({
  program,
  nextDay,
  rotationDays,
  experienceLevel,
  baseDurationMinutes,
  todayDurationMinutes,
  isDailyOverride,
  completedCount,
  selectedDateKey,
  onChangeDailyDuration,
  onStartWorkout,
  onRequestSwapExercise,
  onWatchFormVideo,
  onViewAllPrograms,
}) => {
  const durationLabel = todayDurationMinutes === 60 ? '1 hr' : `${todayDurationMinutes} min`;
  const baseLabel = baseDurationMinutes === 60 ? '1 hr' : `${baseDurationMinutes} min`;

  return (
    <section
      aria-label="Up Next Workout"
      className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 space-y-4"
    >
      {/* Top Header & Primary Launch CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="min-w-0 space-y-1">
          <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 truncate">
            Up Next · {program.title} · Day {nextDay.dayNumber} of {rotationDays}
          </p>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight truncate">
            {nextDay.focus}
          </h2>
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
            <span className="inline-flex items-center gap-1">
              <Lock className="w-3 h-3 text-slate-400" />
              {rotationDays}-Day Rotation
            </span>
            <span aria-hidden="true">·</span>
            <span>{experienceLevel} Level</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">{nextDay.exercises.length} exercises</span>
            {completedCount > 0 && (
              <>
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums">{completedCount} completed</span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onViewAllPrograms}
            className="min-h-[44px] px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 whitespace-nowrap shrink-0 transition-colors"
          >
            All Programs
          </button>
          <button
            type="button"
            onClick={() =>
              onStartWorkout(
                {
                  ...program,
                  estimatedMinutes: todayDurationMinutes,
                  daysPerWeek: rotationDays,
                },
                nextDay
              )
            }
            className="min-h-[46px] px-4 sm:px-5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 whitespace-nowrap shrink-0 transition-colors"
          >
            <Play className="w-4 h-4 fill-current shrink-0" />
            <span>
              Start Day {nextDay.dayNumber} ({durationLabel})
            </span>
          </button>
        </div>
      </div>

      {/* Daily Time Adjustment Bar (Keeps Rotation Days & Experience Level Unchanged) */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200">
            <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
            <span>Est. Time for {selectedDateKey}</span>
            {isDailyOverride && (
              <span className="text-[11px] font-normal text-slate-500 dark:text-slate-400">
                · Adjusted from {baseLabel} default
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            {nextDay.recoveryNote}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div
            className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800"
            role="group"
            aria-label="Adjust today's estimated workout time"
          >
            {WORKOUT_DURATION_OPTIONS.map((opt) => {
              const active = todayDurationMinutes === opt.minutes;
              return (
                <button
                  key={opt.minutes}
                  type="button"
                  onClick={() => onChangeDailyDuration(opt.minutes)}
                  className={`min-h-[38px] px-3 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
                    active
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>

          {isDailyOverride && (
            <button
              type="button"
              onClick={() => onChangeDailyDuration(null)}
              title={`Reset back to ${baseLabel} program default`}
              className="min-h-[38px] px-2.5 rounded-lg text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 flex items-center gap-1 whitespace-nowrap shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Compact Today's Exercise Preview */}
      <div className="divide-y divide-slate-100 dark:divide-slate-800 border-t border-slate-100 dark:border-slate-800">
        {nextDay.exercises.map((ex, idx) => (
          <div key={ex.id} className="py-2.5 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                {idx + 1}. {ex.name}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                {ex.sets} sets × {ex.reps} · {ex.restSeconds}s rest
                {ex.equipment ? ` · ${ex.equipment}` : ''}
              </p>
              {ex.replacedFromName && (
                <p className="text-[11px] text-blue-600 dark:text-blue-400 truncate mt-0.5">
                  Swapped from {ex.replacedFromName}
                </p>
              )}
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
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
                className="min-h-[40px] px-3 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 text-blue-600 dark:text-blue-400 text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap shrink-0"
              >
                <PlayCircle className="w-4 h-4" />
                Form Video
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
