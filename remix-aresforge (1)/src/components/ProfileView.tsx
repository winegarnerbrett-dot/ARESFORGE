import React, { useEffect, useMemo, useState } from 'react';
import type { User } from 'firebase/auth';
import {
  AlertTriangle,
  Check,
  Cloud,
  Download,
  FileText,
  HelpCircle,
  Loader2,
  Lock,
  LogIn,
  LogOut,
  Monitor,
  Moon,
  Sun,
  Trash2,
  Watch,
  X,
} from 'lucide-react';
import aresForgeCrestUrl from '../assets/images/aresforge_tactical_crest_1794714160036.jpg';
import { EXPERIENCE_LEVEL_GUIDE } from '../data/programs';
import {
  ACTIVITY_LEVEL_OPTIONS,
  NUTRITION_GOAL_OPTIONS,
  computeNutritionRecommendation,
  deriveMacroPercentagesFromGrams,
  macrosFromPercentages,
  normalizeMacroPercentages,
  type MacroPercentages,
} from '../lib/nutritionCoach';
import type {
  ActivityLevel,
  BiologicalSex,
  DailyMetric,
  ExperienceLevel,
  NutritionGoal,
  ThemePreference,
  UserProfile,
  WorkoutSession,
} from '../types/fitness';
import type { LegalSection } from './LegalSupportView';
import { MacroPercentageEditor } from './MacroPercentageEditor';
import { PWAInstallButton } from './PWAInstallButton';

interface ProfileViewProps {
  profile: UserProfile;
  user: User | null;
  themePreference: ThemePreference;
  systemPrefersDark: boolean;
  dailyMetrics: Record<string, DailyMetric>;
  workoutSessions: WorkoutSession[];
  selectedDateKey: string;
  authNotice?: { type: 'success' | 'error'; text: string } | null;
  onChangeThemePreference: (next: ThemePreference) => void;
  onSaveProfile: (next: UserProfile) => void;
  onSignIn: () => void;
  onSignOut: () => void;
  onExportUserData: () => void;
  onResetLocalData: () => Promise<void> | void;
  onDeleteAccount: () => Promise<void>;
  onOpenLegalSection: (section: LegalSection) => void;
  onOpenWearableSync: () => void;
}

interface NumericDrafts {
  dailyCalorieGoal: string;
  weeklyWorkoutGoal: string;
  dailyStepGoal: string;
  dailyActiveCaloriesGoal: string;
  waterLiters: string;
  targetWeight: string;
  height: string;
  age: string;
}

function formatDisplayWeight(kg: number, unitSystem: UserProfile['unitSystem']): number {
  return unitSystem === 'imperial'
    ? Math.round(kg * 2.20462 * 10) / 10
    : Math.round(kg * 10) / 10;
}

function formatDisplayHeight(cm: number, unitSystem: UserProfile['unitSystem']): number {
  const safeCm = cm || 175;
  return unitSystem === 'imperial' ? Math.round(safeCm / 2.54) : Math.round(safeCm);
}

function draftsFromProfile(p: UserProfile): NumericDrafts {
  return {
    dailyCalorieGoal: String(p.dailyCalorieGoal || 2200),
    weeklyWorkoutGoal: String(p.weeklyWorkoutGoal || 4),
    dailyStepGoal: String(p.dailyStepGoal || 10000),
    dailyActiveCaloriesGoal: String(p.dailyActiveCaloriesGoal || 500),
    waterLiters: String(Math.round((p.dailyWaterGoalMl || 2500) / 10) / 100),
    targetWeight: String(formatDisplayWeight(p.targetWeightKg || 72, p.unitSystem)),
    height: String(formatDisplayHeight(p.heightCm || 175, p.unitSystem)),
    age: String(p.age || 30),
  };
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  profile,
  user,
  themePreference,
  systemPrefersDark,
  dailyMetrics,
  workoutSessions,
  selectedDateKey,
  authNotice,
  onChangeThemePreference,
  onSaveProfile,
  onSignIn,
  onSignOut,
  onExportUserData,
  onResetLocalData,
  onDeleteAccount,
  onOpenLegalSection,
  onOpenWearableSync,
}) => {
  const [form, setForm] = useState<UserProfile>(profile);
  const [drafts, setDrafts] = useState<NumericDrafts>(() => draftsFromProfile(profile));
  const [savedNotice, setSavedNotice] = useState(false);
  const [confirmMode, setConfirmMode] = useState<'local' | 'account' | null>(null);
  const [confirmChecked, setConfirmChecked] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    setForm(profile);
    setDrafts(draftsFromProfile(profile));
  }, [profile]);

  const recommendation = useMemo(
    () =>
      computeNutritionRecommendation({
        profile: form,
        dailyMetrics,
        workoutSessions,
        referenceDateKey: selectedDateKey,
      }),
    [form, dailyMetrics, workoutSessions, selectedDateKey]
  );

  const activeMacroPercentages: MacroPercentages = useMemo(() => {
    if (
      form.macroMode === 'custom' &&
      form.macroProteinPct !== undefined &&
      form.macroCarbsPct !== undefined &&
      form.macroFatPct !== undefined
    ) {
      return normalizeMacroPercentages({
        proteinPct: form.macroProteinPct,
        carbsPct: form.macroCarbsPct,
        fatPct: form.macroFatPct,
      });
    }
    if (form.macroMode !== 'custom') {
      return {
        proteinPct: recommendation.recommendedMacros.proteinPct,
        carbsPct: recommendation.recommendedMacros.carbsPct,
        fatPct: recommendation.recommendedMacros.fatPct,
      };
    }
    return deriveMacroPercentagesFromGrams(
      form.dailyProteinGoal,
      form.dailyCarbsGoal,
      form.dailyFatGoal
    );
  }, [
    form.macroMode,
    form.macroProteinPct,
    form.macroCarbsPct,
    form.macroFatPct,
    form.dailyProteinGoal,
    form.dailyCarbsGoal,
    form.dailyFatGoal,
    recommendation.recommendedMacros,
  ]);

  const isImperial = form.unitSystem === 'imperial';
  const weightUnit = isImperial ? 'lbs' : 'kg';
  const toKg = (val: number, unit: UserProfile['unitSystem'] = form.unitSystem) =>
    unit === 'imperial' ? val / 2.20462 : val;

  const applyCaloriesToForm = (baseForm: UserProfile, nextCalories: number): UserProfile => {
    const safeCalories = Math.max(800, Math.min(10000, Math.round(nextCalories)));
    const nextGrams = macrosFromPercentages(safeCalories, activeMacroPercentages);
    return {
      ...baseForm,
      dailyCalorieGoal: safeCalories,
      dailyProteinGoal: nextGrams.proteinG,
      dailyCarbsGoal: nextGrams.carbsG,
      dailyFatGoal: nextGrams.fatG,
      macroProteinPct: activeMacroPercentages.proteinPct,
      macroCarbsPct: activeMacroPercentages.carbsPct,
      macroFatPct: activeMacroPercentages.fatPct,
    };
  };

  const commitAllDrafts = (currentForm: UserProfile, currentDrafts: NumericDrafts): UserProfile => {
    const calRaw = Number(currentDrafts.dailyCalorieGoal);
    const safeCal =
      currentDrafts.dailyCalorieGoal.trim() !== '' && Number.isFinite(calRaw)
        ? Math.max(800, Math.min(10000, Math.round(calRaw)))
        : currentForm.dailyCalorieGoal || 2200;

    const wkRaw = Number(currentDrafts.weeklyWorkoutGoal);
    const safeWk =
      currentDrafts.weeklyWorkoutGoal.trim() !== '' && Number.isFinite(wkRaw)
        ? Math.max(1, Math.min(14, Math.round(wkRaw)))
        : currentForm.weeklyWorkoutGoal || 4;

    const stepsRaw = Number(currentDrafts.dailyStepGoal);
    const safeSteps =
      currentDrafts.dailyStepGoal.trim() !== '' && Number.isFinite(stepsRaw)
        ? Math.max(1000, Math.min(100000, Math.round(stepsRaw)))
        : currentForm.dailyStepGoal || 10000;

    const actRaw = Number(currentDrafts.dailyActiveCaloriesGoal);
    const safeAct =
      currentDrafts.dailyActiveCaloriesGoal.trim() !== '' && Number.isFinite(actRaw)
        ? Math.max(100, Math.min(5000, Math.round(actRaw)))
        : currentForm.dailyActiveCaloriesGoal || 500;

    const waterRaw = Number(currentDrafts.waterLiters);
    const safeWaterMl =
      currentDrafts.waterLiters.trim() !== '' && Number.isFinite(waterRaw)
        ? Math.round(Math.max(0.5, Math.min(10, waterRaw)) * 1000)
        : currentForm.dailyWaterGoalMl || 2500;

    const wtRaw = Number(currentDrafts.targetWeight);
    const safeWeightKg =
      currentDrafts.targetWeight.trim() !== '' && Number.isFinite(wtRaw) && wtRaw > 0
        ? Math.max(25, Math.min(350, toKg(wtRaw, currentForm.unitSystem)))
        : currentForm.targetWeightKg || 72;

    const htRaw = Number(currentDrafts.height);
    const htCm =
      currentDrafts.height.trim() !== '' && Number.isFinite(htRaw)
        ? currentForm.unitSystem === 'imperial'
          ? Math.round(htRaw * 2.54)
          : Math.round(htRaw)
        : currentForm.heightCm || 175;
    const safeHeightCm = Math.max(100, Math.min(250, htCm));

    const ageRaw = Number(currentDrafts.age);
    const safeAge =
      currentDrafts.age.trim() !== '' && Number.isFinite(ageRaw)
        ? Math.max(13, Math.min(110, Math.round(ageRaw)))
        : currentForm.age || 30;

    return applyCaloriesToForm(
      {
        ...currentForm,
        weeklyWorkoutGoal: safeWk,
        dailyStepGoal: safeSteps,
        dailyActiveCaloriesGoal: safeAct,
        dailyWaterGoalMl: safeWaterMl,
        targetWeightKg: safeWeightKg,
        heightCm: safeHeightCm,
        age: safeAge,
      },
      safeCal
    );
  };

  const handleBlurField = () => {
    const committed = commitAllDrafts(form, drafts);
    setForm(committed);
    setDrafts(draftsFromProfile(committed));
  };

  const handleChangeMacroPercentages = (nextPcts: MacroPercentages) => {
    const nextGrams = macrosFromPercentages(form.dailyCalorieGoal, nextPcts);
    setForm((f) => ({
      ...f,
      macroMode: 'custom',
      macroProteinPct: nextPcts.proteinPct,
      macroCarbsPct: nextPcts.carbsPct,
      macroFatPct: nextPcts.fatPct,
      dailyProteinGoal: nextGrams.proteinG,
      dailyCarbsGoal: nextGrams.carbsG,
      dailyFatGoal: nextGrams.fatG,
    }));
  };

  const handleResetToRecommendedMacros = () => {
    const rec = recommendation.recommendedMacros;
    const syncedGrams = macrosFromPercentages(form.dailyCalorieGoal, rec);
    setForm((f) => ({
      ...f,
      macroMode: 'recommended',
      macroProteinPct: rec.proteinPct,
      macroCarbsPct: rec.carbsPct,
      macroFatPct: rec.fatPct,
      dailyProteinGoal: syncedGrams.proteinG,
      dailyCarbsGoal: syncedGrams.carbsG,
      dailyFatGoal: syncedGrams.fatG,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const committed = commitAllDrafts(form, drafts);
    setForm(committed);
    setDrafts(draftsFromProfile(committed));
    onSaveProfile(committed);
    setSavedNotice(true);
    window.setTimeout(() => setSavedNotice(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
          Goals, Devices &amp; Sync
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Configure daily health targets, sync wearables, and install ARESFORGE on Apple or Android
        </p>
      </div>

      {/* Cloud Sync & Wearable Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Google Account Cloud Sync */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 flex flex-col justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Cross-Device Cloud Sync
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {user
                  ? `Signed in as ${user.displayName || user.email}. Synced across iOS, Android, and web.`
                  : 'Optional — sign in with Google to sync workouts, nutrition, and goals across devices. All core features work locally without an account.'}
              </p>
            </div>
          </div>

          {authNotice && (
            <div
              className={`rounded-xl px-3 py-2 text-xs font-medium ${
                authNotice.type === 'error'
                  ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60'
                  : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60'
              }`}
            >
              {authNotice.text}
            </div>
          )}

          {user ? (
            <button
              type="button"
              onClick={onSignOut}
              className="min-h-[44px] px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          ) : (
            <button
              type="button"
              onClick={onSignIn}
              className="min-h-[44px] px-4 rounded-xl bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 text-white text-xs font-semibold flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              Sign in with Google
            </button>
          )}
        </div>

        {/* Connected Wearables & Install App */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 flex flex-col justify-between gap-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <img
                src={aresForgeCrestUrl}
                alt="ARESFORGE tactical Spartan helmet and shield crest"
                referrerPolicy="no-referrer"
                className="w-11 h-11 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0 bg-slate-900"
              />
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  ARESFORGE Mobile &amp; Wearables
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Sync Apple Watch, Fitbit, Garmin, or install ARESFORGE directly onto your home screen.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={async () => {
                  try {
                    const res = await fetch('/pwa-512x512.png');
                    const blob = await res.blob();
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'aresforge-logo-512x512.png';
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                    URL.revokeObjectURL(url);
                  } catch {
                    // ignore download fallback error
                  }
                }}
                title="Download 512x512 PNG (Google Play Store Icon)"
                className="min-h-[34px] px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1 whitespace-nowrap"
              >
                <Download className="w-3.5 h-3.5" />
                512 PNG
              </button>
              <button
                type="button"
                onClick={async () => {
                  try {
                    const res = await fetch('/aresforge-logo-1024.jpg');
                    const blob = await res.blob();
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'aresforge-logo-1024x1024.jpg';
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                    URL.revokeObjectURL(url);
                  } catch {
                    // ignore download fallback error
                  }
                }}
                title="Download 1024x1024 High-Resolution Crest"
                className="min-h-[34px] px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1 whitespace-nowrap"
              >
                <Download className="w-3.5 h-3.5" />
                1024 HD
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={onOpenWearableSync}
              className="min-h-[48px] px-4 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white text-sm font-semibold flex items-center justify-center gap-2"
            >
              <Watch className="w-4 h-4" />
              Wearables
            </button>
            <PWAInstallButton variant="card" />
          </div>
        </div>
      </div>

      {/* Preferences & Goals Editor */}
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 space-y-5"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Daily Fitness &amp; Nutrition Targets
          </h2>

          <div className="flex flex-wrap items-center gap-2">
            <div
              className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800"
              role="group"
              aria-label="Appearance mode"
              title={
                themePreference === 'system'
                  ? `Following system (${systemPrefersDark ? 'Dark' : 'Light'})`
                  : `Manual ${themePreference} mode`
              }
            >
              {(
                [
                  {
                    id: 'system',
                    label: `System (${systemPrefersDark ? 'Dark' : 'Light'})`,
                    icon: Monitor,
                  },
                  { id: 'light', label: 'Light', icon: Sun },
                  { id: 'dark', label: 'Dark', icon: Moon },
                ] as const
              ).map((opt) => {
                const Icon = opt.icon;
                const active = themePreference === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => onChangeThemePreference(opt.id)}
                    className={`min-h-[34px] px-2.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                      active
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800">
              {(['imperial', 'metric'] as const).map((unit) => (
                <button
                  key={unit}
                  type="button"
                  onClick={() => {
                    const committed = commitAllDrafts(form, drafts);
                    const nextForm = { ...committed, unitSystem: unit };
                    setForm(nextForm);
                    setDrafts(draftsFromProfile(nextForm));
                  }}
                  className={`min-h-[34px] px-3 rounded-lg text-xs font-semibold ${
                    form.unitSystem === unit
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {unit === 'imperial' ? 'lbs / oz' : 'kg / L'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold text-slate-800 dark:text-slate-100">
              Training Experience Level
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              {EXPERIENCE_LEVEL_GUIDE[form.experienceLevel || 'Intermediate']}
            </p>
          </div>
          <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-700 shrink-0 self-start sm:self-auto">
            {(['Beginner', 'Intermediate', 'Advanced'] as ExperienceLevel[]).map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => setForm((f) => ({ ...f, experienceLevel: level }))}
                className={`min-h-[36px] px-3 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
                  form.experienceLevel === level
                    ? 'bg-slate-900 text-white dark:bg-blue-600'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
              Display Name
            </label>
            <input
              type="text"
              maxLength={60}
              value={form.displayName}
              onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))}
              className="w-full min-h-[44px] px-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
              Daily Calories (kcal)
            </label>
            <input
              type="number"
              inputMode="numeric"
              min={800}
              max={10000}
              value={drafts.dailyCalorieGoal}
              onChange={(e) => {
                const raw = e.target.value;
                setDrafts((d) => ({ ...d, dailyCalorieGoal: raw }));
                const parsed = Number(raw);
                if (raw.trim() !== '' && Number.isFinite(parsed) && parsed >= 800 && parsed <= 10000) {
                  setForm((f) => applyCaloriesToForm(f, parsed));
                }
              }}
              onBlur={handleBlurField}
              className="w-full min-h-[44px] px-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-mono text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
              Weekly Workout Goal
            </label>
            <input
              type="number"
              inputMode="numeric"
              min={1}
              max={14}
              value={drafts.weeklyWorkoutGoal}
              onChange={(e) => {
                const raw = e.target.value;
                setDrafts((d) => ({ ...d, weeklyWorkoutGoal: raw }));
                const parsed = Number(raw);
                if (raw.trim() !== '' && Number.isFinite(parsed) && parsed >= 1 && parsed <= 14) {
                  setForm((f) => ({ ...f, weeklyWorkoutGoal: Math.round(parsed) }));
                }
              }}
              onBlur={handleBlurField}
              className="w-full min-h-[44px] px-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-mono text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
              Daily Step Goal
            </label>
            <input
              type="number"
              inputMode="numeric"
              min={1000}
              max={100000}
              step={1}
              value={drafts.dailyStepGoal}
              onChange={(e) => {
                const raw = e.target.value;
                setDrafts((d) => ({ ...d, dailyStepGoal: raw }));
                const parsed = Number(raw);
                if (raw.trim() !== '' && Number.isFinite(parsed) && parsed >= 1000 && parsed <= 100000) {
                  setForm((f) => ({ ...f, dailyStepGoal: Math.round(parsed) }));
                }
              }}
              onBlur={handleBlurField}
              className="w-full min-h-[44px] px-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-mono text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
              Active Calories Goal (kcal)
            </label>
            <input
              type="number"
              inputMode="numeric"
              min={100}
              max={5000}
              step={1}
              value={drafts.dailyActiveCaloriesGoal}
              onChange={(e) => {
                const raw = e.target.value;
                setDrafts((d) => ({ ...d, dailyActiveCaloriesGoal: raw }));
                const parsed = Number(raw);
                if (raw.trim() !== '' && Number.isFinite(parsed) && parsed >= 100 && parsed <= 5000) {
                  setForm((f) => ({ ...f, dailyActiveCaloriesGoal: Math.round(parsed) }));
                }
              }}
              onBlur={handleBlurField}
              className="w-full min-h-[44px] px-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-mono text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
              Water Goal (L)
            </label>
            <input
              type="number"
              inputMode="decimal"
              min={0.5}
              max={10}
              step="any"
              value={drafts.waterLiters}
              onChange={(e) => {
                const raw = e.target.value;
                setDrafts((d) => ({ ...d, waterLiters: raw }));
                const parsed = Number(raw);
                if (raw.trim() !== '' && Number.isFinite(parsed) && parsed >= 0.5 && parsed <= 10) {
                  setForm((f) => ({ ...f, dailyWaterGoalMl: Math.round(parsed * 1000) }));
                }
              }}
              onBlur={handleBlurField}
              className="w-full min-h-[44px] px-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-mono text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
              Target Weight ({weightUnit})
            </label>
            <input
              type="number"
              inputMode="decimal"
              step="any"
              value={drafts.targetWeight}
              onChange={(e) => {
                const raw = e.target.value;
                setDrafts((d) => ({ ...d, targetWeight: raw }));
                const parsed = Number(raw);
                if (raw.trim() !== '' && Number.isFinite(parsed)) {
                  const kg = toKg(parsed);
                  if (kg >= 25 && kg <= 350) {
                    setForm((f) => ({ ...f, targetWeightKg: kg }));
                  }
                }
              }}
              onBlur={handleBlurField}
              className="w-full min-h-[44px] px-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-mono text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
              Height ({isImperial ? 'inches' : 'cm'})
            </label>
            <input
              type="number"
              inputMode="numeric"
              min={isImperial ? 40 : 100}
              max={isImperial ? 98 : 250}
              value={drafts.height}
              onChange={(e) => {
                const raw = e.target.value;
                setDrafts((d) => ({ ...d, height: raw }));
                const parsed = Number(raw);
                if (raw.trim() !== '' && Number.isFinite(parsed)) {
                  const cm = isImperial ? Math.round(parsed * 2.54) : Math.round(parsed);
                  if (cm >= 100 && cm <= 250) {
                    setForm((f) => ({ ...f, heightCm: cm }));
                  }
                }
              }}
              onBlur={handleBlurField}
              className="w-full min-h-[44px] px-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-mono text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
              Age (years)
            </label>
            <input
              type="number"
              inputMode="numeric"
              min={13}
              max={110}
              value={drafts.age}
              onChange={(e) => {
                const raw = e.target.value;
                setDrafts((d) => ({ ...d, age: raw }));
                const parsed = Number(raw);
                if (raw.trim() !== '' && Number.isFinite(parsed) && parsed >= 13 && parsed <= 110) {
                  setForm((f) => ({ ...f, age: Math.round(parsed) }));
                }
              }}
              onBlur={handleBlurField}
              className="w-full min-h-[44px] px-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-mono text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
              BMR Profile
            </label>
            <select
              value={form.biologicalSex || 'neutral'}
              onChange={(e) =>
                setForm((f) => ({ ...f, biologicalSex: e.target.value as BiologicalSex }))
              }
              className="w-full min-h-[44px] px-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="neutral">Neutral</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
              Activity Level
            </label>
            <select
              value={form.activityLevel || 'moderate'}
              onChange={(e) =>
                setForm((f) => ({ ...f, activityLevel: e.target.value as ActivityLevel }))
              }
              className="w-full min-h-[44px] px-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white"
            >
              {ACTIVITY_LEVEL_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
              Nutrition Goal
            </label>
            <select
              value={form.nutritionGoal || 'recomp'}
              onChange={(e) =>
                setForm((f) => ({ ...f, nutritionGoal: e.target.value as NutritionGoal }))
              }
              className="w-full min-h-[44px] px-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white"
            >
              {NUTRITION_GOAL_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <MacroPercentageEditor
          calories={form.dailyCalorieGoal}
          percentages={activeMacroPercentages}
          recommendedMacros={recommendation.recommendedMacros}
          goalLabel={recommendation.goalOption.label}
          isCustom={form.macroMode === 'custom'}
          onChangePercentages={handleChangeMacroPercentages}
          onResetToRecommended={handleResetToRecommendedMacros}
        />

        <div className="flex items-center justify-end gap-3 pt-2">
          {savedNotice && (
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <Check className="w-4 h-4" />
              Goals updated
            </span>
          )}
          <button
            type="submit"
            className="min-h-[44px] px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors"
          >
            Save Goals
          </button>
        </div>
      </form>

      {/* Privacy, Legal, Data Export & Account Deletion */}
      <section className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 space-y-4">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Privacy, Data &amp; Support
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Review privacy disclosures, safety disclaimers, export your records, or permanently delete your data.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <button
            type="button"
            onClick={() => onOpenLegalSection('privacy')}
            className="min-h-[44px] px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center gap-2"
          >
            <Lock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            Privacy Policy
          </button>
          <button
            type="button"
            onClick={() => onOpenLegalSection('terms')}
            className="min-h-[44px] px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center gap-2"
          >
            <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            Terms &amp; Safety
          </button>
          <button
            type="button"
            onClick={() => onOpenLegalSection('support')}
            className="min-h-[44px] px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center gap-2"
          >
            <HelpCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            Support &amp; Help
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <button
            type="button"
            onClick={onExportUserData}
            className="min-h-[44px] px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export My Data (JSON)
          </button>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                setDeleteError(null);
                setConfirmChecked(false);
                setConfirmMode('local');
              }}
              className="min-h-[44px] px-4 rounded-xl border border-rose-200 dark:border-rose-900/70 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Clear Local Data
            </button>

            {user && (
              <button
                type="button"
                onClick={() => {
                  setDeleteError(null);
                  setConfirmChecked(false);
                  setConfirmMode('account');
                }}
                className="min-h-[44px] px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete Account &amp; Data
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Confirmation Modal for Local Wipe or Permanent Account Deletion */}
      {confirmMode && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/75 backdrop-blur-sm p-0 sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-label={confirmMode === 'account' ? 'Delete Account Confirmation' : 'Clear Local Data Confirmation'}
        >
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-5 sm:p-6 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {confirmMode === 'account'
                      ? 'Permanently Delete Account?'
                      : 'Clear Local Device Data?'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    This action cannot be undone.
                  </p>
                </div>
              </div>
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setConfirmMode(null)}
                aria-label="Cancel deletion"
                className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {confirmMode === 'account'
                ? 'This will permanently delete your ARESFORGE account, profile goals, custom workout programs, workout history, nutrition logs, and daily metrics from both cloud sync and this device.'
                : 'This will remove all locally cached workouts, custom programs, nutrition logs, and preferences from this device. If you are signed in, cloud records stay safe until you sign out or delete your account.'}
            </p>

            <label className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={confirmChecked}
                onChange={(e) => setConfirmChecked(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 text-rose-600 focus:ring-rose-500"
              />
              <span className="text-xs text-slate-700 dark:text-slate-200 font-medium">
                {confirmMode === 'account'
                  ? 'I understand my account and all cloud & local records will be permanently deleted.'
                  : 'I understand all locally cached device data will be cleared.'}
              </span>
            </label>

            {deleteError && (
              <div className="rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 px-3 py-2 text-xs text-rose-700 dark:text-rose-300">
                {deleteError}
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-1">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setConfirmMode(null)}
                className="min-h-[44px] px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!confirmChecked || isDeleting}
                onClick={async () => {
                  setIsDeleting(true);
                  setDeleteError(null);
                  try {
                    if (confirmMode === 'account') {
                      await onDeleteAccount();
                    } else {
                      await onResetLocalData();
                    }
                    setConfirmMode(null);
                  } catch (err) {
                    setDeleteError(
                      err instanceof Error
                        ? err.message
                        : 'Could not complete deletion. Please try again.'
                    );
                  } finally {
                    setIsDeleting(false);
                  }
                }}
                className="min-h-[44px] px-5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-2"
              >
                {isDeleting && <Loader2 className="w-4 h-4 animate-spin" />}
                {confirmMode === 'account' ? 'Permanently Delete' : 'Clear Local Data'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
