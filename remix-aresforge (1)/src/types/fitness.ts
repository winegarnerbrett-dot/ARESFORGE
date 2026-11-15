export type UnitSystem = 'imperial' | 'metric';
export type ThemePreference = 'system' | 'light' | 'dark';
export type ProgramCategory = 'Strength' | 'Hypertrophy' | 'Conditioning' | 'Mobility' | 'Custom';
export type DifficultyLevel = 'Beginner' | 'Intermediate' | 'Advanced';
export type ExperienceLevel = DifficultyLevel;
export type RotationDays = 3 | 4 | 5 | 6 | 7;
export type WorkoutDurationOption = 30 | 45 | 60;
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';
export type NutritionSource = 'barcode' | 'search' | 'manual';
export type WearableSource = 'manual' | 'fitbit' | 'apple_health' | 'garmin' | 'strava' | 'bluetooth_hr';

export type MovementPattern =
  | 'squat'
  | 'hinge'
  | 'push_horizontal'
  | 'push_vertical'
  | 'pull_horizontal'
  | 'pull_vertical'
  | 'lunge'
  | 'core_plank'
  | 'core_hollow'
  | 'carry_swing'
  | 'curl_raise'
  | 'cardio_jump'
  | 'mobility_flow';

export interface ExerciseLibraryItem {
  id: string;
  name: string;
  muscleGroup: 'Legs' | 'Chest' | 'Back' | 'Shoulders' | 'Arms' | 'Core' | 'Conditioning' | 'Mobility';
  equipment: string;
  pattern: MovementPattern;
  defaultSets: number;
  defaultReps: string;
  defaultRestSeconds: number;
  tempo: string;
  cues: string[];
  mistakes: string[];
}

export interface ProgramExercise {
  id: string;
  exerciseId?: string;
  name: string;
  muscleGroup: string;
  equipment?: string;
  sets: number;
  reps: string;
  restSeconds: number;
  notes?: string;
  pattern?: MovementPattern;
  dayIndex?: number;
  dayFocus?: string;
  originalExerciseId?: string;
  replacedFromName?: string;
}

export interface ProgramDay {
  dayNumber: number;
  focus: string;
  recoveryNote: string;
  exercises: ProgramExercise[];
}

export interface ProgramPreference {
  userId?: string;
  programId: string;
  rotationDays: RotationDays;
  targetMinutes: WorkoutDurationOption;
  exerciseSwaps?: Record<string, string>;
  updatedAt?: string;
}

export interface WorkoutProgram {
  id: string;
  userId?: string;
  isCustom: boolean;
  title: string;
  category: ProgramCategory;
  difficulty: DifficultyLevel;
  estimatedMinutes: number;
  daysPerWeek: number;
  description: string;
  imageUrl?: string;
  exercises: ProgramExercise[];
  days?: ProgramDay[];
  createdAt?: string;
  updatedAt?: string;
}

export interface WorkoutSetLog {
  setNumber: number;
  weightKg: number;
  reps: number;
  completed: boolean;
}

export interface ExerciseSessionSummary {
  name: string;
  completedSets: number;
  topWeightKg: number;
  totalVolumeKg: number;
}

export interface WorkoutSession {
  id: string;
  userId?: string;
  programId: string;
  programTitle: string;
  dateKey: string;
  durationMinutes: number;
  caloriesBurned: number;
  totalVolumeKg: number;
  completedSets: number;
  exercisesSummary: ExerciseSessionSummary[];
  notes: string;
  createdAt?: string;
}

export interface NutritionEntry {
  id: string;
  userId?: string;
  dateKey: string;
  mealType: MealType;
  name: string;
  brand: string;
  barcode: string;
  servingLabel: string;
  servings: number;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  source: NutritionSource;
  createdAt?: string;
}

export interface DailyMetric {
  userId?: string;
  dateKey: string;
  waterMl: number;
  weightKg: number;
  steps: number;
  activeCalories: number;
  restingHeartRate: number;
  avgHeartRate: number;
  wearableSource: WearableSource;
  updatedAt?: string;
}

export type BiologicalSex = 'male' | 'female' | 'neutral';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
export type NutritionGoal = 'lose_weight' | 'maintain' | 'build_muscle' | 'recomp' | 'performance';
export type MacroMode = 'recommended' | 'custom';

export interface UserProfile {
  uid: string;
  displayName: string;
  dailyCalorieGoal: number;
  dailyProteinGoal: number;
  dailyCarbsGoal: number;
  dailyFatGoal: number;
  macroMode?: MacroMode;
  macroProteinPct?: number;
  macroCarbsPct?: number;
  macroFatPct?: number;
  weeklyWorkoutGoal: number;
  dailyWaterGoalMl: number;
  dailyStepGoal: number;
  dailyActiveCaloriesGoal: number;
  targetWeightKg: number;
  currentWeightKg: number;
  heightCm: number;
  age: number;
  biologicalSex: BiologicalSex;
  activityLevel: ActivityLevel;
  nutritionGoal: NutritionGoal;
  activeProgramId?: string;
  activeDailyDurationDate?: string;
  activeDailyDurationMinutes?: WorkoutDurationOption;
  unitSystem: UnitSystem;
  experienceLevel: ExperienceLevel;
}

export interface WearableProviderStatus {
  configured: boolean;
  connected: boolean;
  accountLabel: string | null;
  callbackUrl: string;
}

export interface WearablesStatusResponse {
  fitbit: WearableProviderStatus;
  strava: WearableProviderStatus;
}

export interface FoodCatalogProduct {
  id: string;
  name: string;
  brand: string;
  barcode: string;
  servingLabel: string;
  caloriesPerServing: number;
  proteinPerServing: number;
  carbsPerServing: number;
  fatPerServing: number;
  imageUrl?: string;
  source: NutritionSource;
}
