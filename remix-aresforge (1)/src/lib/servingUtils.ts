import type { FoodCatalogProduct, MealType, NutritionEntry } from '../types/fitness';

export interface ParsedServingBase {
  baseAmount: number;
  baseUnit: string;
  isMeasurable: boolean;
}

export interface ServingUnitOption {
  id: 'servings' | 'base' | 'oz' | 'g' | 'fl_oz' | 'ml';
  label: string;
  /** Number of base servings represented by 1 unit of this option */
  servingsPerUnit: number;
  step: number;
  min: number;
}

export interface ScaledNutrition {
  servings: number;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}

const GRAMS_PER_OZ = 28.349523125;
const ML_PER_FL_OZ = 29.5735295625;

function parseNumericToken(token: string): number {
  const trimmed = token.trim();
  if (trimmed.includes('/')) {
    const parts = trimmed.split('/').map((p) => Number(p.trim()));
    if (parts.length === 2 && Number.isFinite(parts[0]) && Number.isFinite(parts[1]) && parts[1] > 0) {
      return parts[0] / parts[1];
    }
  }
  const num = Number(trimmed);
  return Number.isFinite(num) && num > 0 ? num : 1;
}

function normalizeUnit(raw: string): string {
  const lower = raw.trim().toLowerCase();
  if (lower === 'g' || lower === 'gr' || lower === 'gram' || lower === 'grams') return 'g';
  if (lower === 'ml' || lower === 'milliliter' || lower === 'milliliters') return 'ml';
  if (lower === 'oz' || lower === 'ounce' || lower === 'ounces') return 'oz';
  if (lower === 'fl oz' || lower === 'fl. oz' || lower === 'fl_oz' || lower === 'fluid ounce' || lower === 'fluid ounces') {
    return 'fl oz';
  }
  if (lower === 'kg') return 'kg';
  if (lower === 'l' || lower === 'liter' || lower === 'liters') return 'l';
  if (lower === 'mg') return 'mg';
  return lower;
}

/**
 * Extracts a measurable base quantity & unit from a serving label such as:
 * "150 g cooked", "1/2 cup (40 g)", "100 g / 100 ml", "2 large eggs", "1 scoop (30 g)".
 */
export function parseServingLabel(servingLabel: string): ParsedServingBase {
  const text = (servingLabel || '').trim();
  if (!text) {
    return { baseAmount: 1, baseUnit: 'serving', isMeasurable: false };
  }

  // 1. Prefer explicit parenthetical weight/volume e.g. "1/2 cup (40 g)", "1 medium (118 g)"
  const parenMatch = text.match(/\(.*?(\d+(?:\.\d+)?)\s*(g|gr|grams?|ml|fl\s*\.?\s*oz|oz|ounces?|kg|l)\b/i);
  if (parenMatch) {
    const amount = parseNumericToken(parenMatch[1]);
    let unit = normalizeUnit(parenMatch[2]);
    if (unit === 'kg') {
      return { baseAmount: amount * 1000, baseUnit: 'g', isMeasurable: true };
    }
    if (unit === 'l') {
      return { baseAmount: amount * 1000, baseUnit: 'ml', isMeasurable: true };
    }
    return { baseAmount: amount, baseUnit: unit, isMeasurable: true };
  }

  // 2. Match leading weight/volume e.g. "150 g cooked", "100 g / 100 ml", "240 ml", "1.5 oz"
  const weightMatch = text.match(/^(\d+(?:\.\d+)?|\d+\s*\/\s*\d+)\s*(g|gr|grams?|ml|fl\s*\.?\s*oz|oz|ounces?|kg|l)\b/i);
  if (weightMatch) {
    const amount = parseNumericToken(weightMatch[1]);
    const unit = normalizeUnit(weightMatch[2]);
    if (unit === 'kg') {
      return { baseAmount: amount * 1000, baseUnit: 'g', isMeasurable: true };
    }
    if (unit === 'l') {
      return { baseAmount: amount * 1000, baseUnit: 'ml', isMeasurable: true };
    }
    return { baseAmount: amount, baseUnit: unit, isMeasurable: true };
  }

  // 3. Match countable household units e.g. "2 large eggs", "1/2 cup", "1 scoop", "2 tbsp"
  const countMatch = text.match(
    /^(\d+(?:\.\d+)?|\d+\s*\/\s*\d+)\s+(?:(?:large|medium|small|whole|level|heaping|packed|cooked|raw|dry)\s+)*([a-zA-Z]+)/i
  );
  if (countMatch) {
    const amount = parseNumericToken(countMatch[1]);
    const unit = countMatch[2].toLowerCase();
    if (unit !== 'serving' && unit !== 'servings') {
      return { baseAmount: amount, baseUnit: unit, isMeasurable: true };
    }
  }

  return { baseAmount: 1, baseUnit: 'serving', isMeasurable: false };
}

export function getServingUnitOptions(servingLabel: string): {
  parsed: ParsedServingBase;
  options: ServingUnitOption[];
} {
  const parsed = parseServingLabel(servingLabel);
  const options: ServingUnitOption[] = [
    {
      id: 'servings',
      label: 'Servings',
      servingsPerUnit: 1,
      step: 0.25,
      min: 0.05,
    },
  ];

  if (!parsed.isMeasurable || parsed.baseAmount <= 0) {
    return { parsed, options };
  }

  if (parsed.baseUnit === 'g') {
    options.push({
      id: 'g',
      label: 'g',
      servingsPerUnit: 1 / parsed.baseAmount,
      step: 5,
      min: 1,
    });
    options.push({
      id: 'oz',
      label: 'oz',
      servingsPerUnit: GRAMS_PER_OZ / parsed.baseAmount,
      step: 0.5,
      min: 0.1,
    });
  } else if (parsed.baseUnit === 'oz') {
    options.push({
      id: 'oz',
      label: 'oz',
      servingsPerUnit: 1 / parsed.baseAmount,
      step: 0.5,
      min: 0.1,
    });
    options.push({
      id: 'g',
      label: 'g',
      servingsPerUnit: 1 / (parsed.baseAmount * GRAMS_PER_OZ),
      step: 5,
      min: 1,
    });
  } else if (parsed.baseUnit === 'ml') {
    options.push({
      id: 'ml',
      label: 'ml',
      servingsPerUnit: 1 / parsed.baseAmount,
      step: 10,
      min: 1,
    });
    options.push({
      id: 'fl_oz',
      label: 'fl oz',
      servingsPerUnit: ML_PER_FL_OZ / parsed.baseAmount,
      step: 0.5,
      min: 0.1,
    });
  } else if (parsed.baseUnit === 'fl oz') {
    options.push({
      id: 'fl_oz',
      label: 'fl oz',
      servingsPerUnit: 1 / parsed.baseAmount,
      step: 0.5,
      min: 0.1,
    });
    options.push({
      id: 'ml',
      label: 'ml',
      servingsPerUnit: 1 / (parsed.baseAmount * ML_PER_FL_OZ),
      step: 10,
      min: 1,
    });
  } else {
    options.push({
      id: 'base',
      label: parsed.baseUnit,
      servingsPerUnit: 1 / parsed.baseAmount,
      step: 0.5,
      min: 0.1,
    });
  }

  return { parsed, options };
}

export function scaleNutrition(
  product: Pick<
    FoodCatalogProduct,
    'caloriesPerServing' | 'proteinPerServing' | 'carbsPerServing' | 'fatPerServing'
  >,
  servings: number
): ScaledNutrition {
  const safeMult = Number.isFinite(servings) && servings > 0 ? servings : 0;
  return {
    servings: Math.round(safeMult * 1000) / 1000,
    calories: Math.round(product.caloriesPerServing * safeMult),
    proteinG: Math.round(product.proteinPerServing * safeMult * 10) / 10,
    carbsG: Math.round(product.carbsPerServing * safeMult * 10) / 10,
    fatG: Math.round(product.fatPerServing * safeMult * 10) / 10,
  };
}

export function formatServingCount(servings: number): string {
  if (!Number.isFinite(servings)) return '1';
  return String(Number(servings.toFixed(2)));
}

export function formatUnitQuantity(value: number, unitId: ServingUnitOption['id']): string {
  if (!Number.isFinite(value)) return '0';
  if (unitId === 'g' || unitId === 'ml') {
    return String(Math.round(value * 10) / 10);
  }
  return String(Math.round(value * 100) / 100);
}

/**
 * Formats a concise human-readable serving summary for a given multiplier.
 * Example: "225 g (1.5×)" or "1.5 servings"
 */
export function describePortion(servingLabel: string, servings: number): string {
  const parsed = parseServingLabel(servingLabel);
  if (parsed.isMeasurable) {
    const qty = Math.round(parsed.baseAmount * servings * 10) / 10;
    return `${qty} ${parsed.baseUnit}`;
  }
  return `${formatServingCount(servings)} × ${servingLabel}`;
}

/**
 * Normalizes a new NutritionEntry so that even extreme custom serving multipliers
 * (< 0.1 or > 50, such as logging 5 g of a 100 g reference item) preserve exact
 * scaled calories and macros while remaining 100% compatible with Firestore rules
 * (`0.1 <= servings <= 50`).
 */
export function buildNormalizedNutritionEntry(params: {
  id: string;
  dateKey: string;
  mealType: MealType;
  product: FoodCatalogProduct;
  servings: number;
  customPortionLabel?: string;
}): NutritionEntry {
  const { id, dateKey, mealType, product, servings, customPortionLabel } = params;
  const safeServings = Number.isFinite(servings) && servings > 0 ? servings : 1;
  const scaled = scaleNutrition(product, safeServings);

  const needsNormalization = safeServings < 0.1 || safeServings > 50;
  const normalizedLabel = needsNormalization
    ? (customPortionLabel || describePortion(product.servingLabel, safeServings)).slice(0, 60) ||
      '1 custom serving'
    : product.servingLabel.trim().slice(0, 60) || '1 serving';

  return {
    id,
    dateKey,
    mealType,
    name: product.name,
    brand: product.brand,
    barcode: product.barcode,
    servingLabel: normalizedLabel,
    servings: needsNormalization ? 1 : Math.round(safeServings * 1000) / 1000,
    calories: scaled.calories,
    proteinG: scaled.proteinG,
    carbsG: scaled.carbsG,
    fatG: scaled.fatG,
    source: product.source,
  };
}

/**
 * Reconstructs per-serving values from an already-logged NutritionEntry so its
 * serving size can be adjusted accurately.
 */
export function entryToCatalogProduct(entry: NutritionEntry): FoodCatalogProduct {
  const divisor = entry.servings > 0 ? entry.servings : 1;
  return {
    id: entry.id,
    name: entry.name,
    brand: entry.brand,
    barcode: entry.barcode,
    servingLabel: entry.servingLabel,
    caloriesPerServing: entry.calories / divisor,
    proteinPerServing: entry.proteinG / divisor,
    carbsPerServing: entry.carbsG / divisor,
    fatPerServing: entry.fatG / divisor,
    source: entry.source,
  };
}
