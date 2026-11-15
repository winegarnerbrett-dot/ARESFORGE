import React, { useMemo, useState } from 'react';
import {
  Activity,
  Dumbbell,
  Flame,
  Footprints,
  HeartPulse,
  Plus,
  Scale,
  ScanBarcode,
  Trash2,
  Watch,
} from 'lucide-react';
import { adaptProgramForUser, getNextProgramDayIndex } from '../data/programs';
import {
  computeNutritionRecommendation,
  deriveMacroPercentagesFromGrams,
  normalizeMacroPercentages,
} from '../lib/nutritionCoach';
import type {
  DailyMetric,
  MovementPattern,
  NutritionEntry,
  ProgramDay,
  ProgramExercise,
  ProgramPreference,
  RotationDays,
  UserProfile,
  WorkoutDurationOption,
  WorkoutProgram,
  WorkoutSession,
} from '../types/fitness';
import { AdaptiveNutritionCard } from './AdaptiveNutritionCard';
import { NextWorkoutCard } from './NextWorkoutCard';

interface ProgressDashboardProps {
  profile: UserProfile;
  selectedDateKey: string;
  onSelectDateKey: (dk: string) => void;
  nutritionLogs: NutritionEntry[];
  workoutSessions: WorkoutSession[];
  dailyMetrics: Record<string, DailyMetric>;
  allPrograms: WorkoutProgram[];
  programPrefs: Record<string, ProgramPreference>;
  dailyDurationOverrides: Record<string, WorkoutDurationOption>;
  liveHeartRate: number | null;
  onUpdateWeight: (dateKey: string, weightKg: number) => void;
  onSaveProfile: (next: UserProfile) => void;
  onChangeDailyDuration: (
    dateKey: string,
    programId: string,
    minutes: WorkoutDurationOption | null
  ) => void;
  onStartWorkout: (program: WorkoutProgram, day: ProgramDay) => void;
  onRequestSwapExercise: (program: WorkoutProgram, exercise: ProgramExercise) => void;
  onWatchFormVideo: (name: string, exerciseId?: string, pattern?: MovementPattern) => void;
  onOpenWearableSync: () => void;
  onOpenBarcodeScanner: () => void;
  onGoToWorkouts: () => void;
  onDeleteWorkoutSession: (sessionId: string) => void;
}

function formatShortDay(dateKey: string): { dow: string; dayNum: string } {
  const [y, m, d] = dateKey.split('-').map(Number);
  const dt = new Date(y, (m || 1) - 1, d || 1);
  const dow = dt.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 1);
  return { dow, dayNum: String(dt.getDate()) };
}

function getLastNDays(endDateKey: string, count: number): string[] {
  const [y, m, d] = endDateKey.split('-').map(Number);
  const base = new Date(y, (m || 1) - 1, d || 1);
  const result: string[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const dt = new Date(base);
    dt.setDate(base.getDate() - i);
    const yyyy = dt.getFullYear();
    const mm = String(dt.getMonth() + 1).padStart(2, '0');
    const dd = String(dt.getDate()).padStart(2, '0');
    result.push(`${yyyy}-${mm}-${dd}`);
  }
  return result;
}

const RingProgress: React.FC<{
  value: number;
  max: number;
  size?: number;
  strokeWidth?: number;
  colorClass: string;
  label: string;
  sublabel: string;
}> = ({ value, max, size = 104, strokeWidth = 9, colorClass, label, sublabel }) => {
  const radius = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * radius;
  const pct = max > 0 ? Math.min(1, Math.max(0, value / max)) : 0;
  const offset = circ * (1 - pct);

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-slate-100 dark:text-slate-800"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={`${colorClass} transition-all duration-300`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-1">
        <span className="text-base font-bold font-mono text-slate-900 dark:text-white leading-none">
          {label}
        </span>
        <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">{sublabel}</span>
      </div>
    </div>
  );
};

export const ProgressDashboard: React.FC<ProgressDashboardProps> = ({
  profile,
  selectedDateKey,
  onSelectDateKey,
  nutritionLogs,
  workoutSessions,
  dailyMetrics,
  allPrograms,
  programPrefs,
  dailyDurationOverrides,
  liveHeartRate,
  onUpdateWeight,
  onSaveProfile,
  onChangeDailyDuration,
  onStartWorkout,
  onRequestSwapExercise,
  onWatchFormVideo,
  onOpenWearableSync,
  onOpenBarcodeScanner,
  onGoToWorkouts,
  onDeleteWorkoutSession,
}) => {
  const isImperial = profile.unitSystem === 'imperial';
  const weightUnit = isImperial ? 'lbs' : 'kg';
  const toDisplayWeight = (kg: number) => (isImperial ? Math.round(kg * 2.20462 * 10) / 10 : Math.round(kg * 10) / 10);

  const [editingWeight, setEditingWeight] = useState(false);
  const [weightInput, setWeightInput] = useState('');
  const [confirmDeleteSessionId, setConfirmDeleteSessionId] = useState<string | null>(null);
  const [showAllSessions, setShowAllSessions] = useState(false);

  const nutritionRecommendation = useMemo(
    () =>
      computeNutritionRecommendation({
        profile,
        dailyMetrics,
        workoutSessions,
        referenceDateKey: selectedDateKey,
      }),
    [profile, dailyMetrics, workoutSessions, selectedDateKey]
  );

  const activeUpNext = useMemo(() => {
    const activeId = profile.activeProgramId || workoutSessions[0]?.programId;
    if (!activeId) return null;
    const program = allPrograms.find((p) => p.id === activeId);
    if (!program) return null;

    const pref = programPrefs[program.id];
    const rotationDays = (pref?.rotationDays ??
      Math.min(7, Math.max(3, program.daysPerWeek || 4))) as RotationDays;
    const rawMin = program.estimatedMinutes || 45;
    const defaultMin: WorkoutDurationOption = rawMin <= 35 ? 30 : rawMin >= 55 ? 60 : 45;
    const baseDurationMinutes: WorkoutDurationOption = pref?.targetMinutes ?? defaultMin;

    const localOverride = dailyDurationOverrides[`${selectedDateKey}:${program.id}`];
    const profileOverride =
      profile.activeDailyDurationDate === selectedDateKey
        ? profile.activeDailyDurationMinutes
        : undefined;
    const todayDurationMinutes: WorkoutDurationOption =
      localOverride ?? profileOverride ?? baseDurationMinutes;
    const isDailyOverride = todayDurationMinutes !== baseDurationMinutes;

    const experienceLevel = profile.experienceLevel || 'Intermediate';
    const adapted = adaptProgramForUser(program, {
      rotationDays,
      targetMinutes: todayDurationMinutes,
      experienceLevel,
      exerciseSwaps: pref?.exerciseSwaps,
    });
    const nextDayIdx = getNextProgramDayIndex(program.id, adapted.days.length, workoutSessions);
    const nextDay = adapted.days[nextDayIdx] || adapted.days[0];
    const completedCount = workoutSessions.filter((s) => s.programId === program.id).length;

    return {
      program,
      nextDay,
      rotationDays: adapted.rotationDays,
      experienceLevel,
      baseDurationMinutes,
      todayDurationMinutes,
      isDailyOverride,
      completedCount,
    };
  }, [
    profile.activeProgramId,
    profile.activeDailyDurationDate,
    profile.activeDailyDurationMinutes,
    profile.experienceLevel,
    allPrograms,
    programPrefs,
    dailyDurationOverrides,
    selectedDateKey,
    workoutSessions,
  ]);

  const todayKey = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
      now.getDate()
    ).padStart(2, '0')}`;
  }, []);

  const sevenDays = useMemo(() => getLastNDays(todayKey, 7), [todayKey]);

  const dayEntries = useMemo(
    () => nutritionLogs.filter((e) => e.dateKey === selectedDateKey),
    [nutritionLogs, selectedDateKey]
  );

  const dayTotals = useMemo(
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

  const daySessions = useMemo(
    () => workoutSessions.filter((s) => s.dateKey === selectedDateKey),
    [workoutSessions, selectedDateKey]
  );

  const weekWorkouts = useMemo(() => {
    const set = new Set(sevenDays);
    return workoutSessions.filter((s) => set.has(s.dateKey));
  }, [workoutSessions, sevenDays]);

  const metric = dailyMetrics[selectedDateKey] || {
    dateKey: selectedDateKey,
    waterMl: 0,
    weightKg: profile.currentWeightKg,
    steps: 0,
    activeCalories: 0,
    restingHeartRate: 0,
    avgHeartRate: 0,
    wearableSource: 'manual',
  };

  const workoutBurnToday = daySessions.reduce((sum, s) => sum + s.caloriesBurned, 0);
  const totalActiveBurn = Math.max(metric.activeCalories, workoutBurnToday);
  const remainingCalories = Math.max(0, profile.dailyCalorieGoal - Math.round(dayTotals.calories));

  const weeklyChartData = useMemo(() => {
    return sevenDays.map((dk) => {
      const cals = nutritionLogs
        .filter((e) => e.dateKey === dk)
        .reduce((sum, e) => sum + e.calories, 0);
      const mins = workoutSessions
        .filter((s) => s.dateKey === dk)
        .reduce((sum, s) => sum + s.durationMinutes, 0);
      const steps = dailyMetrics[dk]?.steps || 0;
      return {
        dateKey: dk,
        label: formatShortDay(dk).dow,
        calories: Math.round(cals),
        workoutMinutes: mins,
        steps,
      };
    });
  }, [sevenDays, nutritionLogs, workoutSessions, dailyMetrics]);

  const maxCalChart = Math.max(
    profile.dailyCalorieGoal * 1.15,
    ...weeklyChartData.map((d) => d.calories),
    1000
  );
  const maxStepChart = Math.max(
    profile.dailyStepGoal * 1.15,
    ...weeklyChartData.map((d) => d.steps),
    5000
  );

  const sourceLabels: Record<string, string> = {
    fitbit: 'Fitbit Sync',
    apple_health: 'Apple Watch / Health',
    garmin: 'Garmin Connect',
    strava: 'Strava Watch Sync',
    bluetooth_hr: 'Bluetooth HR Sensor',
    manual: 'App Activity',
  };

  return (
    <div className="space-y-6">
      {/* Header & Horizontal 7-Day Date Scroller */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight text-balance">
            Health &amp; Fitness Overview
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Daily nutrition budget, training output, and synced wearable activity
          </p>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {sevenDays.map((dk) => {
            const { dow, dayNum } = formatShortDay(dk);
            const isSelected = dk === selectedDateKey;
            return (
              <button
                key={dk}
                type="button"
                onClick={() => onSelectDateKey(dk)}
                className={`min-w-[48px] min-h-[56px] px-3 py-2 rounded-2xl flex flex-col items-center justify-center transition-colors shrink-0 ${
                  isSelected
                    ? 'bg-slate-900 text-white dark:bg-blue-600'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <span className="text-[11px] font-medium opacity-80">{dow}</span>
                <span className="text-sm font-bold font-mono mt-0.5">{dayNum}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Primary KPI Grid (2-col on mobile, 4-col on lg) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Calories & Macros Card */}
        <div className="md:col-span-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 flex flex-col sm:flex-row items-center gap-5">
          <RingProgress
            value={dayTotals.calories}
            max={profile.dailyCalorieGoal}
            size={116}
            strokeWidth={10}
            colorClass="text-blue-600 dark:text-blue-500"
            label={`${Math.round(dayTotals.calories)}`}
            sublabel={`of ${profile.dailyCalorieGoal} kcal`}
          />
          <div className="flex-1 w-full space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Nutrition Balance</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                  <span className="font-mono">{remainingCalories}</span> kcal remaining
                </p>
              </div>
              <button
                type="button"
                onClick={onOpenBarcodeScanner}
                className="min-h-[40px] px-3 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 text-blue-600 dark:text-blue-400 text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap shrink-0"
              >
                <ScanBarcode className="w-4 h-4" />
                Scan Food
              </button>
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
                <div className="grid grid-cols-3 gap-3 pt-1">
                  {[
                    {
                      name: 'Protein',
                      pct: pcts.proteinPct,
                      cur: Math.round(dayTotals.protein),
                      goal: profile.dailyProteinGoal,
                      bar: 'bg-blue-600',
                    },
                    {
                      name: 'Carbs',
                      pct: pcts.carbsPct,
                      cur: Math.round(dayTotals.carbs),
                      goal: profile.dailyCarbsGoal,
                      bar: 'bg-emerald-600',
                    },
                    {
                      name: 'Fat',
                      pct: pcts.fatPct,
                      cur: Math.round(dayTotals.fat),
                      goal: profile.dailyFatGoal,
                      bar: 'bg-amber-500',
                    },
                  ].map((m) => (
                    <div key={m.name} className="space-y-1">
                      <div className="flex justify-between text-[11px] gap-1">
                        <span className="text-slate-500 dark:text-slate-400 truncate">
                          {m.name} · <span className="font-mono tabular-nums">{m.pct}%</span>
                        </span>
                        <span className="font-mono tabular-nums font-semibold text-slate-800 dark:text-slate-200 shrink-0">
                          {m.cur}/{m.goal}g
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${m.bar}`}
                          style={{
                            width: `${m.goal > 0 ? Math.min(100, (m.cur / m.goal) * 100) : 0}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        </div>

        {/* Weekly Training Goal */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 flex flex-col justify-between gap-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Weekly Workouts</p>
              <p className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1">
                {weekWorkouts.length} / {profile.weeklyWorkoutGoal}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Dumbbell className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-emerald-600"
                style={{
                  width: `${Math.min(100, (weekWorkouts.length / Math.max(1, profile.weeklyWorkoutGoal)) * 100)}%`,
                }}
              />
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400">
                {daySessions.length > 0
                  ? `${daySessions.reduce((s, x) => s + x.durationMinutes, 0)} min today`
                  : 'No session logged today'}
              </span>
              <button
                type="button"
                onClick={onGoToWorkouts}
                className="font-semibold text-blue-600 dark:text-blue-400 hover:underline"
              >
                Train
              </button>
            </div>
          </div>
        </div>

        {/* Body Weight Card */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 flex flex-col justify-between gap-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Body Weight</p>
              <p className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1">
                {toDisplayWeight(metric.weightKg || profile.currentWeightKg)} {weightUnit}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center">
              <Scale className="w-5 h-5" />
            </div>
          </div>

          {editingWeight ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const val = Number(weightInput);
                if (val > 20) {
                  const kg = isImperial ? val / 2.20462 : val;
                  onUpdateWeight(selectedDateKey, Math.round(kg * 10) / 10);
                }
                setEditingWeight(false);
              }}
              className="flex gap-2"
            >
              <input
                type="number"
                step="0.1"
                value={weightInput}
                onChange={(e) => setWeightInput(e.target.value)}
                placeholder={weightUnit}
                className="w-full min-h-[36px] px-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white"
              />
              <button
                type="submit"
                className="min-h-[36px] px-3 rounded-lg bg-blue-600 text-white text-xs font-semibold"
              >
                Save
              </button>
            </form>
          ) : (
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400">
                Target: <span className="font-mono">{toDisplayWeight(profile.targetWeightKg)} {weightUnit}</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  setWeightInput(String(toDisplayWeight(metric.weightKg || profile.currentWeightKg)));
                  setEditingWeight(true);
                }}
                className="font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Log
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Quick-Access Next Workout from Active Program (with daily time adjustment) */}
      {activeUpNext && (
        <NextWorkoutCard
          program={activeUpNext.program}
          nextDay={activeUpNext.nextDay}
          rotationDays={activeUpNext.rotationDays}
          experienceLevel={activeUpNext.experienceLevel}
          baseDurationMinutes={activeUpNext.baseDurationMinutes}
          todayDurationMinutes={activeUpNext.todayDurationMinutes}
          isDailyOverride={activeUpNext.isDailyOverride}
          completedCount={activeUpNext.completedCount}
          selectedDateKey={selectedDateKey}
          onChangeDailyDuration={(mins) =>
            onChangeDailyDuration(selectedDateKey, activeUpNext.program.id, mins)
          }
          onStartWorkout={onStartWorkout}
          onRequestSwapExercise={onRequestSwapExercise}
          onWatchFormVideo={onWatchFormVideo}
          onViewAllPrograms={onGoToWorkouts}
        />
      )}

      {/* Adaptive Calorie & Macro Coach (Weekly Weight Trends + Biometrics + Activity + Goal) */}
      <AdaptiveNutritionCard
        profile={profile}
        recommendation={nutritionRecommendation}
        onSaveProfile={onSaveProfile}
        onQuickLogWeight={() => {
          setWeightInput(String(toDisplayWeight(metric.weightKg || profile.currentWeightKg)));
          setEditingWeight(true);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Wearable Activity Section (Steps, Heart Rate, Active Calories Burned) */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Wearable Activity Telemetry
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Source: {sourceLabels[metric.wearableSource] || 'App Activity'} · Apple Watch, Fitbit, Garmin &amp; BLE Heart Rate
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenWearableSync}
            className="min-h-[44px] px-4 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white text-xs font-semibold flex items-center justify-center gap-2 whitespace-nowrap shrink-0 transition-colors"
          >
            <Watch className="w-4 h-4" />
            Sync Wearable Device
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>Daily Steps</span>
              <Footprints className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
              {metric.steps.toLocaleString()}
            </p>
            <div className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
              <div
                className="h-full rounded-full bg-blue-600"
                style={{
                  width: `${Math.min(100, (metric.steps / Math.max(1, profile.dailyStepGoal)) * 100)}%`,
                }}
              />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
              Goal: {profile.dailyStepGoal.toLocaleString()} steps
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>Heart Rate</span>
              <HeartPulse className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            </div>
            <p className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
              {liveHeartRate
                ? `${liveHeartRate} bpm`
                : metric.restingHeartRate > 0
                ? `${metric.restingHeartRate} bpm`
                : metric.avgHeartRate > 0
                ? `${metric.avgHeartRate} bpm`
                : '-- bpm'}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {liveHeartRate
                ? 'Live Bluetooth sensor stream'
                : metric.restingHeartRate > 0
                ? `Resting HR · Avg ${metric.avgHeartRate || '--'} bpm`
                : 'Connect Fitbit, Apple Health, Garmin, or BLE'}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>Active Calories Burned</span>
              <Flame className="w-4 h-4 text-orange-500" />
            </div>
            <p className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
              {totalActiveBurn.toLocaleString()} kcal
            </p>
            <div className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
              <div
                className="h-full rounded-full bg-orange-500"
                style={{
                  width: `${Math.min(
                    100,
                    (totalActiveBurn / Math.max(1, profile.dailyActiveCaloriesGoal)) * 100
                  )}%`,
                }}
              />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
              Goal: {profile.dailyActiveCaloriesGoal} kcal
            </p>
          </div>
        </div>
      </div>

      {/* 7-Day Visual Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 7-Day Calorie Intake vs Goal */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                7-Day Calorie Intake
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Target {profile.dailyCalorieGoal} kcal / day
              </p>
            </div>
            <Activity className="w-4 h-4 text-blue-600" />
          </div>

          <div className="relative h-44 flex items-end gap-2 pt-6">
            {/* Goal Dashed Line */}
            <div
              className="absolute left-0 right-0 border-t border-dashed border-blue-500/60 pointer-events-none"
              style={{
                bottom: `${Math.min(95, (profile.dailyCalorieGoal / maxCalChart) * 100)}%`,
              }}
            />
            {weeklyChartData.map((d) => {
              const heightPct = Math.max(4, (d.calories / maxCalChart) * 100);
              const isActive = d.dateKey === selectedDateKey;
              return (
                <button
                  key={d.dateKey}
                  type="button"
                  onClick={() => onSelectDateKey(d.dateKey)}
                  className="flex-1 flex flex-col items-center gap-1.5 group h-full justify-end"
                >
                  <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 opacity-90">
                    {d.calories > 0 ? d.calories : ''}
                  </span>
                  <div className="w-full max-w-[34px] flex-1 flex items-end">
                    <div
                      className={`w-full rounded-t-lg transition-all ${
                        isActive
                          ? 'bg-blue-600'
                          : d.calories > profile.dailyCalorieGoal
                          ? 'bg-amber-500/80 group-hover:bg-amber-500'
                          : 'bg-slate-200 dark:bg-slate-700 group-hover:bg-blue-400'
                      }`}
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>
                  <span
                    className={`text-[11px] font-medium ${
                      isActive ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-slate-500'
                    }`}
                  >
                    {d.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 7-Day Steps & Workout Minutes */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                7-Day Steps &amp; Training Minutes
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Daily step goal {profile.dailyStepGoal.toLocaleString()}
              </p>
            </div>
            <Footprints className="w-4 h-4 text-emerald-600" />
          </div>

          <div className="relative h-44 flex items-end gap-2 pt-6">
            {weeklyChartData.map((d) => {
              const stepHeight = Math.max(4, (d.steps / maxStepChart) * 100);
              const isActive = d.dateKey === selectedDateKey;
              return (
                <button
                  key={d.dateKey}
                  type="button"
                  onClick={() => onSelectDateKey(d.dateKey)}
                  className="flex-1 flex flex-col items-center gap-1.5 group h-full justify-end"
                >
                  <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">
                    {d.workoutMinutes > 0 ? `${d.workoutMinutes}m` : ''}
                  </span>
                  <div className="w-full max-w-[34px] flex-1 flex items-end">
                    <div
                      className={`w-full rounded-t-lg transition-all ${
                        isActive
                          ? 'bg-emerald-600'
                          : 'bg-emerald-200 dark:bg-emerald-900/60 group-hover:bg-emerald-500'
                      }`}
                      style={{ height: `${stepHeight}%` }}
                    />
                  </div>
                  <span
                    className={`text-[11px] font-medium ${
                      isActive ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-500'
                    }`}
                  >
                    {d.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Completed Workouts */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Recent Training Sessions
          </h3>
          <button
            type="button"
            onClick={onGoToWorkouts}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
          >
            All Programs
          </button>
        </div>

        {workoutSessions.length === 0 ? (
          <div className="py-8 text-center space-y-2">
            <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">
              No workouts logged yet
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Start a pre-built program or build your own routine to track volume and progress.
            </p>
          </div>
        ) : (
          <>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {(showAllSessions ? workoutSessions : workoutSessions.slice(0, 5)).map((sess) => {
                const isConfirming = confirmDeleteSessionId === sess.id;
                return (
                  <div
                    key={sess.id}
                    className="py-3 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                        {sess.programTitle}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {sess.dateKey} · {sess.completedSets} sets · {sess.durationMinutes} min
                      </p>
                    </div>
                    <div className="flex items-center gap-2.5 shrink-0">
                      <div className="text-right">
                        <p className="text-sm font-bold font-mono text-slate-900 dark:text-white">
                          {sess.caloriesBurned} kcal
                        </p>
                        <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                          {isImperial
                            ? `${Math.round(sess.totalVolumeKg * 2.20462).toLocaleString()} lbs`
                            : `${sess.totalVolumeKg.toLocaleString()} kg`}{' '}
                          vol
                        </p>
                      </div>

                      {isConfirming ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              onDeleteWorkoutSession(sess.id);
                              setConfirmDeleteSessionId(null);
                            }}
                            className="min-h-[34px] px-2.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-colors"
                          >
                            Delete
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteSessionId(null)}
                            className="min-h-[34px] px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteSessionId(sess.id)}
                          aria-label={`Delete ${sess.programTitle} session on ${sess.dateKey}`}
                          title="Delete training session"
                          className="min-h-[38px] min-w-[38px] rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center justify-center transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {workoutSessions.length > 5 && (
              <div className="pt-1 flex justify-center">
                <button
                  type="button"
                  onClick={() => setShowAllSessions((v) => !v)}
                  className="min-h-[36px] px-3 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  {showAllSessions
                    ? 'Show recent 5 sessions'
                    : `Show all ${workoutSessions.length} sessions`}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
