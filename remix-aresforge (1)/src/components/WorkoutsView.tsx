import React, { useState } from 'react';
import {
  ArrowLeftRight,
  Award,
  ChevronDown,
  ChevronUp,
  Clock,
  Dumbbell,
  Edit3,
  Flame,
  Gauge,
  Play,
  PlayCircle,
  Plus,
  Repeat,
  Shield,
  ShieldCheck,
  Trash2,
} from 'lucide-react';
import {
  adaptProgramForUser,
  AFT_FIVE_EVENTS,
  AFT_PROGRAMS,
  ATHENA_PILLARS,
  EXERCISE_LIBRARY,
  EXPERIENCE_LEVEL_GUIDE,
  getNextProgramDayIndex,
  HYBRID_PILLARS,
  LEO_PILLARS,
  ROTATION_DAY_OPTIONS,
  WORKOUT_DURATION_OPTIONS,
} from '../data/programs';
import type {
  ExperienceLevel,
  MovementPattern,
  ProgramCategory,
  ProgramDay,
  ProgramExercise,
  ProgramPreference,
  RotationDays,
  WorkoutDurationOption,
  WorkoutProgram,
  WorkoutSession,
} from '../types/fitness';

interface WorkoutsViewProps {
  preExistingPrograms: WorkoutProgram[];
  customPrograms: WorkoutProgram[];
  workoutSessions: WorkoutSession[];
  experienceLevel: ExperienceLevel;
  programPrefs: Record<string, ProgramPreference>;
  onChangeExperienceLevel: (level: ExperienceLevel) => void;
  onUpdateProgramPref: (
    programId: string,
    patch: { rotationDays?: RotationDays; targetMinutes?: WorkoutDurationOption }
  ) => void;
  onStartWorkout: (program: WorkoutProgram, day: ProgramDay) => void;
  onRequestSwapExercise: (program: WorkoutProgram, exercise: ProgramExercise) => void;
  onCreateProgram: () => void;
  onEditProgram: (program: WorkoutProgram) => void;
  onDeleteProgram: (programId: string) => void;
  onWatchFormVideo: (name: string, exerciseId?: string, pattern?: MovementPattern) => void;
}

const ProgramCoverImage: React.FC<{ src?: string; alt: string; category: string }> = ({
  src,
  alt,
  category,
}) => {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className="w-full aspect-[4/3] bg-gradient-to-br from-slate-800 to-slate-900 flex flex-col items-center justify-center p-4 text-slate-300">
        <Dumbbell className="w-8 h-8 mb-2 text-blue-400" />
        <span className="text-xs font-medium">{category} Program</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className="w-full aspect-[4/3] object-cover"
    />
  );
};

export const WorkoutsView: React.FC<WorkoutsViewProps> = ({
  preExistingPrograms,
  customPrograms,
  workoutSessions,
  experienceLevel,
  programPrefs,
  onChangeExperienceLevel,
  onUpdateProgramPref,
  onStartWorkout,
  onRequestSwapExercise,
  onCreateProgram,
  onEditProgram,
  onDeleteProgram,
  onWatchFormVideo,
}) => {
  const [filter, setFilter] = useState<
    'All' | 'AFT' | 'Hybrid' | 'Law Enforcement' | "Athena's Forge" | ProgramCategory
  >('All');
  const [expandedProgramId, setExpandedProgramId] = useState<string | null>(
    AFT_PROGRAMS[0]?.id || preExistingPrograms[0]?.id || null
  );
  const [selectedDayByProgram, setSelectedDayByProgram] = useState<Record<string, number>>({});
  const [libraryQuery, setLibraryQuery] = useState('');

  const allPrograms = [...customPrograms, ...AFT_PROGRAMS, ...preExistingPrograms].filter((p) => {
    if (filter === 'All') return true;
    if (filter === 'Custom') return p.isCustom || p.category === 'Custom';
    return p.category === filter;
  });

  const filteredExercises = EXERCISE_LIBRARY.filter((ex) => {
    const q = libraryQuery.trim().toLowerCase();
    if (!q) return true;
    return ex.name.toLowerCase().includes(q) || ex.muscleGroup.toLowerCase().includes(q);
  });

  const getProgramRotationState = (program: WorkoutProgram) => {
    const pref = programPrefs[program.id];
    const adapted = adaptProgramForUser(program, {
      rotationDays: pref?.rotationDays,
      targetMinutes: pref?.targetMinutes,
      experienceLevel,
      exerciseSwaps: pref?.exerciseSwaps,
    });
    const days = adapted.days;
    const completedCount = workoutSessions.filter((s) => s.programId === program.id).length;
    const nextDayIdx = getNextProgramDayIndex(program.id, days.length, workoutSessions);
    const chosenIdx = selectedDayByProgram[program.id];
    const activeDayIdx =
      chosenIdx !== undefined && chosenIdx >= 0 && chosenIdx < days.length ? chosenIdx : nextDayIdx;
    const selectedDay = days[activeDayIdx] || days[0];
    return {
      rotationDays: adapted.rotationDays,
      targetMinutes: adapted.targetMinutes,
      days,
      completedCount,
      nextDayIdx,
      activeDayIdx,
      selectedDay,
    };
  };

  const renderProgramCard = (program: WorkoutProgram, featuredLabel?: string) => {
    const isFeaturedCard = Boolean(featuredLabel);
    const isExpanded = expandedProgramId === program.id;
    const {
      rotationDays,
      targetMinutes,
      days,
      completedCount,
      nextDayIdx,
      activeDayIdx,
      selectedDay,
    } = getProgramRotationState(program);

    const durationLabel = targetMinutes === 60 ? '1 hr' : `${targetMinutes} min`;

    return (
      <div
        key={program.id}
        className={`rounded-2xl overflow-hidden flex flex-col border ${
          isFeaturedCard
            ? 'bg-slate-50/70 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800'
            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
        }`}
      >
        <div className="relative">
          <ProgramCoverImage
            src={program.imageUrl}
            alt={program.title}
            category={program.category}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <p className="text-xs text-slate-200 font-medium">
              {featuredLabel
                ? featuredLabel
                : program.isCustom
                ? 'Custom Program'
                : program.category}{' '}
              · {experienceLevel} · {durationLabel} · {rotationDays}-Day Rotation
            </p>
            {isFeaturedCard ? (
              <h3 className="text-xl font-bold leading-snug mt-0.5">{program.title}</h3>
            ) : (
              <h2 className="text-xl font-bold leading-snug mt-0.5">{program.title}</h2>
            )}
          </div>
        </div>

        <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between gap-4">
          <div className="space-y-3.5">
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {program.description || 'Custom training split.'}
            </p>

            {/* Rotation Length (3-7 Days) & Workout Duration (30m / 45m / 1hr) Selectors */}
            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 p-3 space-y-2.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5 whitespace-nowrap">
                  <Repeat className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  Rotation
                </span>
                <div className="flex items-center gap-1 overflow-x-auto">
                  {ROTATION_DAY_OPTIONS.map((numDays) => {
                    const active = rotationDays === numDays;
                    return (
                      <button
                        key={numDays}
                        type="button"
                        onClick={() => {
                          onUpdateProgramPref(program.id, { rotationDays: numDays });
                          setSelectedDayByProgram((prev) => ({
                            ...prev,
                            [program.id]: Math.min(prev[program.id] ?? 0, numDays - 1),
                          }));
                        }}
                        className={`min-h-[34px] px-2.5 rounded-lg text-[11px] font-semibold whitespace-nowrap shrink-0 transition-colors ${
                          active
                            ? 'bg-slate-900 text-white dark:bg-blue-600'
                            : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        {numDays}-Day
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-200/70 dark:border-slate-700/70">
                <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5 whitespace-nowrap">
                  <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  Est. Time
                </span>
                <div className="flex items-center gap-1">
                  {WORKOUT_DURATION_OPTIONS.map((opt) => {
                    const active = targetMinutes === opt.minutes;
                    return (
                      <button
                        key={opt.minutes}
                        type="button"
                        onClick={() =>
                          onUpdateProgramPref(program.id, { targetMinutes: opt.minutes })
                        }
                        className={`min-h-[34px] px-3 rounded-lg text-[11px] font-semibold whitespace-nowrap shrink-0 transition-colors ${
                          active
                            ? 'bg-slate-900 text-white dark:bg-blue-600'
                            : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Rotation Status & Day Selector */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="font-semibold text-blue-600 dark:text-blue-400">
                  Next Up: Day {nextDayIdx + 1} of {days.length} · {days[nextDayIdx]?.focus}
                </span>
                {completedCount > 0 && (
                  <span className="font-mono text-slate-500 dark:text-slate-400">
                    {completedCount} logged
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
                {days.map((day, idx) => {
                  const isSelected = idx === activeDayIdx;
                  const isNextUp = idx === nextDayIdx;
                  return (
                    <button
                      key={day.dayNumber}
                      type="button"
                      onClick={() =>
                        setSelectedDayByProgram((prev) => ({
                          ...prev,
                          [program.id]: idx,
                        }))
                      }
                      className={`min-h-[38px] px-3 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-slate-900 text-white dark:bg-blue-600'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      Day {day.dayNumber}
                      {isNextUp ? ' · Next' : ''}
                    </button>
                  );
                })}
              </div>

              <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 px-3 py-2.5 space-y-0.5">
                <p className="text-xs font-semibold text-slate-900 dark:text-white">
                  Day {selectedDay.dayNumber}: {selectedDay.focus}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {selectedDay.recoveryNote}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setExpandedProgramId(isExpanded ? null : program.id)}
              className="min-h-[40px] w-full px-3 rounded-xl bg-slate-50 dark:bg-slate-800/70 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors"
            >
              <span>
                Day {selectedDay.dayNumber} · {selectedDay.exercises.length} Exercises · {durationLabel} · View Form Videos
              </span>
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {isExpanded && (
              <div className="divide-y divide-slate-100 dark:divide-slate-800 border-t border-slate-100 dark:border-slate-800 pt-1">
                {selectedDay.exercises.map((ex, idx) => (
                  <div key={ex.id} className="py-2.5 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                        {idx + 1}. {ex.name}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
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
                        className="min-h-[38px] px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1 whitespace-nowrap shrink-0 transition-colors"
                      >
                        <ArrowLeftRight className="w-3.5 h-3.5" />
                        Swap
                      </button>
                      <button
                        type="button"
                        onClick={() => onWatchFormVideo(ex.name, ex.exerciseId, ex.pattern)}
                        className="min-h-[38px] px-3 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 text-blue-600 dark:text-blue-400 text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap shrink-0"
                      >
                        <PlayCircle className="w-4 h-4" />
                        Form Video
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() =>
                onStartWorkout(
                  { ...program, estimatedMinutes: targetMinutes, daysPerWeek: rotationDays },
                  selectedDay
                )
              }
              className="flex-1 min-h-[46px] px-4 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <Play className="w-4 h-4 fill-current shrink-0" />
              <span className="truncate">
                Start Day {selectedDay.dayNumber} ({durationLabel}) · {selectedDay.focus}
              </span>
            </button>

            {program.isCustom && (
              <>
                <button
                  type="button"
                  onClick={() => onEditProgram(program)}
                  aria-label={`Edit ${program.title}`}
                  className="min-h-[46px] min-w-[46px] rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteProgram(program.id)}
                  aria-label={`Delete ${program.title}`}
                  className="min-h-[46px] min-w-[46px] rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  const aftPrimaryRotation = AFT_PROGRAMS[0] ? getProgramRotationState(AFT_PROGRAMS[0]) : null;
  const hybridPrograms = preExistingPrograms.filter((p) => p.id.startsWith('prog-hybrid'));
  const leoPrograms = preExistingPrograms.filter((p) => p.id.startsWith('prog-leo'));
  const athenaPrograms = preExistingPrograms.filter((p) => p.id.startsWith('prog-athena'));
  const hybridPrimaryRotation = hybridPrograms[0]
    ? getProgramRotationState(hybridPrograms[0])
    : null;
  const leoPrimaryRotation = leoPrograms[0] ? getProgramRotationState(leoPrograms[0]) : null;
  const athenaPrimaryRotation = athenaPrograms[0]
    ? getProgramRotationState(athenaPrograms[0])
    : null;

  return (
    <div className="space-y-6">
      {/* Header & Create Custom CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Workout Programs
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Tailored by experience level with 3–7 day muscle-recovery rotations and 30m, 45m, or 1 hr durations
          </p>
        </div>

        <button
          type="button"
          onClick={onCreateProgram}
          className="min-h-[48px] px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold flex items-center justify-center gap-2 whitespace-nowrap shrink-0 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Custom Program
        </button>
      </div>

      {/* Training Experience Level Selector */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
            <Gauge className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Experience Level Programming</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {EXPERIENCE_LEVEL_GUIDE[experienceLevel]}
          </p>
        </div>

        <div
          className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl shrink-0 self-start lg:self-auto"
          role="group"
          aria-label="Training experience level"
        >
          {(['Beginner', 'Intermediate', 'Advanced'] as const).map((level) => {
            const active = experienceLevel === level;
            return (
              <button
                key={level}
                type="button"
                onClick={() => onChangeExperienceLevel(level)}
                className={`min-h-[38px] px-3.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
                  active
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {level}
              </button>
            );
          })}
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {(
          [
            'All',
            'Custom',
            'Strength',
            'Hypertrophy',
            'Conditioning',
            'Mobility',
            'AFT',
            'Hybrid',
            'Law Enforcement',
            "Athena's Forge",
          ] as const
        ).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setFilter(tab)}
            className={`min-h-[40px] px-4 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
              filter === tab
                ? 'bg-slate-900 text-white dark:bg-blue-600'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Dedicated AFT Tab View */}
      {filter === 'AFT' ? (
        <section
          aria-labelledby="aft-section-heading"
          className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 space-y-5"
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400">
                <Shield className="w-4 h-4" />
                <span>Army Fitness Test (AFT) · 500-Point Standard</span>
              </div>
              <h2
                id="aft-section-heading"
                className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight"
              >
                AFT Score Improvement Programs
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
                Customize 3 to 7 day rotations and 30 min, 45 min, or 1 hr sessions scaled to your {experienceLevel.toLowerCase()} level.
              </p>
            </div>
            {AFT_PROGRAMS[0] && aftPrimaryRotation && (
              <button
                type="button"
                onClick={() =>
                  onStartWorkout(
                    {
                      ...AFT_PROGRAMS[0],
                      estimatedMinutes: aftPrimaryRotation.targetMinutes,
                      daysPerWeek: aftPrimaryRotation.rotationDays,
                    },
                    aftPrimaryRotation.days[aftPrimaryRotation.nextDayIdx]
                  )
                }
                className="min-h-[46px] px-5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white text-sm font-semibold flex items-center justify-center gap-2 whitespace-nowrap shrink-0 transition-colors"
              >
                <Play className="w-4 h-4 fill-current" />
                Start Day {aftPrimaryRotation.nextDayIdx + 1} · AFT Builder
              </button>
            )}
          </div>

          {/* 5 Scored AFT Events Quick Reference with Form Videos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {AFT_FIVE_EVENTS.map((ev) => (
              <button
                key={ev.code}
                type="button"
                onClick={() => onWatchFormVideo(ev.name, ev.exerciseId)}
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 hover:border-blue-500/50 text-left flex flex-col justify-between gap-2 transition-colors"
              >
                <div>
                  <p className="text-[11px] font-mono font-semibold text-slate-500 dark:text-slate-400">
                    {ev.order}. {ev.code}
                  </p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 leading-snug">
                    {ev.name}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    {ev.standard}
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400">
                  <PlayCircle className="w-3.5 h-3.5" />
                  Form Video
                </span>
              </button>
            ))}
          </div>

          {/* Pre-Programmed AFT Workouts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {AFT_PROGRAMS.map((program) => renderProgramCard(program, 'AFT Prep'))}
          </div>
        </section>
      ) : filter === 'Hybrid' ? (
        <section
          aria-labelledby="hybrid-section-heading"
          className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 space-y-5"
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400">
                <Flame className="w-4 h-4" />
                <span>Hybrid Athlete · Strength + Endurance Engine</span>
              </div>
              <h2
                id="hybrid-section-heading"
                className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight"
              >
                Hybrid Training Programs
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
                Pair compound strength lifts with Zone 2 aerobic base and threshold intervals across 3 to 7 day rotations scaled to your {experienceLevel.toLowerCase()} level.
              </p>
            </div>
            {hybridPrograms[0] && hybridPrimaryRotation && (
              <button
                type="button"
                onClick={() =>
                  onStartWorkout(
                    {
                      ...hybridPrograms[0],
                      estimatedMinutes: hybridPrimaryRotation.targetMinutes,
                      daysPerWeek: hybridPrimaryRotation.rotationDays,
                    },
                    hybridPrimaryRotation.days[hybridPrimaryRotation.nextDayIdx]
                  )
                }
                className="min-h-[46px] px-5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white text-sm font-semibold flex items-center justify-center gap-2 whitespace-nowrap shrink-0 transition-colors"
              >
                <Play className="w-4 h-4 fill-current" />
                Start Day {hybridPrimaryRotation.nextDayIdx + 1} · Hybrid Engine
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {HYBRID_PILLARS.map((ev) => (
              <button
                key={ev.code}
                type="button"
                onClick={() => onWatchFormVideo(ev.name, ev.exerciseId)}
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 hover:border-blue-500/50 text-left flex flex-col justify-between gap-2 transition-colors"
              >
                <div>
                  <p className="text-[11px] font-mono font-semibold text-slate-500 dark:text-slate-400">
                    {ev.order}. {ev.code}
                  </p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 leading-snug">
                    {ev.name}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    {ev.standard}
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400">
                  <PlayCircle className="w-3.5 h-3.5" />
                  Form Video
                </span>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {hybridPrograms.map((program) => renderProgramCard(program, 'Hybrid Training'))}
          </div>
        </section>
      ) : filter === 'Law Enforcement' ? (
        <section
          aria-labelledby="leo-section-heading"
          className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 space-y-5"
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400">
                <ShieldCheck className="w-4 h-4" />
                <span>Law Enforcement · Patrol &amp; Academy Duty Readiness</span>
              </div>
              <h2
                id="leo-section-heading"
                className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight"
              >
                Law Enforcement Fitness Programs
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
                Build victim-drag power, subject-control strength, pursuit stamina, and duty-belt core durability across 3 to 7 day rotations scaled to your {experienceLevel.toLowerCase()} level.
              </p>
            </div>
            {leoPrograms[0] && leoPrimaryRotation && (
              <button
                type="button"
                onClick={() =>
                  onStartWorkout(
                    {
                      ...leoPrograms[0],
                      estimatedMinutes: leoPrimaryRotation.targetMinutes,
                      daysPerWeek: leoPrimaryRotation.rotationDays,
                    },
                    leoPrimaryRotation.days[leoPrimaryRotation.nextDayIdx]
                  )
                }
                className="min-h-[46px] px-5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white text-sm font-semibold flex items-center justify-center gap-2 whitespace-nowrap shrink-0 transition-colors"
              >
                <Play className="w-4 h-4 fill-current" />
                Start Day {leoPrimaryRotation.nextDayIdx + 1} · Duty Readiness
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {LEO_PILLARS.map((ev) => (
              <button
                key={ev.code}
                type="button"
                onClick={() => onWatchFormVideo(ev.name, ev.exerciseId)}
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 hover:border-blue-500/50 text-left flex flex-col justify-between gap-2 transition-colors"
              >
                <div>
                  <p className="text-[11px] font-mono font-semibold text-slate-500 dark:text-slate-400">
                    {ev.order}. {ev.code}
                  </p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 leading-snug">
                    {ev.name}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    {ev.standard}
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400">
                  <PlayCircle className="w-3.5 h-3.5" />
                  Form Video
                </span>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {leoPrograms.map((program) => renderProgramCard(program, 'Law Enforcement'))}
          </div>
        </section>
      ) : filter === "Athena's Forge" ? (
        <section
          aria-labelledby="athena-section-heading"
          className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 space-y-5"
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400">
                <Award className="w-4 h-4" />
                <span>Athena&apos;s Forge · Women&apos;s Strength, Glute &amp; Athletic Sculpt</span>
              </div>
              <h2
                id="athena-section-heading"
                className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight"
              >
                Athena&apos;s Forge Women&apos;s Programs
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
                Centered around women&apos;s strength, glute &amp; posterior-chain power, upper-body posture, and pelvic-core stability across 3 to 7 day rotations scaled to your {experienceLevel.toLowerCase()} level.
              </p>
            </div>
            {athenaPrograms[0] && athenaPrimaryRotation && (
              <button
                type="button"
                onClick={() =>
                  onStartWorkout(
                    {
                      ...athenaPrograms[0],
                      estimatedMinutes: athenaPrimaryRotation.targetMinutes,
                      daysPerWeek: athenaPrimaryRotation.rotationDays,
                    },
                    athenaPrimaryRotation.days[athenaPrimaryRotation.nextDayIdx]
                  )
                }
                className="min-h-[46px] px-5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white text-sm font-semibold flex items-center justify-center gap-2 whitespace-nowrap shrink-0 transition-colors"
              >
                <Play className="w-4 h-4 fill-current" />
                Start Day {athenaPrimaryRotation.nextDayIdx + 1} · Athena&apos;s Forge
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {ATHENA_PILLARS.map((ev) => (
              <button
                key={ev.code}
                type="button"
                onClick={() => onWatchFormVideo(ev.name, ev.exerciseId)}
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 hover:border-blue-500/50 text-left flex flex-col justify-between gap-2 transition-colors"
              >
                <div>
                  <p className="text-[11px] font-mono font-semibold text-slate-500 dark:text-slate-400">
                    {ev.order}. {ev.code}
                  </p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 leading-snug">
                    {ev.name}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    {ev.standard}
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400">
                  <PlayCircle className="w-3.5 h-3.5" />
                  Form Video
                </span>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {athenaPrograms.map((program) => renderProgramCard(program, "Athena's Forge"))}
          </div>
        </section>
      ) : allPrograms.length === 0 ? (
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 text-center space-y-3">
          <p className="text-base font-semibold text-slate-900 dark:text-white">
            No {filter === 'Custom' ? 'custom' : filter.toLowerCase()} programs yet
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Create a tailored multi-day program with your preferred exercises, sets, reps, and rest timers.
          </p>
          <button
            type="button"
            onClick={onCreateProgram}
            className="min-h-[44px] px-5 rounded-xl bg-blue-600 text-white text-xs font-semibold inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Build Program
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {allPrograms.map((program) => renderProgramCard(program))}
        </div>
      )}

      {/* Exercise Technique & Form Video Library */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Exercise Form &amp; Technique Library
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Tap any movement to watch its step-by-step biomechanical demonstration and safety cues
            </p>
          </div>
          <input
            type="text"
            value={libraryQuery}
            onChange={(e) => setLibraryQuery(e.target.value)}
            placeholder="Search movement or muscle..."
            className="w-full sm:w-64 min-h-[42px] px-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredExercises.map((ex) => (
            <button
              key={ex.id}
              type="button"
              onClick={() => onWatchFormVideo(ex.name, ex.id, ex.pattern)}
              className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 hover:border-blue-500/50 hover:bg-blue-50/40 dark:hover:bg-blue-950/20 text-left flex items-center justify-between gap-3 transition-colors"
            >
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                  {ex.name}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                  {ex.muscleGroup} · {ex.equipment}
                </p>
              </div>
              <PlayCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
