import React, { useEffect, useState } from 'react';
import {
  ArrowDownRight,
  ArrowUpRight,
  Check,
  Minus,
  Scale,
  SlidersHorizontal,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import {
  ACTIVITY_LEVEL_OPTIONS,
  NUTRITION_GOAL_OPTIONS,
  macrosFromPercentages,
  type MacroPercentages,
  type NutritionRecommendation,
} from '../lib/nutritionCoach';
import type {
  ActivityLevel,
  BiologicalSex,
  NutritionGoal,
  UserProfile,
} from '../types/fitness';
import { MacroPercentageEditor } from './MacroPercentageEditor';

interface AdaptiveNutritionCardProps {
  profile: UserProfile;
  recommendation: NutritionRecommendation;
  onSaveProfile: (next: UserProfile) => void;
  onQuickLogWeight: () => void;
}

function formatHeightDisplay(heightCm: number, isImperial: boolean): string {
  if (!isImperial) return `${Math.round(heightCm)} cm`;
  const totalInches = Math.round(heightCm / 2.54);
  const feet = Math.floor(totalInches / 12);
  const inches = totalInches % 12;
  return `${feet}'${inches}"`;
}

export const AdaptiveNutritionCard: React.FC<AdaptiveNutritionCardProps> = ({
  profile,
  recommendation,
  onSaveProfile,
  onQuickLogWeight,
}) => {
  const isImperial = profile.unitSystem === 'imperial';
  const weightUnit = isImperial ? 'lbs' : 'kg';
  const toDisplayWeight = (kg: number) =>
    isImperial ? Math.round(kg * 2.20462 * 10) / 10 : Math.round(kg * 10) / 10;
  const toSignedRate = (kgPerWeek: number) => {
    const val = isImperial ? kgPerWeek * 2.20462 : kgPerWeek;
    const rounded = Math.round(val * 10) / 10;
    const prefix = rounded > 0 ? '+' : '';
    return `${prefix}${rounded.toFixed(1)} ${weightUnit}/wk`;
  };

  const [showEditor, setShowEditor] = useState(false);
  const [showMacroEditor, setShowMacroEditor] = useState(false);
  const [appliedFlash, setAppliedFlash] = useState(false);

  // Editor state synced with profile
  const [heightCmInput, setHeightCmInput] = useState(String(Math.round(profile.heightCm || 175)));
  const [heightFeet, setHeightFeet] = useState(
    String(Math.floor(Math.round((profile.heightCm || 175) / 2.54) / 12))
  );
  const [heightInches, setHeightInches] = useState(
    String(Math.round((profile.heightCm || 175) / 2.54) % 12)
  );
  const [ageInput, setAgeInput] = useState(String(Math.round(profile.age || 30)));
  const [targetWeightInput, setTargetWeightInput] = useState(
    String(toDisplayWeight(profile.targetWeightKg))
  );

  useEffect(() => {
    const cm = Math.round(profile.heightCm || 175);
    const totalIn = Math.round(cm / 2.54);
    setHeightCmInput(String(cm));
    setHeightFeet(String(Math.floor(totalIn / 12)));
    setHeightInches(String(totalIn % 12));
    setAgeInput(String(Math.round(profile.age || 30)));
    setTargetWeightInput(String(toDisplayWeight(profile.targetWeightKg)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile.heightCm, profile.age, profile.targetWeightKg, profile.unitSystem]);

  const handleApplyTargets = () => {
    onSaveProfile({
      ...profile,
      dailyCalorieGoal: recommendation.recommendedCalories,
      dailyProteinGoal: recommendation.macros.proteinG,
      dailyCarbsGoal: recommendation.macros.carbsG,
      dailyFatGoal: recommendation.macros.fatG,
      macroMode: recommendation.macroMode,
      macroProteinPct: recommendation.macros.proteinPct,
      macroCarbsPct: recommendation.macros.carbsPct,
      macroFatPct: recommendation.macros.fatPct,
    });
    setAppliedFlash(true);
    window.setTimeout(() => setAppliedFlash(false), 2400);
  };

  const handleChangeMacroPercentages = (next: MacroPercentages) => {
    const activeCalorieTarget = profile.dailyCalorieGoal || recommendation.recommendedCalories;
    const syncedCurrentGrams = macrosFromPercentages(activeCalorieTarget, next);
    onSaveProfile({
      ...profile,
      macroMode: 'custom',
      macroProteinPct: next.proteinPct,
      macroCarbsPct: next.carbsPct,
      macroFatPct: next.fatPct,
      dailyProteinGoal: syncedCurrentGrams.proteinG,
      dailyCarbsGoal: syncedCurrentGrams.carbsG,
      dailyFatGoal: syncedCurrentGrams.fatG,
    });
  };

  const handleResetMacrosToRecommended = () => {
    const rec = recommendation.recommendedMacros;
    const usingRecommendedCalories = Math.abs(profile.dailyCalorieGoal - recommendation.recommendedCalories) <= 15;
    const syncedCurrentGrams = usingRecommendedCalories
      ? rec
      : macrosFromPercentages(profile.dailyCalorieGoal, rec);
    onSaveProfile({
      ...profile,
      macroMode: 'recommended',
      macroProteinPct: rec.proteinPct,
      macroCarbsPct: rec.carbsPct,
      macroFatPct: rec.fatPct,
      dailyProteinGoal: syncedCurrentGrams.proteinG,
      dailyCarbsGoal: syncedCurrentGrams.carbsG,
      dailyFatGoal: syncedCurrentGrams.fatG,
    });
  };

  const handleSelectGoal = (goalId: NutritionGoal) => {
    onSaveProfile({
      ...profile,
      nutritionGoal: goalId,
    });
  };

  const handleSelectActivity = (activityId: ActivityLevel) => {
    onSaveProfile({
      ...profile,
      activityLevel: activityId,
    });
  };

  const handleSelectSex = (sex: BiologicalSex) => {
    onSaveProfile({
      ...profile,
      biologicalSex: sex,
    });
  };

  const handleSaveBiometrics = (e: React.FormEvent) => {
    e.preventDefault();
    let nextHeightCm = Number(heightCmInput) || 175;
    if (isImperial) {
      const ft = Math.max(3, Math.min(8, Number(heightFeet) || 5));
      const inc = Math.max(0, Math.min(11, Number(heightInches) || 0));
      nextHeightCm = Math.round((ft * 12 + inc) * 2.54);
    }
    nextHeightCm = Math.max(100, Math.min(250, Math.round(nextHeightCm)));
    const nextAge = Math.max(13, Math.min(110, Math.round(Number(ageInput) || 30)));
    const rawTarget = Number(targetWeightInput);
    const nextTargetKg =
      rawTarget > 20
        ? Math.max(25, Math.min(350, Math.round((isImperial ? rawTarget / 2.20462 : rawTarget) * 10) / 10))
        : profile.targetWeightKg;

    onSaveProfile({
      ...profile,
      heightCm: nextHeightCm,
      age: nextAge,
      targetWeightKg: nextTargetKg,
    });
    setShowEditor(false);
  };

  const {
    bmr,
    tdee,
    trendAdjustmentCalories,
    recommendedCalories,
    deltaFromCurrentGoal,
    macroMode,
    macros,
    recommendedMacros,
    goalOption,
    activityOption,
    weightKg,
    targetWeightKg,
    gapToGoalKg,
    weeklyTrend,
    observedActivity,
    reasoning,
    alreadyApplied,
  } = recommendation;

  const toneStyles: Record<
    typeof weeklyTrend.statusTone,
    { text: string; icon: React.ReactNode }
  > = {
    positive: {
      text: 'text-emerald-700 dark:text-emerald-400',
      icon: <Check className="w-4 h-4 shrink-0" />,
    },
    adjust: {
      text: 'text-blue-700 dark:text-blue-400',
      icon:
        trendAdjustmentCalories < 0 ? (
          <ArrowDownRight className="w-4 h-4 shrink-0" />
        ) : (
          <ArrowUpRight className="w-4 h-4 shrink-0" />
        ),
    },
    caution: {
      text: 'text-amber-700 dark:text-amber-400',
      icon: <Scale className="w-4 h-4 shrink-0" />,
    },
    neutral: {
      text: 'text-slate-600 dark:text-slate-300',
      icon: <Minus className="w-4 h-4 shrink-0" />,
    },
  };

  const tone = toneStyles[weeklyTrend.statusTone];

  // Build SVG coordinates for the 14-point weight trend chart
  const chartPoints = weeklyTrend.points;
  const chartValues = [...chartPoints.map((p) => p.weightKg), targetWeightKg];
  const minVal = Math.min(...chartValues) - 1.2;
  const maxVal = Math.max(...chartValues) + 1.2;
  const spanVal = Math.max(1, maxVal - minVal);
  const svgW = 300;
  const svgH = 96;
  const padX = 10;
  const padY = 12;
  const plotW = svgW - padX * 2;
  const plotH = svgH - padY * 2;

  const toY = (kg: number) => padY + plotH - ((kg - minVal) / spanVal) * plotH;
  const targetY = toY(targetWeightKg);
  const svgCoords = chartPoints.map((pt, idx) => {
    const x =
      chartPoints.length === 1
        ? svgW / 2
        : padX + (idx / Math.max(1, chartPoints.length - 1)) * plotW;
    const y = toY(pt.weightKg);
    return { ...pt, x, y };
  });
  const polylinePoints = svgCoords.map((c) => `${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(' ');

  const absGapDisplay = Math.abs(toDisplayWeight(Math.abs(gapToGoalKg)));
  const gapSummary =
    Math.abs(gapToGoalKg) <= 0.3
      ? 'At goal weight'
      : gapToGoalKg < 0
      ? `${absGapDisplay} ${weightUnit} above goal`
      : `${absGapDisplay} ${weightUnit} to gain`;

  const suggestedActOption = observedActivity.suggestedActivityId
    ? ACTIVITY_LEVEL_OPTIONS.find((a) => a.id === observedActivity.suggestedActivityId)
    : null;
  const showActivityNudge =
    suggestedActOption &&
    suggestedActOption.id !== activityOption.id &&
    Math.abs(suggestedActOption.multiplier - activityOption.multiplier) >= 0.15;

  return (
    <section
      aria-label="Adaptive Calorie and Macro Recommendations"
      className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 space-y-5"
    >
      {/* Header & Single-Line Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Adaptive Calorie &amp; Macro Coach
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
            {goalOption.label} · {activityOption.label} · {toDisplayWeight(weightKg)} {weightUnit} ·{' '}
            {formatHeightDisplay(profile.heightCm || 175, isImperial)} · {profile.age || 30} yrs
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setShowEditor((s) => !s)}
            className="min-h-[44px] px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            {showEditor ? 'Close Stats' : 'Edit Stats & Goal'}
          </button>

          <button
            type="button"
            onClick={handleApplyTargets}
            disabled={alreadyApplied && !appliedFlash}
            className={`min-h-[44px] px-4 rounded-xl text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors ${
              alreadyApplied || appliedFlash
                ? 'bg-emerald-600/10 text-emerald-700 dark:text-emerald-400 cursor-default'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            <Check className="w-3.5 h-3.5" />
            {appliedFlash
              ? 'Targets Applied'
              : alreadyApplied
              ? 'Applied to Goals'
              : 'Apply Targets'}
          </button>
        </div>
      </div>

      {/* Inline Biometrics, Activity & Goal Customizer */}
      {showEditor && (
        <div className="border-t border-b border-slate-100 dark:border-slate-800 py-4 space-y-4">
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
              Training &amp; Nutrition Goal
            </p>
            <div className="flex flex-wrap gap-1.5">
              {NUTRITION_GOAL_OPTIONS.map((g) => {
                const active = goalOption.id === g.id;
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => handleSelectGoal(g.id)}
                    className={`min-h-[40px] px-3.5 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
                      active
                        ? 'bg-slate-900 text-white dark:bg-blue-600'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {g.shortLabel}
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {goalOption.description}
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
              Weekly Activity Level
            </p>
            <div className="flex flex-wrap gap-1.5">
              {ACTIVITY_LEVEL_OPTIONS.map((act) => {
                const active = activityOption.id === act.id;
                return (
                  <button
                    key={act.id}
                    type="button"
                    onClick={() => handleSelectActivity(act.id)}
                    className={`min-h-[40px] px-3.5 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
                      active
                        ? 'bg-slate-900 text-white dark:bg-blue-600'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {act.shortLabel}
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {activityOption.description}
            </p>
          </div>

          <form
            onSubmit={handleSaveBiometrics}
            className="grid grid-cols-2 sm:grid-cols-5 gap-3 items-end pt-1"
          >
            {isImperial ? (
              <>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                    Height (ft)
                  </label>
                  <input
                    type="number"
                    min={3}
                    max={8}
                    value={heightFeet}
                    onChange={(e) => setHeightFeet(e.target.value)}
                    className="w-full min-h-[42px] px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-mono tabular-nums text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                    Height (in)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={11}
                    value={heightInches}
                    onChange={(e) => setHeightInches(e.target.value)}
                    className="w-full min-h-[42px] px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-mono tabular-nums text-slate-900 dark:text-white"
                  />
                </div>
              </>
            ) : (
              <div className="col-span-2">
                <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                  Height (cm)
                </label>
                <input
                  type="number"
                  min={100}
                  max={250}
                  value={heightCmInput}
                  onChange={(e) => setHeightCmInput(e.target.value)}
                  className="w-full min-h-[42px] px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-mono tabular-nums text-slate-900 dark:text-white"
                />
              </div>
            )}

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Age
              </label>
              <input
                type="number"
                min={13}
                max={110}
                value={ageInput}
                onChange={(e) => setAgeInput(e.target.value)}
                className="w-full min-h-[42px] px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-mono tabular-nums text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Goal Weight ({weightUnit})
              </label>
              <input
                type="number"
                step="0.1"
                min={40}
                max={600}
                value={targetWeightInput}
                onChange={(e) => setTargetWeightInput(e.target.value)}
                className="w-full min-h-[42px] px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-mono tabular-nums text-slate-900 dark:text-white"
              />
            </div>

            <button
              type="submit"
              className="col-span-2 sm:col-span-1 min-h-[42px] px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold whitespace-nowrap shrink-0 transition-colors"
            >
              Save Stats
            </button>
          </form>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              BMR Profile:
            </span>
            {([
              { id: 'male', label: 'Male' },
              { id: 'female', label: 'Female' },
              { id: 'neutral', label: 'Neutral' },
            ] as Array<{ id: BiologicalSex; label: string }>).map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => handleSelectSex(s.id)}
                className={`min-h-[34px] px-3 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 ${
                  (profile.biologicalSex || 'neutral') === s.id
                    ? 'bg-slate-900 text-white dark:bg-blue-600'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Two-Column Adaptive Targets & Weekly Weight Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Recommended Calorie & Macro Split */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Recommended Daily Intake
              </p>
              <div className="flex items-baseline gap-2.5 mt-0.5">
                <span className="text-3xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
                  {recommendedCalories.toLocaleString()}
                </span>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  kcal / day
                </span>
                {Math.abs(deltaFromCurrentGoal) >= 15 && (
                  <span
                    className={`text-xs font-mono tabular-nums font-semibold ${
                      deltaFromCurrentGoal > 0
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-blue-600 dark:text-blue-400'
                    }`}
                  >
                    ({deltaFromCurrentGoal > 0 ? `+${deltaFromCurrentGoal}` : deltaFromCurrentGoal} vs
                    current {profile.dailyCalorieGoal})
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
              <span>
                BMR <strong className="font-mono tabular-nums text-slate-800 dark:text-slate-200">{bmr}</strong>
              </span>
              <span aria-hidden="true">·</span>
              <span>
                Est. TDEE{' '}
                <strong className="font-mono tabular-nums text-slate-800 dark:text-slate-200">
                  {tdee}
                </strong>
              </span>
              {trendAdjustmentCalories !== 0 && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>
                    Trend adj{' '}
                    <strong className="font-mono tabular-nums text-slate-800 dark:text-slate-200">
                      {trendAdjustmentCalories > 0
                        ? `+${trendAdjustmentCalories}`
                        : trendAdjustmentCalories}{' '}
                      kcal
                    </strong>
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Macro Distribution Strip & Percentage Controls */}
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                {macroMode === 'custom'
                  ? 'Custom Macro Split'
                  : 'Recommended Macro Split'}
              </span>
              <div className="flex items-center gap-3">
                {macroMode === 'custom' && (
                  <button
                    type="button"
                    onClick={handleResetMacrosToRecommended}
                    className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:underline whitespace-nowrap"
                  >
                    Use Recommended ({recommendedMacros.proteinPct}/{recommendedMacros.carbsPct}/
                    {recommendedMacros.fatPct}%)
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowMacroEditor((v) => !v)}
                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline whitespace-nowrap"
                >
                  {showMacroEditor ? 'Hide % Sliders' : 'Adjust Macro %'}
                </button>
              </div>
            </div>

            <div className="h-2.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex">
              <div
                className="h-full bg-blue-600 transition-all duration-150"
                style={{ width: `${macros.proteinPct}%` }}
                title={`Protein ${macros.proteinPct}%`}
              />
              <div
                className="h-full bg-emerald-600 transition-all duration-150"
                style={{ width: `${macros.carbsPct}%` }}
                title={`Carbs ${macros.carbsPct}%`}
              />
              <div
                className="h-full bg-amber-500 transition-all duration-150"
                style={{ width: `${macros.fatPct}%` }}
                title={`Fat ${macros.fatPct}%`}
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Protein · <span className="font-mono tabular-nums font-semibold">{macros.proteinPct}%</span>
                </p>
                <p className="text-lg font-bold font-mono tabular-nums text-blue-600 dark:text-blue-400 mt-0.5">
                  {macros.proteinG}g
                </p>
                <p className="text-[11px] font-mono tabular-nums text-slate-400">
                  Current {profile.dailyProteinGoal}g
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Carbs · <span className="font-mono tabular-nums font-semibold">{macros.carbsPct}%</span>
                </p>
                <p className="text-lg font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {macros.carbsG}g
                </p>
                <p className="text-[11px] font-mono tabular-nums text-slate-400">
                  Current {profile.dailyCarbsGoal}g
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Fat · <span className="font-mono tabular-nums font-semibold">{macros.fatPct}%</span>
                </p>
                <p className="text-lg font-bold font-mono tabular-nums text-amber-600 dark:text-amber-400 mt-0.5">
                  {macros.fatG}g
                </p>
                <p className="text-[11px] font-mono tabular-nums text-slate-400">
                  Current {profile.dailyFatGoal}g
                </p>
              </div>
            </div>

            {macroMode === 'custom' && (
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                Built-in coach recommendation: {recommendedMacros.proteinPct}% Protein (
                {recommendedMacros.proteinG}g) · {recommendedMacros.carbsPct}% Carbs (
                {recommendedMacros.carbsG}g) · {recommendedMacros.fatPct}% Fat (
                {recommendedMacros.fatG}g)
              </p>
            )}

            {showMacroEditor && (
              <MacroPercentageEditor
                calories={recommendedCalories}
                percentages={{
                  proteinPct: macros.proteinPct,
                  carbsPct: macros.carbsPct,
                  fatPct: macros.fatPct,
                }}
                recommendedMacros={recommendedMacros}
                goalLabel={goalOption.label}
                isCustom={macroMode === 'custom'}
                onChangePercentages={handleChangeMacroPercentages}
                onResetToRecommended={handleResetMacrosToRecommended}
              />
            )}
          </div>

          {/* Reasoning & Activity Calibration Hint */}
          <div className="space-y-1.5 pt-1">
            <div className={`flex items-center gap-1.5 text-xs font-semibold ${tone.text}`}>
              {tone.icon}
              <span>{weeklyTrend.statusLabel}</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {reasoning}
            </p>
            {showActivityNudge && suggestedActOption && (
              <div className="pt-1 flex flex-wrap items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                <span>
                  Recent log ({observedActivity.weeklyWorkouts} workouts/wk
                  {observedActivity.avgSteps > 0
                    ? ` · ${observedActivity.avgSteps.toLocaleString()} avg steps/day`
                    : ''}
                  ) aligns with <strong>{suggestedActOption.label}</strong>.
                </span>
                <button
                  type="button"
                  onClick={() => handleSelectActivity(suggestedActOption.id)}
                  className="font-semibold text-blue-600 dark:text-blue-400 hover:underline whitespace-nowrap shrink-0"
                >
                  Use {suggestedActOption.shortLabel}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right: Weekly Weight Trend vs Goal Weight */}
        <div className="lg:col-span-5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                Weekly Weight Trend vs. Goal
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {gapSummary} · Target {toDisplayWeight(targetWeightKg)} {weightUnit}
              </p>
            </div>

            <div className="text-right shrink-0">
              {weeklyTrend.hasTrendData && weeklyTrend.weeklyRateKg !== null ? (
                <div className="flex items-center justify-end gap-1 text-sm font-bold font-mono tabular-nums text-slate-900 dark:text-white">
                  {weeklyTrend.weeklyRateKg < 0 ? (
                    <TrendingDown className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  ) : weeklyTrend.weeklyRateKg > 0 ? (
                    <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  ) : (
                    <Minus className="w-4 h-4 text-slate-400" />
                  )}
                  <span>{toSignedRate(weeklyTrend.weeklyRateKg)}</span>
                </div>
              ) : (
                <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                  Needs 2+ weigh-ins
                </span>
              )}
              {weeklyTrend.current7DayAvgKg !== null && (
                <p className="text-[11px] font-mono tabular-nums text-slate-500 dark:text-slate-400">
                  7d avg: {toDisplayWeight(weeklyTrend.current7DayAvgKg)} {weightUnit}
                </p>
              )}
            </div>
          </div>

          {/* Trend Sparkline vs Dashed Goal Weight */}
          {chartPoints.length >= 2 ? (
            <div className="space-y-1">
              <svg
                viewBox={`0 0 ${svgW} ${svgH}`}
                className="w-full h-24 overflow-visible"
                role="img"
                aria-label="Weight trend compared to goal weight"
              >
                {/* Goal Weight Dashed Reference Line */}
                <line
                  x1={padX}
                  x2={svgW - padX}
                  y1={targetY}
                  y2={targetY}
                  stroke="currentColor"
                  strokeDasharray="4 4"
                  strokeWidth="1.5"
                  className="text-emerald-600/70 dark:text-emerald-400/70"
                />
                <text
                  x={svgW - padX}
                  y={Math.max(10, targetY - 4)}
                  textAnchor="end"
                  className="fill-emerald-700 dark:fill-emerald-400 text-[9px] font-mono"
                >
                  Goal {toDisplayWeight(targetWeightKg)} {weightUnit}
                </text>

                {/* Trend Polyline */}
                <polyline
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={polylinePoints}
                  className="text-blue-600 dark:text-blue-400"
                />

                {svgCoords.map((pt, idx) => (
                  <circle
                    key={pt.dateKey}
                    cx={pt.x}
                    cy={pt.y}
                    r={idx === svgCoords.length - 1 ? 4 : 2.75}
                    className={
                      idx === svgCoords.length - 1
                        ? 'fill-blue-600 dark:fill-blue-400 stroke-white dark:stroke-slate-900 stroke-2'
                        : 'fill-blue-500/80 dark:fill-blue-400/80'
                    }
                  />
                ))}
              </svg>

              <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400">
                <span>
                  {chartPoints[0].label}: {toDisplayWeight(chartPoints[0].weightKg)} {weightUnit}
                </span>
                <span>
                  {chartPoints[chartPoints.length - 1].label}:{' '}
                  {toDisplayWeight(chartPoints[chartPoints.length - 1].weightKg)} {weightUnit}
                </span>
              </div>
            </div>
          ) : (
            <div className="py-5 text-center space-y-2">
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Log weigh-ins on 2 or more days to plot your weekly trend against your{' '}
                <span className="font-mono font-semibold">
                  {toDisplayWeight(targetWeightKg)} {weightUnit}
                </span>{' '}
                goal.
              </p>
              <button
                type="button"
                onClick={onQuickLogWeight}
                className="min-h-[40px] px-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 whitespace-nowrap"
              >
                Log Weight for Selected Day
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
