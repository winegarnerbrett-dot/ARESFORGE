import React, { useState } from 'react';
import { Check, X } from 'lucide-react';
import { scaleNutrition } from '../lib/servingUtils';
import type { FoodCatalogProduct, MealType, UnitSystem } from '../types/fitness';
import { ServingSizeControl } from './ServingSizeControl';

interface FoodPortionModalProps {
  product: FoodCatalogProduct;
  initialServings?: number;
  initialMealType: MealType;
  mode?: 'create' | 'edit';
  unitSystem?: UnitSystem;
  onConfirm: (servings: number, mealType: MealType) => void;
  onClose: () => void;
}

const MEAL_OPTIONS: Array<{ id: MealType; label: string }> = [
  { id: 'breakfast', label: 'Breakfast' },
  { id: 'lunch', label: 'Lunch' },
  { id: 'dinner', label: 'Dinner' },
  { id: 'snack', label: 'Snack' },
];

export const FoodPortionModal: React.FC<FoodPortionModalProps> = ({
  product,
  initialServings = 1,
  initialMealType,
  mode = 'create',
  unitSystem,
  onConfirm,
  onClose,
}) => {
  const [servings, setServings] = useState<number>(initialServings > 0 ? initialServings : 1);
  const [mealType, setMealType] = useState<MealType>(initialMealType);

  const scaled = scaleNutrition(product, servings);
  const minServings = mode === 'edit' ? 0.1 : 0.02;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/75 backdrop-blur-sm p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={mode === 'edit' ? 'Edit food serving size' : 'Customize food serving size'}
    >
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-h-[92vh] overflow-y-auto">
        <div className="w-10 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mt-3 sm:hidden" />

        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {mode === 'edit' ? 'Adjust Serving Size' : 'Customize Serving Size'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Calories and macros adjust automatically to your portion
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close portion modal"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Food Summary */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-start gap-3.5">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                referrerPolicy="no-referrer"
                className="w-14 h-14 rounded-xl object-cover bg-white shrink-0 border border-slate-200"
              />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-base shrink-0">
                {product.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {product.brand || 'Food Item'}
                {product.barcode ? ` · Barcode ${product.barcode}` : ''}
              </p>
              <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                {product.name}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-mono tabular-nums">
                1 serving ({product.servingLabel}) · {Math.round(product.caloriesPerServing)} kcal
              </p>
            </div>
          </div>

          {/* Live Scaled Macro Preview */}
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Calories</p>
              <p className="text-base font-bold font-mono tabular-nums text-slate-900 dark:text-white">
                {scaled.calories}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Protein</p>
              <p className="text-base font-bold font-mono tabular-nums text-blue-600 dark:text-blue-400">
                {scaled.proteinG}g
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Carbs</p>
              <p className="text-base font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
                {scaled.carbsG}g
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Fat</p>
              <p className="text-base font-bold font-mono tabular-nums text-amber-600 dark:text-amber-400">
                {scaled.fatG}g
              </p>
            </div>
          </div>

          {/* Customizable Serving Size Control */}
          <ServingSizeControl
            servingLabel={product.servingLabel}
            servings={servings}
            onChangeServings={setServings}
            minServings={minServings}
            maxServings={50}
            unitSystem={unitSystem}
          />

          {/* Meal Slot Selector */}
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
              Meal Slot
            </label>
            <div className="grid grid-cols-4 gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800">
              {MEAL_OPTIONS.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMealType(m.id)}
                  className={`min-h-[38px] rounded-lg text-xs font-semibold transition-colors ${
                    mealType === m.id
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2.5 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[48px] px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                onConfirm(servings, mealType);
                onClose();
              }}
              className="flex-1 min-h-[48px] rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <Check className="w-4 h-4" />
              {mode === 'edit'
                ? `Save Changes · ${scaled.calories} kcal`
                : `Add to ${mealType.charAt(0).toUpperCase() + mealType.slice(1)} · ${scaled.calories} kcal`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
