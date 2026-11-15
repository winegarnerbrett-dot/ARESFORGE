import React, { useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  PlayCircle,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import {
  EXERCISE_LIBRARY,
  resolveExerciseGuide,
  ROTATION_DAY_OPTIONS,
  WORKOUT_DURATION_OPTIONS,
} from '../data/programs';
import type {
  DifficultyLevel,
  MovementPattern,
  ProgramCategory,
  ProgramExercise,
  RotationDays,
  WorkoutDurationOption,
  WorkoutProgram,
} from '../types/fitness';

interface CustomProgramModalProps {
  initialProgram?: WorkoutProgram | null;
  onSave: (program: WorkoutProgram, isNew: boolean) => void;
  onPreviewVideo: (name: string, exerciseId?: string, pattern?: MovementPattern) => void;
  onClose: () => void;
}

export const CustomProgramModal: React.FC<CustomProgramModalProps> = ({
  initialProgram,
  onSave,
  onPreviewVideo,
  onClose,
}) => {
  const isNew = !initialProgram;
  const [title, setTitle] = useState(initialProgram?.title || '');
  const [category, setCategory] = useState<ProgramCategory>(initialProgram?.category || 'Custom');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(
    initialProgram?.difficulty || 'Intermediate'
  );
  const [daysPerWeek, setDaysPerWeek] = useState<RotationDays>(() => {
    const d = initialProgram?.daysPerWeek || 3;
    return Math.min(7, Math.max(3, d)) as RotationDays;
  });
  const [estimatedMinutes, setEstimatedMinutes] = useState<WorkoutDurationOption>(() => {
    const m = initialProgram?.estimatedMinutes || 45;
    return m <= 35 ? 30 : m >= 55 ? 60 : 45;
  });
  const [description, setDescription] = useState(initialProgram?.description || '');
  const [exercises, setExercises] = useState<ProgramExercise[]>(() =>
    (initialProgram?.exercises || []).map((ex) => ({
      ...ex,
      dayIndex: typeof ex.dayIndex === 'number' ? ex.dayIndex : 0,
      dayFocus: ex.dayFocus || '',
    }))
  );

  const [dayCount, setDayCount] = useState<number>(() => {
    const existing = initialProgram?.exercises || [];
    if (existing.length === 0) return 1;
    const maxIdx = Math.max(0, ...existing.map((e) => (typeof e.dayIndex === 'number' ? e.dayIndex : 0)));
    return Math.min(7, maxIdx + 1);
  });
  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const [dayFocuses, setDayFocuses] = useState<Record<number, string>>(() => {
    const map: Record<number, string> = {};
    for (const ex of initialProgram?.exercises || []) {
      const d = typeof ex.dayIndex === 'number' ? ex.dayIndex : 0;
      if (!map[d] && ex.dayFocus) {
        map[d] = ex.dayFocus;
      }
    }
    return map;
  });

  const [libraryQuery, setLibraryQuery] = useState('');
  const [customExName, setCustomExName] = useState('');
  const [customMuscle, setCustomMuscle] = useState('Full Body');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const filteredLibrary = EXERCISE_LIBRARY.filter((item) => {
    const q = libraryQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      item.name.toLowerCase().includes(q) ||
      item.muscleGroup.toLowerCase().includes(q) ||
      item.equipment.toLowerCase().includes(q)
    );
  });

  const addDayTab = () => {
    if (dayCount >= 7) return;
    const nextIdx = dayCount;
    setDayCount((c) => Math.min(7, c + 1));
    setActiveDayIndex(nextIdx);
    if (daysPerWeek < nextIdx + 1) {
      setDaysPerWeek(Math.min(7, Math.max(3, nextIdx + 1)) as RotationDays);
    }
  };

  const updateActiveDayFocus = (focusVal: string) => {
    const trimmed = focusVal.slice(0, 60);
    setDayFocuses((prev) => ({ ...prev, [activeDayIndex]: trimmed }));
    setExercises((prev) =>
      prev.map((ex) =>
        (ex.dayIndex ?? 0) === activeDayIndex ? { ...ex, dayFocus: trimmed } : ex
      )
    );
  };

  const addLibraryExercise = (item: (typeof EXERCISE_LIBRARY)[number]) => {
    if (exercises.length >= 25) {
      setErrorMsg('Programs can contain up to 25 total exercises across all rotation days.');
      return;
    }
    setErrorMsg(null);
    setExercises((prev) => [
      ...prev,
      {
        id: `ex_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        exerciseId: item.id,
        name: item.name,
        muscleGroup: item.muscleGroup,
        sets: item.defaultSets,
        reps: item.defaultReps,
        restSeconds: item.defaultRestSeconds,
        pattern: item.pattern,
        dayIndex: activeDayIndex,
        dayFocus: (dayFocuses[activeDayIndex] || '').trim(),
      },
    ]);
  };

  const addCustomExercise = () => {
    const trimmed = customExName.trim();
    if (!trimmed) return;
    if (exercises.length >= 25) {
      setErrorMsg('Programs can contain up to 25 total exercises across all rotation days.');
      return;
    }
    const inferred = resolveExerciseGuide(trimmed);
    setErrorMsg(null);
    setExercises((prev) => [
      ...prev,
      {
        id: `ex_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        name: trimmed.slice(0, 80),
        muscleGroup: customMuscle,
        sets: 3,
        reps: '10',
        restSeconds: 60,
        pattern: inferred.pattern,
        dayIndex: activeDayIndex,
        dayFocus: (dayFocuses[activeDayIndex] || '').trim(),
      },
    ]);
    setCustomExName('');
  };

  const updateExerciseById = (id: string, patch: Partial<ProgramExercise>) => {
    setExercises((prev) => prev.map((ex) => (ex.id === id ? { ...ex, ...patch } : ex)));
  };

  const activeDayExercises = exercises.filter((ex) => (ex.dayIndex ?? 0) === activeDayIndex);

  const moveExerciseInActiveDay = (id: string, dir: -1 | 1) => {
    const dayExIds = activeDayExercises.map((e) => e.id);
    const pos = dayExIds.indexOf(id);
    const targetPos = pos + dir;
    if (pos < 0 || targetPos < 0 || targetPos >= dayExIds.length) return;
    const swapId = dayExIds[targetPos];
    setExercises((prev) => {
      const idxA = prev.findIndex((e) => e.id === id);
      const idxB = prev.findIndex((e) => e.id === swapId);
      if (idxA < 0 || idxB < 0) return prev;
      const next = [...prev];
      const temp = next[idxA];
      next[idxA] = next[idxB];
      next[idxB] = temp;
      return next;
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Please enter a program name.');
      return;
    }
    if (exercises.length === 0) {
      setErrorMsg('Add at least one exercise to your program.');
      return;
    }

    // Normalize populated dayIndex sequentially (0..k-1) so empty tabs don't leave gaps
    const populatedIndices = Array.from(
      new Set(exercises.map((ex) => (typeof ex.dayIndex === 'number' ? ex.dayIndex : 0)))
    ).sort((a, b) => a - b);
    const remap = new Map<number, number>();
    populatedIndices.forEach((orig, seq) => remap.set(orig, seq));

    const normalizedExercises = exercises.map((ex) => {
      const origDay = typeof ex.dayIndex === 'number' ? ex.dayIndex : 0;
      const mappedDay = remap.get(origDay) ?? 0;
      return {
        ...ex,
        dayIndex: mappedDay,
        dayFocus: (dayFocuses[origDay] ?? ex.dayFocus ?? '').trim().slice(0, 60),
      };
    });

    onSave(
      {
        id: initialProgram?.id || `prog_${Date.now()}`,
        isCustom: true,
        title: title.trim().slice(0, 80),
        category,
        difficulty,
        daysPerWeek: Math.max(daysPerWeek, populatedIndices.length),
        estimatedMinutes,
        description: description.trim().slice(0, 300),
        exercises: normalizedExercises,
      },
      isNew
    );
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/70 backdrop-blur-sm p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={isNew ? 'Create custom workout program' : 'Edit custom workout program'}
    >
      <div className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-h-[92vh] flex flex-col">
        <div className="w-10 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mt-3 sm:hidden shrink-0" />

        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {isNew ? 'Create Custom Workout Program' : 'Edit Workout Program'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Build your split with verified form video guides and rest timers
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close builder"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-5 space-y-6">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs font-medium text-red-700 dark:text-red-300">
              {errorMsg}
            </div>
          )}

          {/* Program Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Program Title
              </label>
              <input
                type="text"
                required
                maxLength={80}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Push / Pull Athletic Split"
                className="w-full min-h-[44px] px-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ProgramCategory)}
                className="w-full min-h-[44px] px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white"
              >
                <option value="Custom">Custom</option>
                <option value="Strength">Strength</option>
                <option value="Hypertrophy">Hypertrophy</option>
                <option value="Conditioning">Conditioning</option>
                <option value="Mobility">Mobility</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Difficulty
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as DifficultyLevel)}
                className="w-full min-h-[44px] px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Rotation Length (3–7 Days)
              </label>
              <div className="flex items-center gap-1 flex-wrap">
                {ROTATION_DAY_OPTIONS.map((d) => {
                  const active = daysPerWeek === d;
                  return (
                    <button
                      key={d}
                      type="button"
                      onClick={() => {
                        setDaysPerWeek(d);
                        if (dayCount < d) setDayCount(d);
                      }}
                      className={`min-h-[40px] px-3 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
                        active
                          ? 'bg-slate-900 text-white dark:bg-blue-600'
                          : 'bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      {d}-Day
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Estimated Workout Time
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {WORKOUT_DURATION_OPTIONS.map((opt) => {
                  const active = estimatedMinutes === opt.minutes;
                  return (
                    <button
                      key={opt.minutes}
                      type="button"
                      onClick={() => setEstimatedMinutes(opt.minutes)}
                      className={`min-h-[40px] px-3 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
                        active
                          ? 'bg-slate-900 text-white dark:bg-blue-600'
                          : 'bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Notes / Focus
              </label>
              <input
                type="text"
                maxLength={300}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional progression notes or equipment checklist"
                className="w-full min-h-[44px] px-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Rotation Day Tabs & Day Focus */}
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Rotation Days &amp; Exercises ({exercises.length}/25 total)
              </h3>
              {dayCount < 7 && (
                <button
                  type="button"
                  onClick={addDayTab}
                  className="min-h-[36px] px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1 whitespace-nowrap shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Day
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {Array.from({ length: dayCount }, (_, dayIdx) => {
                const count = exercises.filter((e) => (e.dayIndex ?? 0) === dayIdx).length;
                const isActive = dayIdx === activeDayIndex;
                return (
                  <button
                    key={dayIdx}
                    type="button"
                    onClick={() => setActiveDayIndex(dayIdx)}
                    className={`min-h-[38px] px-3.5 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
                      isActive
                        ? 'bg-slate-900 text-white dark:bg-blue-600'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    Day {dayIdx + 1} ({count})
                  </button>
                );
              })}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Day {activeDayIndex + 1} Muscle Group / Focus
              </label>
              <input
                type="text"
                maxLength={60}
                value={dayFocuses[activeDayIndex] || ''}
                onChange={(e) => updateActiveDayFocus(e.target.value)}
                placeholder="e.g., Upper Push & Chest Hypertrophy"
                className="w-full min-h-[42px] px-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white"
              />
            </div>

            {activeDayExercises.length === 0 ? (
              <div className="p-5 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 text-center text-xs text-slate-500 dark:text-slate-400">
                No exercises in Day {activeDayIndex + 1} yet. Tap exercises below to add them to Day {activeDayIndex + 1}.
              </div>
            ) : (
              <div className="space-y-2.5">
                {activeDayExercises.map((ex, idx) => (
                  <div
                    key={ex.id}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                          {idx + 1}. {ex.name}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{ex.muscleGroup}</p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => onPreviewVideo(ex.name, ex.exerciseId, ex.pattern)}
                          aria-label={`Watch ${ex.name} form video`}
                          className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/50"
                        >
                          <PlayCircle className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveExerciseInActiveDay(ex.id, -1)}
                          disabled={idx === 0}
                          aria-label="Move exercise up"
                          className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-200/60 dark:hover:bg-slate-700 disabled:opacity-30"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveExerciseInActiveDay(ex.id, 1)}
                          disabled={idx === activeDayExercises.length - 1}
                          aria-label="Move exercise down"
                          className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-200/60 dark:hover:bg-slate-700 disabled:opacity-30"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setExercises((prev) => prev.filter((item) => item.id !== ex.id))}
                          aria-label="Remove exercise"
                          className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                          Sets
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={20}
                          value={ex.sets}
                          onChange={(e) =>
                            updateExerciseById(ex.id, { sets: Math.max(1, Number(e.target.value) || 1) })
                          }
                          className="w-full min-h-[40px] px-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                          Reps / Time
                        </label>
                        <input
                          type="text"
                          maxLength={20}
                          value={ex.reps}
                          onChange={(e) => updateExerciseById(ex.id, { reps: e.target.value })}
                          className="w-full min-h-[40px] px-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                          Rest (sec)
                        </label>
                        <input
                          type="number"
                          min={10}
                          max={600}
                          step={5}
                          value={ex.restSeconds}
                          onChange={(e) =>
                            updateExerciseById(ex.id, {
                              restSeconds: Math.max(10, Number(e.target.value) || 60),
                            })
                          }
                          className="w-full min-h-[40px] px-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add Custom Exercise */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2.5">
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Add Custom Movement
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                maxLength={80}
                value={customExName}
                onChange={(e) => setCustomExName(e.target.value)}
                placeholder="Exercise name (e.g., Landmine Press)"
                className="flex-1 min-h-[44px] px-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white"
              />
              <select
                value={customMuscle}
                onChange={(e) => setCustomMuscle(e.target.value)}
                className="min-h-[44px] px-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white"
              >
                <option value="Full Body">Full Body</option>
                <option value="Legs">Legs</option>
                <option value="Chest">Chest</option>
                <option value="Back">Back</option>
                <option value="Shoulders">Shoulders</option>
                <option value="Arms">Arms</option>
                <option value="Core">Core</option>
                <option value="Conditioning">Conditioning</option>
              </select>
              <button
                type="button"
                onClick={addCustomExercise}
                className="min-h-[44px] px-4 rounded-xl bg-slate-900 dark:bg-slate-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>
          </div>

          {/* Exercise Library Picker */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Add from Exercise Library
              </h3>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={libraryQuery}
                  onChange={(e) => setLibraryQuery(e.target.value)}
                  placeholder="Filter exercises..."
                  className="w-full sm:w-56 min-h-[40px] pl-9 pr-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
              {filteredLibrary.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-2 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                      {item.name}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {item.muscleGroup} · {item.defaultSets}×{item.defaultReps}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => onPreviewVideo(item.name, item.id, item.pattern)}
                      aria-label={`Watch ${item.name} form video`}
                      className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <PlayCircle className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => addLibraryExercise(item)}
                      className="min-h-[36px] px-2.5 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 text-blue-600 dark:text-blue-400 text-xs font-semibold"
                    >
                      + Add
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </form>

        <div className="px-5 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3 shrink-0 bg-white dark:bg-slate-900 rounded-b-3xl">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-4 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={(e) => handleSave(e as unknown as React.FormEvent)}
            className="min-h-[44px] px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors"
          >
            {isNew ? 'Save Program' : 'Update Program'}
          </button>
        </div>
      </div>
    </div>
  );
};
