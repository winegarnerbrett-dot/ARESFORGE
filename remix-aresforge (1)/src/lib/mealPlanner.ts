import type {
  FoodCatalogProduct,
  MealType,
  NutritionEntry,
  UserProfile,
} from '../types/fitness';

export type DietaryPreference =
  | 'balanced'
  | 'high_protein'
  | 'vegetarian'
  | 'vegan'
  | 'low_carb'
  | 'dairy_free';

export type PlannerMode = 'full_day' | 'remaining_today';

export interface DietaryOption {
  id: DietaryPreference;
  label: string;
  description: string;
}

export const DIETARY_OPTIONS: DietaryOption[] = [
  {
    id: 'balanced',
    label: 'Balanced',
    description: 'Whole-food mix of poultry, fish, eggs, dairy, grains, and produce',
  },
  {
    id: 'high_protein',
    label: 'High Protein',
    description: 'Prioritizes lean protein density to maximize muscle recovery',
  },
  {
    id: 'vegetarian',
    label: 'Vegetarian',
    description: 'Meat-free meals built around eggs, yogurt, tofu, beans, and grains',
  },
  {
    id: 'vegan',
    label: 'Vegan',
    description: '100% plant-based protein from tofu, tempeh, legumes, oats, and nuts',
  },
  {
    id: 'low_carb',
    label: 'Low Carb',
    description: 'Emphasizes lean protein, healthy fats, and fibrous greens',
  },
  {
    id: 'dairy_free',
    label: 'Dairy Free',
    description: 'Excludes milk, yogurt, whey, and cheese',
  },
];

export interface MealTemplate {
  id: string;
  mealType: MealType;
  name: string;
  ingredientsSummary: string;
  baseServingLabel: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  tags: {
    vegetarian?: boolean;
    vegan?: boolean;
    dairyFree?: boolean;
    lowCarb?: boolean;
    highProtein?: boolean;
  };
}

export const MEAL_TEMPLATES: MealTemplate[] = [
  // Breakfast
  {
    id: 'mp-bf-yogurt-oats',
    mealType: 'breakfast',
    name: 'Greek Yogurt Bowl with Rolled Oats & Berries',
    ingredientsSummary: '220g nonfat Greek yogurt, 40g rolled oats, 75g blueberries, 15g chia',
    baseServingLabel: '1 bowl (350 g)',
    calories: 380,
    proteinG: 29,
    carbsG: 48,
    fatG: 7,
    tags: { vegetarian: true, highProtein: true },
  },
  {
    id: 'mp-bf-egg-scramble-toast',
    mealType: 'breakfast',
    name: 'Egg & Egg-White Scramble with Sourdough & Avocado',
    ingredientsSummary: '2 whole eggs, 120g egg whites, 1 slice sourdough, 1/2 avocado, spinach',
    baseServingLabel: '1 plate (310 g)',
    calories: 430,
    proteinG: 29,
    carbsG: 28,
    fatG: 22,
    tags: { vegetarian: true, dairyFree: true, highProtein: true },
  },
  {
    id: 'mp-bf-proats-whey',
    mealType: 'breakfast',
    name: 'Protein Oatmeal with Banana & Almonds',
    ingredientsSummary: '50g rolled oats, 1 scoop whey isolate, 1 medium banana, 14g almonds',
    baseServingLabel: '1 bowl (340 g)',
    calories: 470,
    proteinG: 34,
    carbsG: 62,
    fatG: 10,
    tags: { vegetarian: true, highProtein: true },
  },
  {
    id: 'mp-bf-salmon-eggs-avocado',
    mealType: 'breakfast',
    name: 'Smoked Salmon, Whole Eggs & Avocado Plate',
    ingredientsSummary: '3 large eggs, 75g smoked salmon, 1/2 avocado, sautéed greens',
    baseServingLabel: '1 plate (290 g)',
    calories: 455,
    proteinG: 34,
    carbsG: 7,
    fatG: 32,
    tags: { dairyFree: true, lowCarb: true, highProtein: true },
  },
  {
    id: 'mp-bf-tofu-scramble',
    mealType: 'breakfast',
    name: 'Spiced Tofu Scramble with Sweet Potato Hash',
    ingredientsSummary: '200g firm tofu, 150g roasted sweet potato, bell pepper, olive oil',
    baseServingLabel: '1 bowl (380 g)',
    calories: 410,
    proteinG: 25,
    carbsG: 41,
    fatG: 16,
    tags: { vegetarian: true, vegan: true, dairyFree: true },
  },
  {
    id: 'mp-bf-soy-oats-pb',
    mealType: 'breakfast',
    name: 'Plant-Protein Overnight Oats with Peanut Butter',
    ingredientsSummary: '50g rolled oats, 1 scoop pea protein, 200ml soy milk, 1 tbsp peanut butter',
    baseServingLabel: '1 jar (340 g)',
    calories: 465,
    proteinG: 32,
    carbsG: 47,
    fatG: 16,
    tags: { vegetarian: true, vegan: true, dairyFree: true, highProtein: true },
  },
  {
    id: 'mp-bf-turkey-egg-skillet',
    mealType: 'breakfast',
    name: 'Lean Turkey & Egg White Breakfast Skillet',
    ingredientsSummary: '110g lean ground turkey, 150g egg whites, peppers, olive oil',
    baseServingLabel: '1 skillet (300 g)',
    calories: 325,
    proteinG: 41,
    carbsG: 8,
    fatG: 13,
    tags: { dairyFree: true, lowCarb: true, highProtein: true },
  },

  // Lunch
  {
    id: 'mp-ln-chicken-rice-avocado',
    mealType: 'lunch',
    name: 'Grilled Chicken, Jasmine Rice & Avocado Bowl',
    ingredientsSummary: '165g chicken breast, 1 cup cooked jasmine rice, 1/2 avocado, steamed broccoli',
    baseServingLabel: '1 bowl (430 g)',
    calories: 590,
    proteinG: 54,
    carbsG: 52,
    fatG: 17,
    tags: { dairyFree: true, highProtein: true },
  },
  {
    id: 'mp-ln-tuna-quinoa-greens',
    mealType: 'lunch',
    name: 'Mediterranean Tuna, Quinoa & Chickpea Salad',
    ingredientsSummary: '150g yellowfin tuna, 130g cooked quinoa, 70g chickpeas, cucumber, olive oil',
    baseServingLabel: '1 bowl (410 g)',
    calories: 515,
    proteinG: 45,
    carbsG: 47,
    fatG: 15,
    tags: { dairyFree: true, highProtein: true },
  },
  {
    id: 'mp-ln-turkey-cauli-greens',
    mealType: 'lunch',
    name: 'Herb Turkey Breast, Cauliflower Rice & Olive Greens',
    ingredientsSummary: '175g roasted turkey breast, 180g cauliflower rice, avocado, vinaigrette',
    baseServingLabel: '1 plate (400 g)',
    calories: 430,
    proteinG: 50,
    carbsG: 13,
    fatG: 19,
    tags: { dairyFree: true, lowCarb: true, highProtein: true },
  },
  {
    id: 'mp-ln-cottage-lentil-bowl',
    mealType: 'lunch',
    name: 'Roasted Lentil, Quinoa & Cottage Cheese Harvest Bowl',
    ingredientsSummary: '140g cooked lentils, 120g quinoa, 140g low-fat cottage cheese, greens',
    baseServingLabel: '1 bowl (440 g)',
    calories: 520,
    proteinG: 36,
    carbsG: 62,
    fatG: 13,
    tags: { vegetarian: true, highProtein: true },
  },
  {
    id: 'mp-ln-tempeh-edamame-rice',
    mealType: 'lunch',
    name: 'Sesame Tempeh, Edamame & Brown Rice Bowl',
    ingredientsSummary: '150g marinated tempeh, 85g shelled edamame, 150g brown rice, bok choy',
    baseServingLabel: '1 bowl (440 g)',
    calories: 575,
    proteinG: 39,
    carbsG: 58,
    fatG: 20,
    tags: { vegetarian: true, vegan: true, dairyFree: true, highProtein: true },
  },
  {
    id: 'mp-ln-tofu-zucchini-pesto',
    mealType: 'lunch',
    name: 'Crisp Tofu, Zucchini Noodles & Walnut Herb Bowl',
    ingredientsSummary: '200g extra-firm tofu, 220g spiralized zucchini, roasted peppers, walnuts',
    baseServingLabel: '1 bowl (440 g)',
    calories: 420,
    proteinG: 28,
    carbsG: 14,
    fatG: 28,
    tags: { vegetarian: true, vegan: true, dairyFree: true, lowCarb: true },
  },
  {
    id: 'mp-ln-bison-sweet-potato',
    mealType: 'lunch',
    name: 'Lean Grass-Fed Beef & Sweet Potato Power Plate',
    ingredientsSummary: '160g 93% lean beef, 180g roasted sweet potato, asparagus, 1 tsp olive oil',
    baseServingLabel: '1 plate (420 g)',
    calories: 540,
    proteinG: 43,
    carbsG: 42,
    fatG: 21,
    tags: { dairyFree: true, highProtein: true },
  },

  // Dinner
  {
    id: 'mp-dn-salmon-potato-greens',
    mealType: 'dinner',
    name: 'Wild Salmon Fillet, Sweet Potato & Asparagus',
    ingredientsSummary: '165g Atlantic salmon, 175g baked sweet potato, steamed asparagus, lemon',
    baseServingLabel: '1 plate (430 g)',
    calories: 560,
    proteinG: 39,
    carbsG: 41,
    fatG: 25,
    tags: { dairyFree: true, highProtein: true },
  },
  {
    id: 'mp-dn-steak-quinoa-broccoli',
    mealType: 'dinner',
    name: 'Sirloin Steak, Quinoa & Charred Broccolini',
    ingredientsSummary: '170g grilled top sirloin, 140g cooked quinoa, broccolini, olive oil',
    baseServingLabel: '1 plate (400 g)',
    calories: 575,
    proteinG: 49,
    carbsG: 36,
    fatG: 25,
    tags: { dairyFree: true, highProtein: true },
  },
  {
    id: 'mp-dn-chicken-zoodles-avocado',
    mealType: 'dinner',
    name: 'Garlic Herb Chicken, Zucchini Noodles & Avocado',
    ingredientsSummary: '185g chicken breast, 220g zucchini noodles, cherry tomatoes, 1/2 avocado',
    baseServingLabel: '1 plate (450 g)',
    calories: 440,
    proteinG: 56,
    carbsG: 14,
    fatG: 17,
    tags: { dairyFree: true, lowCarb: true, highProtein: true },
  },
  {
    id: 'mp-dn-shrimp-pasta-marinara',
    mealType: 'dinner',
    name: 'Seared Shrimp & Chickpea Pasta Marinara',
    ingredientsSummary: '180g shrimp, 75g dry chickpea pasta, marinara sauce, spinach',
    baseServingLabel: '1 bowl (390 g)',
    calories: 485,
    proteinG: 47,
    carbsG: 52,
    fatG: 8,
    tags: { dairyFree: true, highProtein: true },
  },
  {
    id: 'mp-dn-chickpea-tofu-curry',
    mealType: 'dinner',
    name: 'Coconut Chickpea, Tofu & Basmati Curry',
    ingredientsSummary: '150g firm tofu, 120g chickpeas, 140g basmati rice, light coconut tomato sauce',
    baseServingLabel: '1 bowl (460 g)',
    calories: 565,
    proteinG: 29,
    carbsG: 72,
    fatG: 18,
    tags: { vegetarian: true, vegan: true, dairyFree: true },
  },
  {
    id: 'mp-dn-paneer-egg-veggie-bowl',
    mealType: 'dinner',
    name: 'Grilled Halloumi, Lentil & Roasted Veggie Plate',
    ingredientsSummary: '90g grilled halloumi, 150g cooked lentils, roasted zucchini & bell peppers',
    baseServingLabel: '1 plate (380 g)',
    calories: 520,
    proteinG: 33,
    carbsG: 34,
    fatG: 27,
    tags: { vegetarian: true, highProtein: true },
  },
  {
    id: 'mp-dn-egg-avocado-greens',
    mealType: 'dinner',
    name: 'Savory Tofu & Avocado Roasted Broccoli Stir-Fry',
    ingredientsSummary: '220g baked tofu, 200g broccoli & mushrooms, 1/2 avocado, tamari sesame glaze',
    baseServingLabel: '1 bowl (440 g)',
    calories: 430,
    proteinG: 30,
    carbsG: 18,
    fatG: 27,
    tags: { vegetarian: true, vegan: true, dairyFree: true, lowCarb: true },
  },

  // Snacks
  {
    id: 'mp-sn-whey-banana',
    mealType: 'snack',
    name: 'Whey Isolate Shake & Medium Banana',
    ingredientsSummary: '1 scoop whey protein isolate in water, 1 medium banana',
    baseServingLabel: '1 shake + banana',
    calories: 220,
    proteinG: 26,
    carbsG: 28,
    fatG: 1,
    tags: { vegetarian: true, highProtein: true },
  },
  {
    id: 'mp-sn-yogurt-almonds',
    mealType: 'snack',
    name: 'Greek Yogurt Cup & Raw Almonds',
    ingredientsSummary: '170g nonfat Greek yogurt, 20g raw almonds',
    baseServingLabel: '1 cup + almonds',
    calories: 215,
    proteinG: 22,
    carbsG: 10,
    fatG: 10,
    tags: { vegetarian: true, lowCarb: true, highProtein: true },
  },
  {
    id: 'mp-sn-edamame-almonds',
    mealType: 'snack',
    name: 'Steamed Sea-Salt Edamame & Almonds',
    ingredientsSummary: '150g shelled edamame, 18g raw almonds',
    baseServingLabel: '1 snack cup (168 g)',
    calories: 280,
    proteinG: 21,
    carbsG: 16,
    fatG: 15,
    tags: { vegetarian: true, vegan: true, dairyFree: true, lowCarb: true, highProtein: true },
  },
  {
    id: 'mp-sn-plant-shake-apple',
    mealType: 'snack',
    name: 'Plant Protein Shake & Apple Slices',
    ingredientsSummary: '1 scoop pea/rice protein isolate, 1 medium apple',
    baseServingLabel: '1 shake + apple',
    calories: 215,
    proteinG: 23,
    carbsG: 27,
    fatG: 2,
    tags: { vegetarian: true, vegan: true, dairyFree: true, highProtein: true },
  },
  {
    id: 'mp-sn-turkey-rollups-almonds',
    mealType: 'snack',
    name: 'Roasted Turkey Roll-Ups & Raw Almonds',
    ingredientsSummary: '100g sliced oven-roasted turkey breast, cucumber, 20g almonds',
    baseServingLabel: '1 snack box (170 g)',
    calories: 235,
    proteinG: 27,
    carbsG: 5,
    fatG: 12,
    tags: { dairyFree: true, lowCarb: true, highProtein: true },
  },
];

export interface PlannedMeal {
  template: MealTemplate;
  mealType: MealType;
  servings: number;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  catalogProduct: FoodCatalogProduct;
}

export interface GeneratedMealPlan {
  mode: PlannerMode;
  dietary: DietaryPreference;
  target: {
    calories: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
  };
  plannedTotals: {
    calories: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
  };
  meals: PlannedMeal[];
  skippedLoggedMeals: MealType[];
  allMealsAlreadyLogged: boolean;
}

const MEAL_ORDER: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack'];

const MEAL_WEIGHTS: Record<MealType, number> = {
  breakfast: 0.25,
  lunch: 0.32,
  dinner: 0.3,
  snack: 0.13,
};

const SERVING_STEPS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.25, 2.5];

export function filterTemplatesForDiet(
  mealType: MealType,
  dietary: DietaryPreference
): MealTemplate[] {
  const slotMatches = MEAL_TEMPLATES.filter((t) => t.mealType === mealType);
  const filtered = slotMatches.filter((t) => {
    if (dietary === 'vegan') return Boolean(t.tags.vegan);
    if (dietary === 'vegetarian') return Boolean(t.tags.vegetarian);
    if (dietary === 'dairy_free') return Boolean(t.tags.dairyFree);
    if (dietary === 'low_carb') return Boolean(t.tags.lowCarb);
    if (dietary === 'high_protein') return Boolean(t.tags.highProtein);
    return true;
  });
  return filtered.length > 0 ? filtered : slotMatches;
}

function buildPlannedMeal(template: MealTemplate, servings: number): PlannedMeal {
  const calories = Math.round(template.calories * servings);
  const proteinG = Math.round(template.proteinG * servings * 10) / 10;
  const carbsG = Math.round(template.carbsG * servings * 10) / 10;
  const fatG = Math.round(template.fatG * servings * 10) / 10;

  return {
    template,
    mealType: template.mealType,
    servings,
    calories,
    proteinG,
    carbsG,
    fatG,
    catalogProduct: {
      id: `${template.id}_${servings}`,
      name: template.name,
      brand: 'ARESFORGE Meal Plan',
      barcode: '',
      servingLabel: template.baseServingLabel,
      caloriesPerServing: template.calories,
      proteinPerServing: template.proteinG,
      carbsPerServing: template.carbsG,
      fatPerServing: template.fatG,
      source: 'manual',
    },
  };
}

function scorePlanError(
  meals: Array<{ template: MealTemplate; servings: number }>,
  target: { calories: number; proteinG: number; carbsG: number; fatG: number }
): number {
  let cals = 0;
  let prot = 0;
  let carbs = 0;
  let fat = 0;
  for (const m of meals) {
    cals += m.template.calories * m.servings;
    prot += m.template.proteinG * m.servings;
    carbs += m.template.carbsG * m.servings;
    fat += m.template.fatG * m.servings;
  }

  const calDen = Math.max(200, target.calories);
  const protDen = Math.max(20, target.proteinG);
  const carbDen = Math.max(20, target.carbsG);
  const fatDen = Math.max(15, target.fatG);

  const calErr = Math.abs(cals - target.calories) / calDen;
  const protErr = Math.abs(prot - target.proteinG) / protDen;
  const carbErr = Math.abs(carbs - target.carbsG) / carbDen;
  const fatErr = Math.abs(fat - target.fatG) / fatDen;

  // Weight calories and protein highest, while keeping carbs & fat tightly aligned
  return calErr * 2.2 + protErr * 1.9 + carbErr * 1.2 + fatErr * 1.2;
}

function optimizeServings(
  chosenTemplates: MealTemplate[],
  target: { calories: number; proteinG: number; carbsG: number; fatG: number }
): PlannedMeal[] {
  if (chosenTemplates.length === 0) return [];

  const totalBaseCals = chosenTemplates.reduce((s, t) => s + t.calories, 0);
  const idealScale = totalBaseCals > 0 ? target.calories / totalBaseCals : 1;

  // Start each meal near the closest discrete serving step to the global calorie scale
  const closestStep = (val: number) =>
    SERVING_STEPS.reduce((best, step) =>
      Math.abs(step - val) < Math.abs(best - val) ? step : best
    );

  const state = chosenTemplates.map((template) => ({
    template,
    servings: closestStep(idealScale),
  }));

  // Coordinate-descent passes to minimize combined calorie & macro deviation
  let currentScore = scorePlanError(state, target);
  for (let pass = 0; pass < 4; pass++) {
    let improved = false;
    for (let i = 0; i < state.length; i++) {
      const original = state[i].servings;
      let bestStep = original;
      for (const candidateStep of SERVING_STEPS) {
        state[i].servings = candidateStep;
        const candidateScore = scorePlanError(state, target);
        if (candidateScore + 1e-6 < currentScore) {
          currentScore = candidateScore;
          bestStep = candidateStep;
          improved = true;
        }
      }
      state[i].servings = bestStep;
    }
    if (!improved) break;
  }

  return state.map((s) => buildPlannedMeal(s.template, s.servings));
}

export function generateAutomatedMealPlan(params: {
  profile: UserProfile;
  dayEntries: NutritionEntry[];
  dietary: DietaryPreference;
  mode: PlannerMode;
  variationSeed: number;
  lockedTemplates?: Partial<Record<MealType, string>>;
}): GeneratedMealPlan {
  const { profile, dayEntries, dietary, mode, variationSeed, lockedTemplates = {} } = params;

  const loggedByMeal = new Set<MealType>(dayEntries.map((e) => e.mealType));
  const loggedTotals = dayEntries.reduce(
    (acc, e) => ({
      calories: acc.calories + e.calories,
      proteinG: acc.proteinG + e.proteinG,
      carbsG: acc.carbsG + e.carbsG,
      fatG: acc.fatG + e.fatG,
    }),
    { calories: 0, proteinG: 0, carbsG: 0, fatG: 0 }
  );

  const skippedLoggedMeals: MealType[] =
    mode === 'remaining_today' ? MEAL_ORDER.filter((m) => loggedByMeal.has(m)) : [];

  let activeSlots: MealType[] =
    mode === 'remaining_today'
      ? MEAL_ORDER.filter((m) => !loggedByMeal.has(m))
      : [...MEAL_ORDER];

  const allMealsAlreadyLogged = mode === 'remaining_today' && activeSlots.length === 0;
  if (allMealsAlreadyLogged) {
    return {
      mode,
      dietary,
      target: {
        calories: Math.max(0, Math.round(profile.dailyCalorieGoal - loggedTotals.calories)),
        proteinG: Math.max(0, Math.round(profile.dailyProteinGoal - loggedTotals.proteinG)),
        carbsG: Math.max(0, Math.round(profile.dailyCarbsGoal - loggedTotals.carbsG)),
        fatG: Math.max(0, Math.round(profile.dailyFatGoal - loggedTotals.fatG)),
      },
      plannedTotals: { calories: 0, proteinG: 0, carbsG: 0, fatG: 0 },
      meals: [],
      skippedLoggedMeals,
      allMealsAlreadyLogged: true,
    };
  }

  const target =
    mode === 'remaining_today'
      ? {
          calories: Math.max(150, Math.round(profile.dailyCalorieGoal - loggedTotals.calories)),
          proteinG: Math.max(10, Math.round(profile.dailyProteinGoal - loggedTotals.proteinG)),
          carbsG: Math.max(0, Math.round(profile.dailyCarbsGoal - loggedTotals.carbsG)),
          fatG: Math.max(0, Math.round(profile.dailyFatGoal - loggedTotals.fatG)),
        }
      : {
          calories: Math.max(800, Math.round(profile.dailyCalorieGoal)),
          proteinG: Math.max(0, Math.round(profile.dailyProteinGoal)),
          carbsG: Math.max(0, Math.round(profile.dailyCarbsGoal)),
          fatG: Math.max(0, Math.round(profile.dailyFatGoal)),
        };

  // Pick templates for each active slot aligned to target macro ratio + variation seed
  const targetTotalMacroCals = Math.max(
    1,
    target.proteinG * 4 + target.carbsG * 4 + target.fatG * 9
  );
  const desiredProtShare = (target.proteinG * 4) / targetTotalMacroCals;
  const desiredCarbShare = (target.carbsG * 4) / targetTotalMacroCals;
  const desiredFatShare = (target.fatG * 9) / targetTotalMacroCals;

  const weightSum = activeSlots.reduce((s, slot) => s + MEAL_WEIGHTS[slot], 0) || 1;
  const usedNames = new Set<string>();
  const chosenTemplates: MealTemplate[] = [];

  for (let slotIdx = 0; slotIdx < activeSlots.length; slotIdx++) {
    const slot = activeSlots[slotIdx];
    const pool = filterTemplatesForDiet(slot, dietary);

    const lockedId = lockedTemplates[slot];
    const lockedMatch = lockedId ? pool.find((t) => t.id === lockedId) : undefined;
    if (lockedMatch) {
      chosenTemplates.push(lockedMatch);
      usedNames.add(lockedMatch.name);
      continue;
    }

    const slotIdealCals = target.calories * (MEAL_WEIGHTS[slot] / weightSum);

    // Rank pool by macro-ratio alignment + calorie proximity
    const ranked = [...pool].sort((a, b) => {
      const aTotal = Math.max(1, a.proteinG * 4 + a.carbsG * 4 + a.fatG * 9);
      const bTotal = Math.max(1, b.proteinG * 4 + b.carbsG * 4 + b.fatG * 9);
      const aRatioErr =
        Math.abs((a.proteinG * 4) / aTotal - desiredProtShare) * 1.6 +
        Math.abs((a.carbsG * 4) / aTotal - desiredCarbShare) +
        Math.abs((a.fatG * 9) / aTotal - desiredFatShare) +
        Math.abs(a.calories - slotIdealCals) / Math.max(200, slotIdealCals) * 0.4;
      const bRatioErr =
        Math.abs((b.proteinG * 4) / bTotal - desiredProtShare) * 1.6 +
        Math.abs((b.carbsG * 4) / bTotal - desiredCarbShare) +
        Math.abs((b.fatG * 9) / bTotal - desiredFatShare) +
        Math.abs(b.calories - slotIdealCals) / Math.max(200, slotIdealCals) * 0.4;
      return aRatioErr - bRatioErr;
    });

    // Cycle among the top candidates using variationSeed so "Regenerate" surfaces fresh meals
    const topK = ranked.slice(0, Math.min(3, ranked.length));
    const rotatedIdx = (variationSeed + slotIdx) % topK.length;
    const picked =
      topK.find((_, idx) => idx === rotatedIdx && !usedNames.has(topK[idx].name)) ||
      topK[rotatedIdx] ||
      ranked[0];

    if (picked) {
      chosenTemplates.push(picked);
      usedNames.add(picked.name);
    }
  }

  const meals = optimizeServings(chosenTemplates, target);
  const plannedTotals = meals.reduce(
    (acc, m) => ({
      calories: acc.calories + m.calories,
      proteinG: Math.round((acc.proteinG + m.proteinG) * 10) / 10,
      carbsG: Math.round((acc.carbsG + m.carbsG) * 10) / 10,
      fatG: Math.round((acc.fatG + m.fatG) * 10) / 10,
    }),
    { calories: 0, proteinG: 0, carbsG: 0, fatG: 0 }
  );

  return {
    mode,
    dietary,
    target,
    plannedTotals,
    meals,
    skippedLoggedMeals,
    allMealsAlreadyLogged: false,
  };
}

export function getNextMealTemplateSwap(
  currentTemplateId: string,
  mealType: MealType,
  dietary: DietaryPreference
): MealTemplate | null {
  const pool = filterTemplatesForDiet(mealType, dietary);
  if (pool.length <= 1) return pool[0] || null;
  const idx = pool.findIndex((t) => t.id === currentTemplateId);
  return pool[(idx + 1) % pool.length];
}
