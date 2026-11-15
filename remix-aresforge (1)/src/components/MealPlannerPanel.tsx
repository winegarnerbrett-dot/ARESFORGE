import React, { useMemo, useState } from 'react';
import {
  Check,
  Plus,
  RefreshCw,
  Repeat2,
  SlidersHorizontal,
} from 'lucide-react';
import {
  DIETARY_OPTIONS,
  generateAutomatedMealPlan,
  getNextMealTemplateSwap,
  type DietaryPreference,
  type PlannedMeal,
  type PlannerMode,
} from '../lib/mealPlanner';
import type {
  FoodCatalogProduct,
  MealType,
  NutritionEntry,
  UserProfile,
} from '../types/fitness';
import { FoodPortionModal } from './FoodPortionModal';

interface MealPlannerPanelProps {
  profile: UserProfile;
  selectedDateKey: string;
  dayEntries: NutritionEntry[];
  onAddFood: (product: FoodCatalogProduct, servings: number, mealType: MealType) => void;
}

const MEAL_TYPE_LABELS: Record<MealType, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snack',
};

function formatServingsMultiplier(servings: number): string {
  const rounded = Math.round(servings * 100) / 100;
  return `${rounded}×`;
}

export const MealPlannerPanel: React.FC<MealPlannerPanelProps> = ({
  profile,
  selectedDateKey,
  dayEntries,
  onAddFood,
}) => {
  const [dietary, setDietary] = useState<DietaryPreference>('balanced');
  const [mode, setMode] = useState<PlannerMode>('full_day');
  const [variationSeed, setVariationSeed] = useState(0);
  const [lockedTemplates, setLockedTemplates] = useState<Partial<Record<MealType, string>>>({});
  const [loggedIds, setLoggedIds] = useState<Record<string, boolean>>({});
  const [logAllDone, setLogAllDone] = useState(false);
  const [customizingMeal, setCustomizingMeal] = useState<PlannedMeal | null>(null);

  const plan = useMemo(
    () =>
      generateAutomatedMealPlan({
        profile,
        dayEntries,
        dietary,
        mode,
        variationSeed,
        lockedTemplates,
      }),
    [profile, dayEntries, dietary, mode, variationSeed, lockedTemplates]
  );

  const handleRegenerate = () => {
    setLockedTemplates({});
    setLoggedIds({});
    setLogAllDone(false);
    setVariationSeed((s) => s + 1);
  };

  const handleSelectDiet = (nextDiet: DietaryPreference) => {
    setDietary(nextDiet);
    setLockedTemplates({});
    setLoggedIds({});
    setLogAllDone(false);
  };

  const handleSelectMode = (nextMode: PlannerMode) => {
    setMode(nextMode);
    setLoggedIds({});
    setLogAllDone(false);
  };

  const handleSwapMeal = (meal: PlannedMeal) => {
    const nextTemplate = getNextMealTemplateSwap(meal.template.id, meal.mealType, dietary);
    if (!nextTemplate) return;
    setLockedTemplates((prev) => ({
      ...prev,
      [meal.mealType]: nextTemplate.id,
    }));
    setLoggedIds((prev) => {
      const copy = { ...prev };
      delete copy[meal.template.id];
      return copy;
    });
    setLogAllDone(false);
  };

  const handleLogSingleMeal = (meal: PlannedMeal) => {
    onAddFood(meal.catalogProduct, meal.servings, meal.mealType);
    setLoggedIds((prev) => ({
      ...prev,
      [meal.template.id]: true,
    }));
  };

  const handleLogEntirePlan = () => {
    for (const meal of plan.meals) {
      if (!loggedIds[meal.template.id]) {
        onAddFood(meal.catalogProduct, meal.servings, meal.mealType);
      }
    }
    const nextLogged: Record<string, boolean> = {};
    for (const meal of plan.meals) {
      nextLogged[meal.template.id] = true;
    }
    setLoggedIds(nextLogged);
    setLogAllDone(true);
    window.setTimeout(() => setLogAllDone(false), 2600);
  };

  const activeDietOption = DIETARY_OPTIONS.find((d) => d.id === dietary) || DIETARY_OPTIONS[0];
  const unloggedMealsCount = plan.meals.filter((m) => !loggedIds[m.template.id]).length;

  const calDelta = plan.plannedTotals.calories - plan.target.calories;
  const calDeltaText =
    calDelta === 0 ? 'On target' : calDelta > 0 ? `+${calDelta} kcal` : `${calDelta} kcal`;

  return (
    <section
      aria-label="Automated Meal Planner"
      className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 space-y-5"
    >
      {/* Header & Top Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
            Automated Meal Plan
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Balanced portions calibrated to your {profile.dailyCalorieGoal.toLocaleString()} kcal ·{' '}
            {profile.dailyProteinGoal}g P / {profile.dailyCarbsGoal}g C / {profile.dailyFatGoal}g F
            targets for {selectedDateKey}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleRegenerate}
            className="min-h-[44px] px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Regenerate
          </button>

          <button
            type="button"
            onClick={handleLogEntirePlan}
            disabled={plan.meals.length === 0 || unloggedMealsCount === 0}
            className={`min-h-[44px] px-4 rounded-xl text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors ${
              logAllDone || (plan.meals.length > 0 && unloggedMealsCount === 0)
                ? 'bg-emerald-600/10 text-emerald-700 dark:text-emerald-400 cursor-default'
                : 'bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50'
            }`}
          >
            {logAllDone || (plan.meals.length > 0 && unloggedMealsCount === 0) ? (
              <>
                <Check className="w-4 h-4" />
                Plan Logged
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Log All Meals ({unloggedMealsCount})
              </>
            )}
          </button>
        </div>
      </div>

      {/* Controls: Plan Scope & Dietary Preference */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-1 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 self-start">
          <button
            type="button"
            onClick={() => handleSelectMode('full_day')}
            className={`min-h-[38px] px-3.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
              mode === 'full_day'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Full Day Plan
          </button>
          <button
            type="button"
            onClick={() => handleSelectMode('remaining_today')}
            className={`min-h-[38px] px-3.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
              mode === 'remaining_today'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Fill Remaining Today
          </button>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
          {DIETARY_OPTIONS.map((opt) => {
            const active = dietary === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleSelectDiet(opt.id)}
                className={`min-h-[38px] px-3 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
                  active
                    ? 'bg-slate-900 text-white dark:bg-blue-600'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Planned Totals vs Goal Comparison */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4">
        <div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Planned Energy · {calDeltaText}
          </p>
          <p className="text-lg font-bold font-mono tabular-nums text-slate-900 dark:text-white mt-0.5">
            {plan.plannedTotals.calories.toLocaleString()}{' '}
            <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
              / {plan.target.calories.toLocaleString()} kcal
            </span>
          </p>
        </div>
        <div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">Protein</p>
          <p className="text-lg font-bold font-mono tabular-nums text-blue-600 dark:text-blue-400 mt-0.5">
            {Math.round(plan.plannedTotals.proteinG)}g{' '}
            <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
              / {plan.target.proteinG}g
            </span>
          </p>
        </div>
        <div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">Carbs</p>
          <p className="text-lg font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400 mt-0.5">
            {Math.round(plan.plannedTotals.carbsG)}g{' '}
            <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
              / {plan.target.carbsG}g
            </span>
          </p>
        </div>
        <div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">Fat</p>
          <p className="text-lg font-bold font-mono tabular-nums text-amber-600 dark:text-amber-400 mt-0.5">
            {Math.round(plan.plannedTotals.fatG)}g{' '}
            <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
              / {plan.target.fatG}g
            </span>
          </p>
        </div>
      </div>

      {/* Planned Meals List */}
      {plan.allMealsAlreadyLogged ? (
        <div className="py-8 text-center space-y-2 border-t border-slate-100 dark:border-slate-800">
          <p className="text-sm font-semibold text-slate-900 dark:text-white">
            All four meal slots already have entries for {selectedDateKey}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Switch to Full Day Plan to preview a complete menu, or adjust entries in the Daily Food Log.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => handleSelectMode('full_day')}
              className="min-h-[40px] px-4 rounded-xl bg-slate-900 dark:bg-blue-600 text-white text-xs font-semibold"
            >
              View Full Day Plan
            </button>
          </div>
        </div>
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-slate-800 border-t border-slate-100 dark:border-slate-800">
          {plan.meals.map((meal) => {
            const isLogged = Boolean(loggedIds[meal.template.id]);
            return (
              <div
                key={`${meal.mealType}-${meal.template.id}`}
                className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-semibold text-slate-900 dark:text-slate-200">
                      {MEAL_TYPE_LABELS[meal.mealType]}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums">
                      {formatServingsMultiplier(meal.servings)} ({meal.template.baseServingLabel})
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                    {meal.template.name}
                  </h3>

                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {meal.template.ingredientsSummary}
                  </p>
                </div>

                <div className="flex flex-wrap sm:flex-nowrap items-center justify-between md:justify-end gap-4 shrink-0">
                  {/* Macro Readout */}
                  <div className="text-left md:text-right">
                    <p className="text-base font-bold font-mono tabular-nums text-slate-900 dark:text-white">
                      {meal.calories} kcal
                    </p>
                    <p className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400 mt-0.5">
                      P {Math.round(meal.proteinG)}g · C {Math.round(meal.carbsG)}g · F{' '}
                      {Math.round(meal.fatG)}g
                    </p>
                  </div>

                  {/* Per-Meal Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setCustomizingMeal(meal)}
                      aria-label={`Adjust serving size for ${meal.template.name}`}
                      className="min-h-[40px] px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors"
                    >
                      <SlidersHorizontal className="w-3.5 h-3.5" />
                      Portion
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSwapMeal(meal)}
                      aria-label={`Swap ${MEAL_TYPE_LABELS[meal.mealType]} meal`}
                      className="min-h-[40px] px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors"
                    >
                      <Repeat2 className="w-3.5 h-3.5" />
                      Swap
                    </button>

                    <button
                      type="button"
                      onClick={() => handleLogSingleMeal(meal)}
                      disabled={isLogged}
                      className={`min-h-[40px] px-3.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors ${
                        isLogged
                          ? 'bg-emerald-600/10 text-emerald-700 dark:text-emerald-400 cursor-default'
                          : 'bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white'
                      }`}
                    >
                      {isLogged ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          Logged
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          Add to Log
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Diet Filter Description & Note */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
        <span>
          {activeDietOption.label}: {activeDietOption.description}
        </span>
        {mode === 'remaining_today' && plan.skippedLoggedMeals.length > 0 && (
          <span>
            Already logged:{' '}
            {plan.skippedLoggedMeals.map((m) => MEAL_TYPE_LABELS[m]).join(', ')}
          </span>
        )}
      </div>

      {customizingMeal && (
        <FoodPortionModal
          product={customizingMeal.catalogProduct}
          initialServings={customizingMeal.servings}
          initialMealType={customizingMeal.mealType}
          unitSystem={profile.unitSystem}
          onConfirm={(chosenServings, chosenMealType) => {
            onAddFood(customizingMeal.catalogProduct, chosenServings, chosenMealType);
            setLoggedIds((prev) => ({
              ...prev,
              [customizingMeal.template.id]: true,
            }));
          }}
          onClose={() => setCustomizingMeal(null)}
        />
      )}
    </section>
  );
};
