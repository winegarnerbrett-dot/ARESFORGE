import React, { useState } from 'react';
import { Lock, RotateCcw, Unlock } from 'lucide-react';
import {
  macrosFromPercentages,
  normalizeMacroPercentages,
  rebalanceMacroPercentages,
  type MacroKey,
  type MacroPercentages,
  type MacroTargets,
} from '../lib/nutritionCoach';

interface MacroPercentageEditorProps {
  calories: number;
  percentages: MacroPercentages;
  recommendedMacros: MacroTargets;
  goalLabel: string;
  isCustom: boolean;
  onChangePercentages: (next: MacroPercentages) => void;
  onResetToRecommended: () => void;
}

const MACRO_META: Array<{
  key: MacroKey;
  label: string;
  kcalPerGram: number;
  dotClass: string;
  barClass: string;
  textClass: string;
  accentClass: string;
}> = [
  {
    key: 'proteinPct',
    label: 'Protein',
    kcalPerGram: 4,
    dotClass: 'bg-blue-600',
    barClass: 'bg-blue-600',
    textClass: 'text-blue-600 dark:text-blue-400',
    accentClass: 'accent-blue-600',
  },
  {
    key: 'carbsPct',
    label: 'Carbs',
    kcalPerGram: 4,
    dotClass: 'bg-emerald-600',
    barClass: 'bg-emerald-600',
    textClass: 'text-emerald-600 dark:text-emerald-400',
    accentClass: 'accent-emerald-600',
  },
  {
    key: 'fatPct',
    label: 'Fat',
    kcalPerGram: 9,
    dotClass: 'bg-amber-500',
    barClass: 'bg-amber-500',
    textClass: 'text-amber-600 dark:text-amber-400',
    accentClass: 'accent-amber-500',
  },
];

export const MacroPercentageEditor: React.FC<MacroPercentageEditorProps> = ({
  calories,
  percentages,
  recommendedMacros,
  goalLabel,
  isCustom,
  onChangePercentages,
  onResetToRecommended,
}) => {
  const [lockedKey, setLockedKey] = useState<MacroKey | null>(null);
  const [editing, setEditing] = useState<{ key: MacroKey; value: string } | null>(null);

  const normalized = normalizeMacroPercentages(percentages);
  const targets = macrosFromPercentages(calories, normalized);
  const totalPct = normalized.proteinPct + normalized.carbsPct + normalized.fatPct;

  const matchesRecommended =
    !isCustom &&
    normalized.proteinPct === recommendedMacros.proteinPct &&
    normalized.carbsPct === recommendedMacros.carbsPct &&
    normalized.fatPct === recommendedMacros.fatPct;

  const handleAdjust = (key: MacroKey, rawValue: number) => {
    const safeVal = Number.isFinite(rawValue) ? rawValue : 0;
    const next = rebalanceMacroPercentages(normalized, key, safeVal, lockedKey);
    onChangePercentages(next);
  };

  const toggleLock = (key: MacroKey) => {
    setLockedKey((prev) => (prev === key ? null : key));
  };

  const gramForKey = (key: MacroKey): number => {
    if (key === 'proteinPct') return targets.proteinG;
    if (key === 'carbsPct') return targets.carbsG;
    return targets.fatG;
  };

  return (
    <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 p-4 space-y-3.5">
      {/* Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white">
              Macro Percentage Split
            </h3>
            <span className="text-[11px] font-mono tabular-nums font-semibold text-emerald-700 dark:text-emerald-400">
              Total {totalPct}%
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            {isCustom
              ? 'Custom split active · adjusts automatically to keep 100%'
              : `Built-in recommendation for ${goalLabel}`}
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditing(null);
            setLockedKey(null);
            onResetToRecommended();
          }}
          disabled={matchesRecommended}
          className={`min-h-[36px] px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors ${
            matchesRecommended
              ? 'bg-emerald-600/10 text-emerald-700 dark:text-emerald-400 cursor-default'
              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          {matchesRecommended
            ? 'Using Recommended'
            : `Reset to Recommended (${recommendedMacros.proteinPct}/${recommendedMacros.carbsPct}/${recommendedMacros.fatPct}%)`}
        </button>
      </div>

      {/* Live 100% Proportional Bar */}
      <div className="h-2.5 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden flex">
        <div
          className="h-full bg-blue-600 transition-all duration-150"
          style={{ width: `${normalized.proteinPct}%` }}
          title={`Protein ${normalized.proteinPct}%`}
        />
        <div
          className="h-full bg-emerald-600 transition-all duration-150"
          style={{ width: `${normalized.carbsPct}%` }}
          title={`Carbs ${normalized.carbsPct}%`}
        />
        <div
          className="h-full bg-amber-500 transition-all duration-150"
          style={{ width: `${normalized.fatPct}%` }}
          title={`Fat ${normalized.fatPct}%`}
        />
      </div>

      {/* Individual Macro Controls */}
      <div className="space-y-2.5">
        {MACRO_META.map((macro) => {
          const pct = normalized[macro.key];
          const grams = gramForKey(macro.key);
          const isLocked = lockedKey === macro.key;
          const isConstrainedByOtherLock = lockedKey !== null && lockedKey !== macro.key;
          const maxSelectable = isConstrainedByOtherLock ? 100 - normalized[lockedKey!] : 100;
          const isEditingThis = editing?.key === macro.key;
          const displayValue = isEditingThis ? editing.value : String(pct);

          return (
            <div
              key={macro.key}
              className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 px-3 py-2.5 space-y-2"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${macro.dotClass}`} />
                  <span className="text-xs font-semibold text-slate-900 dark:text-white">
                    {macro.label}
                  </span>
                  <span className="text-[11px] font-mono tabular-nums text-slate-500 dark:text-slate-400">
                    = <strong className={macro.textClass}>{grams}g</strong>
                  </span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => toggleLock(macro.key)}
                    aria-label={isLocked ? `Unlock ${macro.label} percentage` : `Lock ${macro.label} percentage`}
                    title={
                      isLocked
                        ? `${macro.label} locked at ${pct}%`
                        : `Lock ${macro.label} to hold steady while adjusting the others`
                    }
                    className={`min-h-[34px] min-w-[34px] px-2 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors ${
                      isLocked
                        ? 'bg-slate-900 text-white dark:bg-blue-600'
                        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                    <span className="hidden sm:inline">{isLocked ? 'Locked' : 'Lock'}</span>
                  </button>

                  <div className="relative flex items-center">
                    <input
                      type="number"
                      inputMode="numeric"
                      min={0}
                      max={maxSelectable}
                      step={1}
                      aria-label={`${macro.label} percentage`}
                      value={displayValue}
                      onFocus={() => setEditing({ key: macro.key, value: String(pct) })}
                      onChange={(e) => {
                        const raw = e.target.value;
                        const cleaned = raw === '' ? '' : raw.replace(/^0+(?=\d)/, '');
                        setEditing({ key: macro.key, value: cleaned });
                        if (cleaned !== '') {
                          const parsed = Number(cleaned);
                          if (Number.isFinite(parsed)) {
                            handleAdjust(macro.key, parsed);
                          }
                        }
                      }}
                      onBlur={() => {
                        if (editing?.key === macro.key && editing.value.trim() === '') {
                          handleAdjust(macro.key, 0);
                        }
                        setEditing(null);
                      }}
                      className="w-16 min-h-[34px] pl-2 pr-5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono tabular-nums font-bold text-right text-slate-900 dark:text-white"
                    />
                    <span className="pointer-events-none absolute right-2 text-[11px] font-mono text-slate-400">
                      %
                    </span>
                  </div>
                </div>
              </div>

              <input
                type="range"
                min={0}
                max={100}
                step={1}
                aria-label={`${macro.label} percentage slider`}
                value={pct}
                onChange={(e) => {
                  setEditing(null);
                  handleAdjust(macro.key, Number(e.target.value));
                }}
                className={`w-full h-2 rounded-lg cursor-pointer ${macro.accentClass}`}
              />
            </div>
          );
        })}
      </div>

      {/* Footer Reference */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400 pt-0.5">
        <span>
          {lockedKey
            ? `${MACRO_META.find((m) => m.key === lockedKey)?.label} is locked — adjust the other two freely.`
            : 'Tip: Lock any macro to keep it fixed while tuning the other two.'}
        </span>
        <span className="font-mono tabular-nums">
          Coach baseline: {recommendedMacros.proteinPct}% P · {recommendedMacros.carbsPct}% C ·{' '}
          {recommendedMacros.fatPct}% F
        </span>
      </div>
    </div>
  );
};
