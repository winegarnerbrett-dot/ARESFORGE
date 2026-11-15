import React, { useMemo, useState } from 'react';
import {
  Droplets,
  Loader2,
  Minus,
  Pencil,
  Plus,
  ScanBarcode,
  Search,
  Trash2,
} from 'lucide-react';
import { VERIFIED_WHOLE_FOODS } from '../data/programs';
import {
  deriveMacroPercentagesFromGrams,
  normalizeMacroPercentages,
} from '../lib/nutritionCoach';
import { searchProductsByQuery } from '../lib/openFoodFacts';
import {
  entryToCatalogProduct,
  formatServingCount,
  scaleNutrition,
} from '../lib/servingUtils';
import type {
  DailyMetric,
  FoodCatalogProduct,
  MealType,
  NutritionEntry,
  UserProfile,
} from '../types/fitness';
import { FoodPortionModal } from './FoodPortionModal';
import { MealPlannerPanel } from './MealPlannerPanel';
import { ServingSizeControl } from './ServingSizeControl';

interface NutritionViewProps {
  profile: UserProfile;
  selectedDateKey: string;
  entries: NutritionEntry[];
  metric: DailyMetric;
  onAddFood: (product: FoodCatalogProduct, servings: number, mealType: MealType) => void;
  onUpdateEntry: (entry: NutritionEntry) => void;
  onDeleteEntry: (entryId: string) => void;
  onAdjustWater: (deltaMl: number) => void;
  onOpenBarcodeScanner: (mealType: MealType) => void;
}

const MEALS: Array<{ id: MealType; label: string }> = [
  { id: 'breakfast', label: 'Breakfast' },
  { id: 'lunch', label: 'Lunch' },
  { id: 'dinner', label: 'Dinner' },
  { id: 'snack', label: 'Snacks' },
];

export const NutritionView: React.FC<NutritionViewProps> = ({
  profile,
  selectedDateKey,
  entries,
  metric,
  onAddFood,
  onUpdateEntry,
  onDeleteEntry,
  onAdjustWater,
  onOpenBarcodeScanner,
}) => {
  const [viewMode, setViewMode] = useState<'meal_planner' | 'food_log'>('meal_planner');
  const [activeMeal, setActiveMeal] = useState<MealType>('lunch');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FoodCatalogProduct[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [showManualForm, setShowManualForm] = useState(false);
  const [selectedProductToLog, setSelectedProductToLog] = useState<FoodCatalogProduct | null>(null);
  const [editingEntry, setEditingEntry] = useState<NutritionEntry | null>(null);

  // Manual food entry form state
  const [manualName, setManualName] = useState('');
  const [manualServing, setManualServing] = useState('1 serving');
  const [manualServingsCount, setManualServingsCount] = useState(1);
  const [manualCals, setManualCals] = useState('');
  const [manualProtein, setManualProtein] = useState('');
  const [manualCarbs, setManualCarbs] = useState('');
  const [manualFat, setManualFat] = useState('');

  const dayEntries = useMemo(
    () => entries.filter((e) => e.dateKey === selectedDateKey),
    [entries, selectedDateKey]
  );

  const totals = useMemo(
    () =>
      dayEntries.reduce(
        (acc, e) => ({
          calories: acc.calories + e.calories,
          protein: acc.protein + e.proteinG,
          carbs: acc.carbs + e.carbsG,
          fat: acc.fat + e.fatG,
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0 }
      ),
    [dayEntries]
  );

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearching(true);
    setSearchError(null);
    try {
      const results = await searchProductsByQuery(searchQuery);
      setSearchResults(results);
      if (results.length === 0) {
        setSearchError('No packaged items found for that search. Try whole foods or manual entry.');
      }
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : 'Unable to search Open Food Facts.');
    } finally {
      setSearching(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualName.trim()) return;
    onAddFood(
      {
        id: `manual_${Date.now()}`,
        name: manualName.trim(),
        brand: 'Custom Entry',
        barcode: '',
        servingLabel: manualServing.trim() || '1 serving',
        caloriesPerServing: Math.max(0, Number(manualCals) || 0),
        proteinPerServing: Math.max(0, Number(manualProtein) || 0),
        carbsPerServing: Math.max(0, Number(manualCarbs) || 0),
        fatPerServing: Math.max(0, Number(manualFat) || 0),
        source: 'manual',
      },
      manualServingsCount,
      activeMeal
    );
    setManualName('');
    setManualServing('1 serving');
    setManualServingsCount(1);
    setManualCals('');
    setManualProtein('');
    setManualCarbs('');
    setManualFat('');
    setShowManualForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Header & Scan Barcode CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Nutrition &amp; Hydration
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Scan food and drink barcodes, search packaged items, or log whole foods for {selectedDateKey}
          </p>
        </div>

        <button
          type="button"
          onClick={() => onOpenBarcodeScanner(activeMeal)}
          className="min-h-[48px] px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold flex items-center justify-center gap-2 whitespace-nowrap shrink-0 transition-colors"
        >
          <ScanBarcode className="w-5 h-5" />
          Scan Barcode
        </button>
      </div>

      {/* Macro Summary & Hydration Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 space-y-4">
          <div className="flex items-baseline justify-between">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Daily Energy</p>
              <p className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
                {Math.round(totals.calories)}{' '}
                <span className="text-sm font-normal text-slate-500">
                  / {profile.dailyCalorieGoal} kcal
                </span>
              </p>
            </div>
            <p className="text-xs font-mono font-semibold text-slate-600 dark:text-slate-300">
              {Math.max(0, profile.dailyCalorieGoal - Math.round(totals.calories))} kcal left
            </p>
          </div>

          {(() => {
            const pcts =
              profile.macroProteinPct !== undefined &&
              profile.macroCarbsPct !== undefined &&
              profile.macroFatPct !== undefined
                ? normalizeMacroPercentages({
                    proteinPct: profile.macroProteinPct,
                    carbsPct: profile.macroCarbsPct,
                    fatPct: profile.macroFatPct,
                  })
                : deriveMacroPercentagesFromGrams(
                    profile.dailyProteinGoal,
                    profile.dailyCarbsGoal,
                    profile.dailyFatGoal
                  );
            return (
              <div className="grid grid-cols-3 gap-3">
                {[
                  {
                    label: 'Protein',
                    pct: pcts.proteinPct,
                    val: Math.round(totals.protein),
                    goal: profile.dailyProteinGoal,
                    color: 'bg-blue-600',
                  },
                  {
                    label: 'Carbs',
                    pct: pcts.carbsPct,
                    val: Math.round(totals.carbs),
                    goal: profile.dailyCarbsGoal,
                    color: 'bg-emerald-600',
                  },
                  {
                    label: 'Fat',
                    pct: pcts.fatPct,
                    val: Math.round(totals.fat),
                    goal: profile.dailyFatGoal,
                    color: 'bg-amber-500',
                  },
                ].map((m) => (
                  <div
                    key={m.label}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800 space-y-1.5"
                  >
                    <div className="flex justify-between text-xs gap-1">
                      <span className="text-slate-500 dark:text-slate-400 truncate">
                        {m.label} · <span className="font-mono tabular-nums">{m.pct}%</span>
                      </span>
                      <span className="font-mono tabular-nums font-bold text-slate-900 dark:text-white shrink-0">
                        {m.val}g
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${m.color}`}
                        style={{
                          width: `${m.goal > 0 ? Math.min(100, (m.val / m.goal) * 100) : 0}%`,
                        }}
                      />
                    </div>
                    <p className="text-[11px] font-mono tabular-nums text-slate-400">
                      Goal {m.goal}g ({m.pct}%)
                    </p>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>

        {/* Hydration Card */}
        {(() => {
          const formatLiters = (ml: number) =>
            `${(ml / 1000).toFixed(2).replace(/\.00$/, '').replace(/(\.\d)0$/, '$1')} L`;
          return (
            <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 flex flex-col justify-between gap-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Hydration</p>
                  <p className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-0.5">
                    {formatLiters(metric.waterMl)}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Goal {formatLiters(profile.dailyWaterGoalMl)}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                  <Droplets className="w-5 h-5" />
                </div>
              </div>

              <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-sky-500 transition-all"
                  style={{
                    width: `${Math.min(
                      100,
                      (metric.waterMl / Math.max(1, profile.dailyWaterGoalMl)) * 100
                    )}%`,
                  }}
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => onAdjustWater(-250)}
                  aria-label="Remove 0.25 liters water"
                  className="min-h-[44px] rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-mono font-semibold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-1"
                >
                  <Minus className="w-3.5 h-3.5" />
                  0.25 L
                </button>
                <button
                  type="button"
                  onClick={() => onAdjustWater(250)}
                  className="min-h-[44px] rounded-xl bg-sky-50 hover:bg-sky-100 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 text-xs font-mono font-semibold"
                >
                  +0.25 L
                </button>
                <button
                  type="button"
                  onClick={() => onAdjustWater(500)}
                  className="min-h-[44px] rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-mono font-semibold"
                >
                  +0.5 L
                </button>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Workspace Switcher: Automated Meal Planner vs Daily Food Log */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800">
          <button
            type="button"
            onClick={() => setViewMode('meal_planner')}
            className={`min-h-[40px] px-4 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
              viewMode === 'meal_planner'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Automated Meal Planner
          </button>
          <button
            type="button"
            onClick={() => setViewMode('food_log')}
            className={`min-h-[40px] px-4 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
              viewMode === 'food_log'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Food Log &amp; Search ({dayEntries.length})
          </button>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400">
          {viewMode === 'meal_planner'
            ? 'Plans scale automatically when you adjust calories or macro percentages'
            : `Showing ${dayEntries.length} logged item${dayEntries.length === 1 ? '' : 's'} for ${selectedDateKey}`}
        </p>
      </div>

      {viewMode === 'meal_planner' ? (
        <MealPlannerPanel
          profile={profile}
          selectedDateKey={selectedDateKey}
          dayEntries={dayEntries}
          onAddFood={onAddFood}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Add Food Search + Whole Foods + Manual */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Log Food or Drink</h2>
              <button
                type="button"
                onClick={() => setShowManualForm((s) => !s)}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
              >
                {showManualForm ? 'Back to Search' : 'Manual Entry'}
              </button>
            </div>

            {/* Target Meal Selector */}
            <div className="grid grid-cols-4 gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800">
              {MEALS.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setActiveMeal(m.id)}
                  className={`min-h-[38px] rounded-lg text-xs font-semibold transition-colors ${
                    activeMeal === m.id
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {showManualForm ? (
              <form onSubmit={handleManualSubmit} className="space-y-3">
                <input
                  type="text"
                  required
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  placeholder="Food or drink name"
                  className="w-full min-h-[44px] px-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white"
                />
                <input
                  type="text"
                  value={manualServing}
                  onChange={(e) => setManualServing(e.target.value)}
                  placeholder="Base serving size (e.g. 1 cup, 150 g)"
                  className="w-full min-h-[44px] px-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white"
                />
                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  Nutrition per 1 serving ({manualServing.trim() || '1 serving'}):
                </p>
                <div className="grid grid-cols-2 gap-2.5">
                  <input
                    type="number"
                    min={0}
                    required
                    value={manualCals}
                    onChange={(e) => setManualCals(e.target.value)}
                    placeholder="Calories (kcal)"
                    className="min-h-[44px] px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-mono tabular-nums text-slate-900 dark:text-white"
                  />
                  <input
                    type="number"
                    min={0}
                    step="0.1"
                    value={manualProtein}
                    onChange={(e) => setManualProtein(e.target.value)}
                    placeholder="Protein (g)"
                    className="min-h-[44px] px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-mono tabular-nums text-slate-900 dark:text-white"
                  />
                  <input
                    type="number"
                    min={0}
                    step="0.1"
                    value={manualCarbs}
                    onChange={(e) => setManualCarbs(e.target.value)}
                    placeholder="Carbs (g)"
                    className="min-h-[44px] px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-mono tabular-nums text-slate-900 dark:text-white"
                  />
                  <input
                    type="number"
                    min={0}
                    step="0.1"
                    value={manualFat}
                    onChange={(e) => setManualFat(e.target.value)}
                    placeholder="Fat (g)"
                    className="min-h-[44px] px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-mono tabular-nums text-slate-900 dark:text-white"
                  />
                </div>

                <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                  <ServingSizeControl
                    servingLabel={manualServing.trim() || '1 serving'}
                    servings={manualServingsCount}
                    onChangeServings={setManualServingsCount}
                    unitSystem={profile.unitSystem}
                    compact
                  />
                </div>

                {(() => {
                  const preview = scaleNutrition(
                    {
                      caloriesPerServing: Math.max(0, Number(manualCals) || 0),
                      proteinPerServing: Math.max(0, Number(manualProtein) || 0),
                      carbsPerServing: Math.max(0, Number(manualCarbs) || 0),
                      fatPerServing: Math.max(0, Number(manualFat) || 0),
                    },
                    manualServingsCount
                  );
                  return (
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700 flex items-center justify-between gap-2 text-xs">
                      <span className="text-slate-500 dark:text-slate-400">Total to log</span>
                      <span className="font-mono tabular-nums font-semibold text-slate-900 dark:text-white">
                        {preview.calories} kcal · P {preview.proteinG}g / C {preview.carbsG}g / F{' '}
                        {preview.fatG}g
                      </span>
                    </div>
                  );
                })()}

                <button
                  type="submit"
                  className="w-full min-h-[44px] rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold"
                >
                  Save Entry
                </button>
              </form>
            ) : (
              <>
                <form onSubmit={handleSearch} className="flex gap-2">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search packaged foods (Open Food Facts)..."
                    className="flex-1 min-h-[44px] px-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white"
                  />
                  <button
                    type="submit"
                    disabled={searching || !searchQuery.trim()}
                    aria-label="Search food database"
                    className="min-h-[44px] min-w-[44px] px-3.5 rounded-xl bg-slate-900 dark:bg-blue-600 text-white flex items-center justify-center disabled:opacity-50"
                  >
                    {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  </button>
                </form>

                {searchError && (
                  <p className="text-xs text-amber-700 dark:text-amber-400">{searchError}</p>
                )}

                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    {searchResults.length > 0 ? 'Search Results' : 'Verified Whole Foods (Select to Customize Serving)'}
                  </p>
                  {(searchResults.length > 0 ? searchResults : VERIFIED_WHOLE_FOODS).map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setSelectedProductToLog(item)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setSelectedProductToLog(item);
                        }
                      }}
                      className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100/90 dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-200/70 dark:border-slate-800 flex items-center justify-between gap-3 cursor-pointer transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                          {item.name}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {item.servingLabel} · {item.caloriesPerServing} kcal · P {item.proteinPerServing}g / C{' '}
                          {item.carbsPerServing}g / F {item.fatPerServing}g
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedProductToLog(item);
                        }}
                        aria-label={`Customize serving and add ${item.name} to ${activeMeal}`}
                        className="min-h-[40px] min-w-[40px] rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shrink-0"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right: Daily Meal Log */}
        <div className="lg:col-span-7 space-y-4">
          {MEALS.map((meal) => {
            const mealItems = dayEntries.filter((e) => e.mealType === meal.id);
            const mealCals = Math.round(mealItems.reduce((s, e) => s + e.calories, 0));

            return (
              <div
                key={meal.id}
                className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">{meal.label}</h3>
                    <p className="text-xs font-mono text-slate-500 dark:text-slate-400">
                      {mealCals} kcal · {mealItems.length} item{mealItems.length === 1 ? '' : 's'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onOpenBarcodeScanner(meal.id)}
                    className="min-h-[38px] px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5"
                  >
                    <ScanBarcode className="w-3.5 h-3.5" />
                    Scan
                  </button>
                </div>

                {mealItems.length > 0 && (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800 border-t border-slate-100 dark:border-slate-800">
                    {mealItems.map((entry) => (
                      <div
                        key={entry.id}
                        className="py-2.5 flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                            {entry.name}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                            {formatServingCount(entry.servings)} × {entry.servingLabel} · P {entry.proteinG}g · C{' '}
                            {entry.carbsG}g · F {entry.fatG}g
                            {entry.barcode ? ` · Barcode ${entry.barcode}` : ''}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-sm font-bold font-mono tabular-nums text-slate-900 dark:text-white mr-1">
                            {Math.round(entry.calories)}
                          </span>
                          <button
                            type="button"
                            onClick={() => setEditingEntry(entry)}
                            aria-label={`Edit serving size for ${entry.name}`}
                            className="min-h-[38px] min-w-[38px] rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 flex items-center justify-center"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteEntry(entry.id)}
                            aria-label={`Delete ${entry.name}`}
                            className="min-h-[38px] min-w-[38px] rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center justify-center"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      )}

      {selectedProductToLog && (
        <FoodPortionModal
          product={selectedProductToLog}
          initialServings={1}
          initialMealType={activeMeal}
          unitSystem={profile.unitSystem}
          onConfirm={(servings, mealType) => {
            onAddFood(selectedProductToLog, servings, mealType);
          }}
          onClose={() => setSelectedProductToLog(null)}
        />
      )}

      {editingEntry && (
        <FoodPortionModal
          product={entryToCatalogProduct(editingEntry)}
          initialServings={editingEntry.servings}
          initialMealType={editingEntry.mealType}
          mode="edit"
          unitSystem={profile.unitSystem}
          onConfirm={(nextServings, nextMealType) => {
            const perServing = entryToCatalogProduct(editingEntry);
            const scaled = scaleNutrition(perServing, nextServings);
            onUpdateEntry({
              ...editingEntry,
              mealType: nextMealType,
              servings: Math.min(50, Math.max(0.1, scaled.servings)),
              calories: scaled.calories,
              proteinG: scaled.proteinG,
              carbsG: scaled.carbsG,
              fatG: scaled.fatG,
            });
          }}
          onClose={() => setEditingEntry(null)}
        />
      )}
    </div>
  );
};
