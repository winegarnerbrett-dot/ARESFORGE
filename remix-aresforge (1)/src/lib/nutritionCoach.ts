import type {
  ActivityLevel,
  BiologicalSex,
  DailyMetric,
  MacroMode,
  NutritionGoal,
  UserProfile,
  WorkoutSession,
} from '../types/fitness';

export type MacroKey = 'proteinPct' | 'carbsPct' | 'fatPct';

export interface MacroPercentages {
  proteinPct: number;
  carbsPct: number;
  fatPct: number;
}

export interface MacroTargets extends MacroPercentages {
  proteinG: number;
  carbsG: number;
  fatG: number;
}

export interface ActivityOption {
  id: ActivityLevel;
  label: string;
  shortLabel: string;
  multiplier: number;
  description: string;
}

export interface GoalOption {
  id: NutritionGoal;
  label: string;
  shortLabel: string;
  baseOffsetKcal: number;
  description: string;
}

export const ACTIVITY_LEVEL_OPTIONS: ActivityOption[] = [
  {
    id: 'sedentary',
    label: 'Sedentary',
    shortLabel: 'Sedentary',
    multiplier: 1.2,
    description: 'Desk routine, under 5,000 steps/day',
  },
  {
    id: 'light',
    label: 'Lightly Active',
    shortLabel: 'Light',
    multiplier: 1.375,
    description: '1–2 workouts/wk, 5,000–7,000 steps/day',
  },
  {
    id: 'moderate',
    label: 'Moderately Active',
    shortLabel: 'Moderate',
    multiplier: 1.55,
    description: '3–4 workouts/wk, 7,500–10,000 steps/day',
  },
  {
    id: 'active',
    label: 'Very Active',
    shortLabel: 'Active',
    multiplier: 1.725,
    description: '5–6 hard sessions/wk, 10,000+ steps/day',
  },
  {
    id: 'very_active',
    label: 'Athlete / High Output',
    shortLabel: 'Athlete',
    multiplier: 1.9,
    description: 'Daily intense training or physical labor',
  },
];

export const NUTRITION_GOAL_OPTIONS: GoalOption[] = [
  {
    id: 'lose_weight',
    label: 'Fat Loss',
    shortLabel: 'Lose Weight',
    baseOffsetKcal: -450,
    description: 'Steady calorie deficit with high protein to protect lean muscle',
  },
  {
    id: 'recomp',
    label: 'Body Recomposition',
    shortLabel: 'Recomp',
    baseOffsetKcal: -75,
    description: 'Near-maintenance intake with elevated protein to trim fat and build lean mass',
  },
  {
    id: 'maintain',
    label: 'Maintain Weight',
    shortLabel: 'Maintain',
    baseOffsetKcal: 0,
    description: 'Balanced energy intake matched to daily expenditure',
  },
  {
    id: 'build_muscle',
    label: 'Lean Muscle Gain',
    shortLabel: 'Build Muscle',
    baseOffsetKcal: 275,
    description: 'Controlled calorie surplus and carb fueling for hypertrophy recovery',
  },
  {
    id: 'performance',
    label: 'Performance & AFT',
    shortLabel: 'Performance',
    baseOffsetKcal: 125,
    description: 'Glycogen-forward macros to power conditioning, rucking, and strength output',
  },
];

export interface WeightTrendPoint {
  dateKey: string;
  label: string;
  weightKg: number;
}

export interface NutritionRecommendation {
  bmr: number;
  tdee: number;
  baseGoalCalories: number;
  trendAdjustmentCalories: number;
  recommendedCalories: number;
  deltaFromCurrentGoal: number;
  macroMode: MacroMode;
  macros: MacroTargets;
  recommendedMacros: MacroTargets;
  goalOption: GoalOption;
  activityOption: ActivityOption;
  weightKg: number;
  targetWeightKg: number;
  gapToGoalKg: number;
  weeklyTrend: {
    hasTrendData: boolean;
    pointsCount: number;
    current7DayAvgKg: number | null;
    previous7DayAvgKg: number | null;
    weeklyRateKg: number | null;
    statusLabel: string;
    statusTone: 'positive' | 'adjust' | 'caution' | 'neutral';
    points: WeightTrendPoint[];
  };
  observedActivity: {
    avgSteps: number;
    weeklyWorkouts: number;
    suggestedActivityId: ActivityLevel | null;
  };
  reasoning: string;
  alreadyApplied: boolean;
}

function parseDateKeyMs(dateKey: string): number {
  const [y, m, d] = dateKey.split('-').map(Number);
  return Date.UTC(y || 2026, (m || 1) - 1, d || 1);
}

function addDays(dateKey: string, offsetDays: number): string {
  const [y, m, d] = dateKey.split('-').map(Number);
  const dt = new Date(Date.UTC(y || 2026, (m || 1) - 1, d || 1));
  dt.setUTCDate(dt.getUTCDate() + offsetDays);
  const yyyy = dt.getUTCFullYear();
  const mm = String(dt.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(dt.getUTCDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function formatMonthDay(dateKey: string): string {
  const [y, m, d] = dateKey.split('-').map(Number);
  const dt = new Date(y, (m || 1) - 1, d || 1);
  return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function clamp(val: number, min: number, max: number): number {
  if (!Number.isFinite(val)) return min;
  return Math.min(max, Math.max(min, val));
}

export function inferNutritionGoal(profile: UserProfile): NutritionGoal {
  if (profile.nutritionGoal) return profile.nutritionGoal;
  const diff = profile.targetWeightKg - profile.currentWeightKg;
  if (diff < -0.5) return 'lose_weight';
  if (diff > 0.5) return 'build_muscle';
  return 'recomp';
}

export function normalizeMacroPercentages(
  pcts?: Partial<MacroPercentages> | null,
  fallback: MacroPercentages = { proteinPct: 30, carbsPct: 40, fatPct: 30 }
): MacroPercentages {
  const rawP = clamp(Math.round(pcts?.proteinPct ?? fallback.proteinPct), 0, 100);
  const rawC = clamp(Math.round(pcts?.carbsPct ?? fallback.carbsPct), 0, 100);
  const rawF = clamp(Math.round(pcts?.fatPct ?? fallback.fatPct), 0, 100);
  const sum = rawP + rawC + rawF;
  if (sum === 100) {
    return { proteinPct: rawP, carbsPct: rawC, fatPct: rawF };
  }
  if (sum <= 0) {
    return { ...fallback };
  }
  const scaledP = Math.round((rawP / sum) * 100);
  const scaledC = Math.round((rawC / sum) * 100);
  let p = clamp(scaledP, 0, 100);
  let c = clamp(scaledC, 0, 100 - p);
  const f = clamp(100 - p - c, 0, 100);
  if (p + c + f !== 100) {
    const diff = 100 - (p + c + f);
    if (c + diff >= 0 && c + diff <= 100) c += diff;
    else p = clamp(p + diff, 0, 100);
  }
  return { proteinPct: p, carbsPct: c, fatPct: 100 - p - c };
}

export function rebalanceMacroPercentages(
  current: MacroPercentages,
  changedKey: MacroKey,
  nextVal: number,
  lockedKey?: MacroKey | null
): MacroPercentages {
  const base = normalizeMacroPercentages(current);
  const allKeys: MacroKey[] = ['proteinPct', 'carbsPct', 'fatPct'];
  const otherKeys = allKeys.filter((k) => k !== changedKey);

  // If another macro is locked, keep its value exact and adjust only the third unlocked macro
  if (lockedKey && lockedKey !== changedKey && otherKeys.includes(lockedKey)) {
    const lockedVal = base[lockedKey];
    const maxForChanged = Math.max(0, 100 - lockedVal);
    const clampedChanged = clamp(Math.round(nextVal), 0, maxForChanged);
    const thirdKey = otherKeys.find((k) => k !== lockedKey)!;
    const thirdVal = Math.max(0, 100 - lockedVal - clampedChanged);
    return {
      ...base,
      [changedKey]: clampedChanged,
      [lockedKey]: lockedVal,
      [thirdKey]: thirdVal,
    };
  }

  // Otherwise proportionally rebalance across the remaining two macros so the total is always 100%
  const clampedChanged = clamp(Math.round(nextVal), 0, 100);
  const remaining = 100 - clampedChanged;
  const [otherA, otherB] = otherKeys;
  const currentOtherSum = base[otherA] + base[otherB];

  let nextA: number;
  let nextB: number;
  if (currentOtherSum <= 0) {
    nextA = Math.ceil(remaining / 2);
    nextB = remaining - nextA;
  } else {
    nextA = Math.round((base[otherA] / currentOtherSum) * remaining);
    nextA = clamp(nextA, 0, remaining);
    nextB = remaining - nextA;
  }

  return {
    ...base,
    [changedKey]: clampedChanged,
    [otherA]: nextA,
    [otherB]: nextB,
  };
}

export function macrosFromPercentages(calories: number, pcts: MacroPercentages): MacroTargets {
  const safeCalories = Math.max(0, Number.isFinite(calories) ? calories : 0);
  const norm = normalizeMacroPercentages(pcts);
  return {
    proteinPct: norm.proteinPct,
    carbsPct: norm.carbsPct,
    fatPct: norm.fatPct,
    proteinG: Math.round((safeCalories * norm.proteinPct) / 400),
    carbsG: Math.round((safeCalories * norm.carbsPct) / 400),
    fatG: Math.round((safeCalories * norm.fatPct) / 900),
  };
}

export function deriveMacroPercentagesFromGrams(
  proteinG: number,
  carbsG: number,
  fatG: number
): MacroPercentages {
  const pCals = Math.max(0, proteinG) * 4;
  const cCals = Math.max(0, carbsG) * 4;
  const fCals = Math.max(0, fatG) * 9;
  const total = pCals + cCals + fCals;
  if (total <= 0) {
    return { proteinPct: 30, carbsPct: 40, fatPct: 30 };
  }
  const pPct = Math.round((pCals / total) * 100);
  const cPct = Math.round((cCals / total) * 100);
  const clampedP = clamp(pPct, 0, 100);
  const clampedC = clamp(cPct, 0, 100 - clampedP);
  return {
    proteinPct: clampedP,
    carbsPct: clampedC,
    fatPct: 100 - clampedP - clampedC,
  };
}

export function computeNutritionRecommendation(params: {
  profile: UserProfile;
  dailyMetrics: Record<string, DailyMetric>;
  workoutSessions: WorkoutSession[];
  referenceDateKey: string;
}): NutritionRecommendation {
  const { profile, dailyMetrics, workoutSessions, referenceDateKey } = params;

  const sex: BiologicalSex =
    profile.biologicalSex === 'male' || profile.biologicalSex === 'female'
      ? profile.biologicalSex
      : 'neutral';
  const heightCm = clamp(profile.heightCm || 175, 100, 250);
  const age = clamp(profile.age || 30, 13, 110);
  const targetWeightKg = clamp(profile.targetWeightKg || 72, 25, 350);

  // Collect chronological weight check-ins up to referenceDateKey
  const allWeightPoints = Object.values(dailyMetrics)
    .filter((m) => m.weightKg > 20 && m.dateKey <= referenceDateKey)
    .sort((a, b) => a.dateKey.localeCompare(b.dateKey));

  const latestLoggedWeight =
    allWeightPoints.length > 0 ? allWeightPoints[allWeightPoints.length - 1].weightKg : null;
  const weightKg = clamp(latestLoggedWeight ?? profile.currentWeightKg ?? 75, 25, 350);

  const activityOption =
    ACTIVITY_LEVEL_OPTIONS.find((a) => a.id === profile.activityLevel) || ACTIVITY_LEVEL_OPTIONS[2];
  const resolvedGoalId = inferNutritionGoal(profile);
  const goalOption =
    NUTRITION_GOAL_OPTIONS.find((g) => g.id === resolvedGoalId) || NUTRITION_GOAL_OPTIONS[1];

  // 1. Mifflin-St Jeor BMR & TDEE
  const sexConstant = sex === 'male' ? 5 : sex === 'female' ? -161 : -78;
  const bmr = Math.round(10 * weightKg + 6.25 * heightCm - 5 * age + sexConstant);
  const tdee = Math.round(bmr * activityOption.multiplier);

  // 2. Observed 7-day wearable & workout activity context
  const weekStartKey = addDays(referenceDateKey, -6);
  const recentMetrics = Object.values(dailyMetrics).filter(
    (m) => m.dateKey >= weekStartKey && m.dateKey <= referenceDateKey
  );
  const stepDays = recentMetrics.filter((m) => m.steps > 0);
  const avgSteps =
    stepDays.length > 0
      ? Math.round(stepDays.reduce((sum, m) => sum + m.steps, 0) / stepDays.length)
      : 0;
  const weeklyWorkouts = workoutSessions.filter(
    (s) => s.dateKey >= weekStartKey && s.dateKey <= referenceDateKey
  ).length;

  let suggestedActivityId: ActivityLevel | null = null;
  if (weeklyWorkouts >= 6 && (avgSteps === 0 || avgSteps >= 11000)) {
    suggestedActivityId = 'very_active';
  } else if (weeklyWorkouts >= 5 || avgSteps >= 10000) {
    suggestedActivityId = 'active';
  } else if (weeklyWorkouts >= 3 || avgSteps >= 7500) {
    suggestedActivityId = 'moderate';
  } else if (weeklyWorkouts >= 1 || avgSteps >= 5000) {
    suggestedActivityId = 'light';
  }

  // 3. Weekly Weight Trend Analysis (14-day windows + 21-day linear slope)
  const prevWeekStartKey = addDays(referenceDateKey, -13);
  const prevWeekEndKey = addDays(referenceDateKey, -7);
  const slopeWindowStartKey = addDays(referenceDateKey, -20);

  const currentWeekWeights = allWeightPoints.filter(
    (p) => p.dateKey >= weekStartKey && p.dateKey <= referenceDateKey
  );
  const prevWeekWeights = allWeightPoints.filter(
    (p) => p.dateKey >= prevWeekStartKey && p.dateKey <= prevWeekEndKey
  );

  const current7DayAvgKg =
    currentWeekWeights.length > 0
      ? Math.round(
          (currentWeekWeights.reduce((s, p) => s + p.weightKg, 0) / currentWeekWeights.length) * 10
        ) / 10
      : null;
  const previous7DayAvgKg =
    prevWeekWeights.length > 0
      ? Math.round(
          (prevWeekWeights.reduce((s, p) => s + p.weightKg, 0) / prevWeekWeights.length) * 10
        ) / 10
      : null;

  const slopePoints = allWeightPoints.filter((p) => p.dateKey >= slopeWindowStartKey);
  let weeklyRateKg: number | null = null;
  let hasTrendData = false;

  if (slopePoints.length >= 2) {
    const firstMs = parseDateKeyMs(slopePoints[0].dateKey);
    const lastMs = parseDateKeyMs(slopePoints[slopePoints.length - 1].dateKey);
    const spanDays = (lastMs - firstMs) / (1000 * 60 * 60 * 24);
    if (spanDays >= 1) {
      hasTrendData = true;
      const xs = slopePoints.map((p) => (parseDateKeyMs(p.dateKey) - firstMs) / (1000 * 60 * 60 * 24));
      const ys = slopePoints.map((p) => p.weightKg);
      const meanX = xs.reduce((a, b) => a + b, 0) / xs.length;
      const meanY = ys.reduce((a, b) => a + b, 0) / ys.length;
      let num = 0;
      let den = 0;
      for (let i = 0; i < xs.length; i++) {
        num += (xs[i] - meanX) * (ys[i] - meanY);
        den += (xs[i] - meanX) ** 2;
      }
      const slopePerDay = den > 0 ? num / den : 0;
      weeklyRateKg = Math.round(clamp(slopePerDay * 7, -2.5, 2.5) * 100) / 100;
    }
  }

  const effectiveWeightKg = current7DayAvgKg ?? weightKg;
  const gapToGoalKg = Math.round((targetWeightKg - effectiveWeightKg) * 10) / 10;

  // 4. Adaptive Calorie Calculation & Reasoning
  let trendAdjustmentCalories = 0;
  let statusLabel = 'Baseline from stats & goal';
  let statusTone: 'positive' | 'adjust' | 'caution' | 'neutral' = 'neutral';
  let reasoning = `Calculated from your weight, height, age, and ${activityOption.label.toLowerCase()} activity level for ${goalOption.label.toLowerCase()}.`;

  const baseGoalCalories = tdee + goalOption.baseOffsetKcal;

  if (!hasTrendData || weeklyRateKg === null) {
    statusLabel = 'Log 2+ weigh-ins for trend feedback';
    statusTone = 'neutral';
    reasoning = `Calculated from your biometrics and ${activityOption.label.toLowerCase()} output. Log at least 2 weight check-ins across separate days to unlock weekly trend calorie adjustments.`;
  } else if (goalOption.id === 'lose_weight') {
    if (gapToGoalKg >= -0.5) {
      trendAdjustmentCalories = 250;
      statusLabel = 'Goal weight reached · Easing deficit';
      statusTone = 'positive';
      reasoning = `Your 7-day weight is right at your goal weight. Easing the deficit by +250 kcal/day helps lock in your results and restore training energy.`;
    } else if (weeklyRateKg < -0.95) {
      trendAdjustmentCalories = 175;
      statusLabel = 'Losing too rapidly · Muscle protection';
      statusTone = 'caution';
      reasoning = `Your weekly trend is dropping faster than optimal for lean mass retention. Adding +175 kcal/day slows fat loss into a sustainable window.`;
    } else if (weeklyRateKg > -0.15) {
      trendAdjustmentCalories = weeklyRateKg > 0.2 ? -225 : -175;
      statusLabel = 'Plateau vs. goal · Deficit adjustment';
      statusTone = 'adjust';
      reasoning = `Your weekly weight trend is flat or creeping up while above your goal weight. Trimming ${Math.abs(
        trendAdjustmentCalories
      )} kcal/day restarts steady fat loss.`;
    } else {
      trendAdjustmentCalories = 0;
      statusLabel = 'On track toward goal weight';
      statusTone = 'positive';
      reasoning = `Your weekly weight trend is moving steadily toward your goal weight at a healthy fat-loss pace—stay consistent with this target.`;
    }
  } else if (goalOption.id === 'build_muscle') {
    if (gapToGoalKg <= -0.5) {
      trendAdjustmentCalories = -150;
      statusLabel = 'Goal weight reached · Trim surplus';
      statusTone = 'caution';
      reasoning = `You have reached your goal weight. Trimming ${Math.abs(
        trendAdjustmentCalories
      )} kcal/day transitions you into lean maintenance while keeping strength climbing.`;
    } else if (weeklyRateKg < 0.08) {
      trendAdjustmentCalories = weeklyRateKg < -0.15 ? 225 : 175;
      statusLabel = 'Trend below lean-gain target';
      statusTone = 'adjust';
      reasoning = `Your weekly weight trend is flat or dipping while aiming to gain. Adding +${trendAdjustmentCalories} kcal/day fuels hypertrophy and recovery.`;
    } else if (weeklyRateKg > 0.55) {
      trendAdjustmentCalories = -150;
      statusLabel = 'Gaining faster than lean target';
      statusTone = 'caution';
      reasoning = `Weekly weight is climbing faster than the lean muscle sweet spot. Trimming 150 kcal/day keeps gains lean.`;
    } else {
      trendAdjustmentCalories = 0;
      statusLabel = 'Optimal lean-gain pace';
      statusTone = 'positive';
      reasoning = `Your weekly weight trend shows controlled upward progress toward your goal weight—ideal for lean muscle accrual.`;
    }
  } else {
    // Recomp, Maintain, Performance
    if (weeklyRateKg > 0.35 && gapToGoalKg < -0.5) {
      trendAdjustmentCalories = -150;
      statusLabel = 'Trending above goal weight';
      statusTone = 'adjust';
      reasoning = `Your weekly weight is drifting upward above your goal weight. A -150 kcal/day adjustment restores your ${goalOption.label.toLowerCase()} balance.`;
    } else if (weeklyRateKg < -0.35 && (gapToGoalKg > 0.5 || goalOption.id === 'performance')) {
      trendAdjustmentCalories = 175;
      statusLabel = 'Dropping below target fuel';
      statusTone = 'adjust';
      reasoning = `Your weekly weight trend is dropping faster than intended for ${goalOption.label.toLowerCase()}. Adding +175 kcal/day protects recovery and output.`;
    } else {
      trendAdjustmentCalories = 0;
      statusLabel = 'Weight trend aligned with goal';
      statusTone = 'positive';
      reasoning = `Your weekly weight stability pairs well with your ${goalOption.label.toLowerCase()} target and current training output.`;
    }
  }

  const minFloor = sex === 'male' ? 1500 : sex === 'female' ? 1200 : 1350;
  const recommendedCalories = clamp(
    Math.round((baseGoalCalories + trendAdjustmentCalories) / 10) * 10,
    minFloor,
    6000
  );

  // 5. Goal-Tailored Macros (based on weight, goal, and calorie target)
  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);
  const referenceWeightKg =
    bmi > 28 && targetWeightKg < weightKg ? (weightKg + targetWeightKg) / 2 : weightKg;

  const proteinPerKgMap: Record<NutritionGoal, number> = {
    lose_weight: 2.1,
    recomp: 2.1,
    build_muscle: 1.9,
    performance: 1.8,
    maintain: 1.7,
  };
  const fatShareMap: Record<NutritionGoal, number> = {
    lose_weight: 0.26,
    recomp: 0.28,
    build_muscle: 0.26,
    performance: 0.23,
    maintain: 0.28,
  };

  let proteinG = clamp(Math.round(referenceWeightKg * proteinPerKgMap[goalOption.id]), 55, 320);
  let fatG = clamp(
    Math.max(
      Math.round(referenceWeightKg * 0.65),
      Math.round((recommendedCalories * fatShareMap[goalOption.id]) / 9)
    ),
    35,
    180
  );

  // Ensure carbs keep at least 60g floor without breaking calorie budget
  let remainingCals = recommendedCalories - proteinG * 4 - fatG * 9;
  if (remainingCals < 240) {
    fatG = Math.max(30, Math.round((recommendedCalories - proteinG * 4 - 240) / 9));
    remainingCals = recommendedCalories - proteinG * 4 - fatG * 9;
    if (remainingCals < 240) {
      proteinG = Math.max(50, Math.round((recommendedCalories - fatG * 9 - 240) / 4));
      remainingCals = recommendedCalories - proteinG * 4 - fatG * 9;
    }
  }
  const carbsG = Math.max(60, Math.round(remainingCals / 4));

  const totalMacroCals = Math.max(1, proteinG * 4 + carbsG * 4 + fatG * 9);
  const recProteinPct = clamp(Math.round(((proteinG * 4) / totalMacroCals) * 100), 0, 100);
  const recCarbsPct = clamp(Math.round(((carbsG * 4) / totalMacroCals) * 100), 0, 100 - recProteinPct);
  const recFatPct = Math.max(0, 100 - recProteinPct - recCarbsPct);

  const recommendedMacros: MacroTargets = {
    proteinG,
    carbsG,
    fatG,
    proteinPct: recProteinPct,
    carbsPct: recCarbsPct,
    fatPct: recFatPct,
  };

  const macroMode: MacroMode = profile.macroMode === 'custom' ? 'custom' : 'recommended';
  const activeMacros: MacroTargets =
    macroMode === 'custom' &&
    profile.macroProteinPct !== undefined &&
    profile.macroCarbsPct !== undefined &&
    profile.macroFatPct !== undefined
      ? macrosFromPercentages(recommendedCalories, {
          proteinPct: profile.macroProteinPct,
          carbsPct: profile.macroCarbsPct,
          fatPct: profile.macroFatPct,
        })
      : recommendedMacros;

  const deltaFromCurrentGoal = recommendedCalories - Math.round(profile.dailyCalorieGoal);
  const alreadyApplied =
    Math.abs(profile.dailyCalorieGoal - recommendedCalories) <= 15 &&
    Math.abs(profile.dailyProteinGoal - activeMacros.proteinG) <= 3 &&
    Math.abs(profile.dailyCarbsGoal - activeMacros.carbsG) <= 5 &&
    Math.abs(profile.dailyFatGoal - activeMacros.fatG) <= 3;

  const visualPoints: WeightTrendPoint[] = allWeightPoints.slice(-14).map((p) => ({
    dateKey: p.dateKey,
    label: formatMonthDay(p.dateKey),
    weightKg: p.weightKg,
  }));

  return {
    bmr,
    tdee,
    baseGoalCalories,
    trendAdjustmentCalories,
    recommendedCalories,
    deltaFromCurrentGoal,
    macroMode,
    macros: activeMacros,
    recommendedMacros,
    goalOption,
    activityOption,
    weightKg,
    targetWeightKg,
    gapToGoalKg,
    weeklyTrend: {
      hasTrendData,
      pointsCount: slopePoints.length,
      current7DayAvgKg,
      previous7DayAvgKg,
      weeklyRateKg,
      statusLabel,
      statusTone,
      points: visualPoints,
    },
    observedActivity: {
      avgSteps,
      weeklyWorkouts,
      suggestedActivityId,
    },
    reasoning,
    alreadyApplied,
  };
}
