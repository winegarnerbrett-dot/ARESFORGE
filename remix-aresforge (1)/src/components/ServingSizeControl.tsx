import React, { useEffect, useMemo, useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import {
  formatServingCount,
  formatUnitQuantity,
  getServingUnitOptions,
  type ServingUnitOption,
} from '../lib/servingUtils';
import type { UnitSystem } from '../types/fitness';

interface ServingSizeControlProps {
  servingLabel: string;
  servings: number;
  onChangeServings: (nextServings: number) => void;
  minServings?: number;
  maxServings?: number;
  unitSystem?: UnitSystem;
  compact?: boolean;
}

const PRESET_MULTIPLIERS = [0.5, 1, 1.5, 2];

export const ServingSizeControl: React.FC<ServingSizeControlProps> = ({
  servingLabel,
  servings,
  onChangeServings,
  minServings = 0.02,
  maxServings = 50,
  compact = false,
}) => {
  const { parsed, options } = useMemo(() => getServingUnitOptions(servingLabel), [servingLabel]);
  const [selectedUnitId, setSelectedUnitId] = useState<ServingUnitOption['id']>('servings');

  const activeOption = useMemo(
    () => options.find((opt) => opt.id === selectedUnitId) || options[0],
    [options, selectedUnitId]
  );

  // Sync unit fallback when servingLabel changes (e.g. new food selected)
  useEffect(() => {
    if (!options.some((opt) => opt.id === selectedUnitId)) {
      setSelectedUnitId('servings');
    }
  }, [options, selectedUnitId]);

  const quantityForCurrentUnit = servings / activeOption.servingsPerUnit;
  const [inputText, setInputText] = useState<string>(() =>
    formatUnitQuantity(quantityForCurrentUnit, activeOption.id)
  );
  const [isFocused, setIsFocused] = useState(false);

  // Keep text synced with external servings changes when input is not actively focused
  useEffect(() => {
    if (!isFocused) {
      setInputText(formatUnitQuantity(servings / activeOption.servingsPerUnit, activeOption.id));
    }
  }, [servings, activeOption, isFocused]);

  const clampServings = (val: number) =>
    Math.min(maxServings, Math.max(minServings, Math.round(val * 1000) / 1000));

  const handleSelectUnit = (unit: ServingUnitOption) => {
    setSelectedUnitId(unit.id);
    setInputText(formatUnitQuantity(servings / unit.servingsPerUnit, unit.id));
  };

  const handleInputChange = (raw: string) => {
    setInputText(raw);
    const num = Number(raw);
    if (Number.isFinite(num) && num > 0) {
      const next = clampServings(num * activeOption.servingsPerUnit);
      onChangeServings(next);
    }
  };

  const handleInputBlur = () => {
    setIsFocused(false);
    const num = Number(inputText);
    if (!Number.isFinite(num) || num <= 0) {
      const fallback = clampServings(servings);
      onChangeServings(fallback);
      setInputText(formatUnitQuantity(fallback / activeOption.servingsPerUnit, activeOption.id));
      return;
    }
    const clamped = clampServings(num * activeOption.servingsPerUnit);
    onChangeServings(clamped);
    setInputText(formatUnitQuantity(clamped / activeOption.servingsPerUnit, activeOption.id));
  };

  const handleStep = (deltaUnits: number) => {
    const currentUnits = servings / activeOption.servingsPerUnit;
    const minUnits = minServings / activeOption.servingsPerUnit;
    const nextUnits = Math.max(minUnits, currentUnits + deltaUnits);
    const nextServings = clampServings(nextUnits * activeOption.servingsPerUnit);
    onChangeServings(nextServings);
    setInputText(formatUnitQuantity(nextServings / activeOption.servingsPerUnit, activeOption.id));
  };

  const handlePreset = (multiplier: number) => {
    const clamped = clampServings(multiplier);
    onChangeServings(clamped);
    setInputText(formatUnitQuantity(clamped / activeOption.servingsPerUnit, activeOption.id));
  };

  const equivalentSummary = useMemo(() => {
    if (!parsed.isMeasurable) {
      return `Base serving: ${servingLabel || '1 serving'}`;
    }
    if (activeOption.id === 'servings') {
      const baseQty = Math.round(parsed.baseAmount * servings * 10) / 10;
      return `Equals ${baseQty} ${parsed.baseUnit} · Base: ${servingLabel}`;
    }
    return `Equals ${formatServingCount(servings)} ${servings === 1 ? 'serving' : 'servings'} · Base: ${servingLabel}`;
  }, [parsed, activeOption.id, servings, servingLabel]);

  return (
    <div className={compact ? 'space-y-2.5' : 'space-y-3'}>
      {/* Header row with Unit Mode Switcher when measurable */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
          Serving Size
        </label>

        {options.length > 1 && (
          <div
            className="inline-flex items-center gap-0.5 p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800"
            role="group"
            aria-label="Serving size unit"
          >
            {options.map((opt) => {
              const active = opt.id === activeOption.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleSelectUnit(opt)}
                  className={`min-h-[30px] px-2.5 rounded-md text-[11px] font-semibold whitespace-nowrap shrink-0 transition-colors ${
                    active
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Custom Numeric Input with - / + Steppers */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => handleStep(-activeOption.step)}
          aria-label={`Decrease ${activeOption.label}`}
          className="min-h-[44px] min-w-[44px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center shrink-0 transition-colors"
        >
          <Minus className="w-4 h-4" />
        </button>

        <div className="relative flex-1">
          <input
            type="number"
            inputMode="decimal"
            min={activeOption.min}
            step="any"
            value={inputText}
            onFocus={() => setIsFocused(true)}
            onBlur={handleInputBlur}
            onChange={(e) => handleInputChange(e.target.value)}
            aria-label={`Serving amount in ${activeOption.label}`}
            className="w-full min-h-[44px] pl-3.5 pr-16 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-mono tabular-nums font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
          <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-500 dark:text-slate-400">
            {activeOption.id === 'servings' ? 'servings' : activeOption.label}
          </span>
        </div>

        <button
          type="button"
          onClick={() => handleStep(activeOption.step)}
          aria-label={`Increase ${activeOption.label}`}
          className="min-h-[44px] min-w-[44px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center shrink-0 transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Quick Multiplier Presets */}
      <div className="grid grid-cols-4 gap-1.5">
        {PRESET_MULTIPLIERS.map((val) => {
          const isSelected = Math.abs(servings - val) < 0.005;
          return (
            <button
              key={val}
              type="button"
              onClick={() => handlePreset(val)}
              className={`min-h-[38px] rounded-xl text-xs font-mono tabular-nums font-semibold border transition-colors ${
                isSelected
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              {val}×
            </button>
          );
        })}
      </div>

      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
        {equivalentSummary}
      </p>
    </div>
  );
};
