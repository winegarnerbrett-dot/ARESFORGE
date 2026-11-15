import React, { useMemo, useState } from 'react';
import { ArrowLeftRight, PlayCircle, RotateCcw, X } from 'lucide-react';
import {
  EQUIPMENT_FILTER_OPTIONS,
  getLikeExerciseAlternatives,
  matchesEquipmentFilter,
  type EquipmentCategoryFilter,
} from '../data/programs';
import type { ExerciseLibraryItem, MovementPattern, ProgramExercise } from '../types/fitness';

interface ExerciseSwapModalProps {
  programTitle: string;
  exercise: ProgramExercise;
  onSelectReplacement: (replacement: ExerciseLibraryItem) => void;
  onRevertToOriginal?: () => void;
  onWatchFormVideo: (name: string, exerciseId?: string, pattern?: MovementPattern) => void;
  onClose: () => void;
}

export const ExerciseSwapModal: React.FC<ExerciseSwapModalProps> = ({
  programTitle,
  exercise,
  onSelectReplacement,
  onRevertToOriginal,
  onWatchFormVideo,
  onClose,
}) => {
  const [equipmentFilter, setEquipmentFilter] = useState<EquipmentCategoryFilter>('All');

  const { currentEquipment, samePattern, sameMuscle } = useMemo(
    () => getLikeExerciseAlternatives(exercise),
    [exercise]
  );

  const filteredPattern = useMemo(
    () => samePattern.filter((item) => matchesEquipmentFilter(item.equipment, equipmentFilter)),
    [samePattern, equipmentFilter]
  );

  const filteredMuscle = useMemo(
    () => sameMuscle.filter((item) => matchesEquipmentFilter(item.equipment, equipmentFilter)),
    [sameMuscle, equipmentFilter]
  );

  const renderAlternativeRow = (item: ExerciseLibraryItem) => (
    <div
      key={item.id}
      className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
    >
      <div className="min-w-0">
        <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
          {item.name}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          {item.equipment} · {item.muscleGroup}
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={() => onWatchFormVideo(item.name, item.id, item.pattern)}
          className="min-h-[40px] px-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors"
        >
          <PlayCircle className="w-4 h-4" />
          Form
        </button>
        <button
          type="button"
          onClick={() => onSelectReplacement(item)}
          className="min-h-[40px] px-4 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white text-xs font-semibold whitespace-nowrap shrink-0 transition-colors"
        >
          Use This
        </button>
      </div>
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/70 backdrop-blur-sm p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Replace ${exercise.name}`}
    >
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400">
              <ArrowLeftRight className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Replace Exercise · {programTitle}</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5 truncate">
              {exercise.name}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Requires: {currentEquipment} · {exercise.muscleGroup}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close replace exercise modal"
            className="min-h-[44px] min-w-[44px] rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Revert Banner if Already Swapped */}
        {exercise.replacedFromName && onRevertToOriginal && (
          <div className="px-4 sm:px-5 py-3 bg-blue-50/70 dark:bg-blue-950/30 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
            <p className="text-xs text-slate-700 dark:text-slate-200 min-w-0">
              Originally <span className="font-semibold">{exercise.replacedFromName}</span>
            </p>
            <button
              type="button"
              onClick={onRevertToOriginal}
              className="min-h-[38px] px-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5 whitespace-nowrap shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Restore Original
            </button>
          </div>
        )}

        {/* Equipment Filter Strip */}
        <div className="px-4 sm:px-5 py-3 border-b border-slate-100 dark:border-slate-800 space-y-2">
          <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            Filter alternatives by available equipment
          </p>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
            {EQUIPMENT_FILTER_OPTIONS.map((filterOpt) => {
              const active = equipmentFilter === filterOpt;
              return (
                <button
                  key={filterOpt}
                  type="button"
                  onClick={() => setEquipmentFilter(filterOpt)}
                  className={`min-h-[36px] px-3 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
                    active
                      ? 'bg-slate-900 text-white dark:bg-blue-600'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {filterOpt}
                </button>
              );
            })}
          </div>
        </div>

        {/* Alternatives List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
          {filteredPattern.length === 0 && filteredMuscle.length === 0 ? (
            <div className="py-8 text-center space-y-2">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                No matches for &ldquo;{equipmentFilter}&rdquo;
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Switch back to &ldquo;All&rdquo; or pick another equipment filter to view all compatible exercises.
              </p>
              <button
                type="button"
                onClick={() => setEquipmentFilter('All')}
                className="min-h-[40px] px-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200"
              >
                Show All Alternatives
              </button>
            </div>
          ) : (
            <>
              {filteredPattern.length > 0 && (
                <section className="space-y-2.5">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      Like Movement Pattern (Best Match)
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Trains the exact same biomechanical pattern with different equipment
                    </p>
                  </div>
                  <div className="space-y-2">{filteredPattern.map(renderAlternativeRow)}</div>
                </section>
              )}

              {filteredMuscle.length > 0 && (
                <section className="space-y-2.5">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      Same Muscle Group ({exercise.muscleGroup})
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Compatible exercises targeting the same primary muscles
                    </p>
                  </div>
                  <div className="space-y-2">{filteredMuscle.map(renderAlternativeRow)}</div>
                </section>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
