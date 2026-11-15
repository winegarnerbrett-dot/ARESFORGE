import React, { useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import {
  Dumbbell,
  LayoutDashboard,
  ScanBarcode,
  ShieldCheck,
  User as UserIcon,
  Utensils,
  WifiOff,
} from 'lucide-react';
import aresForgeCrestUrl from './assets/images/aresforge_tactical_crest_1794714160036.jpg';
import { BarcodeScannerModal } from './components/BarcodeScannerModal';
import { CustomProgramModal } from './components/CustomProgramModal';
import { ExerciseSwapModal } from './components/ExerciseSwapModal';
import { ExerciseVideoDemoModal } from './components/ExerciseVideoDemo';
import { LegalSupportModal, LegalSupportView, type LegalSection } from './components/LegalSupportView';
import { NutritionView } from './components/NutritionView';
import { ProfileView } from './components/ProfileView';
import { ProgressDashboard } from './components/ProgressDashboard';
import { WearableSyncModal } from './components/WearableSyncPanel';
import { WorkoutPlayerModal } from './components/WorkoutPlayerModal';
import { WorkoutsView } from './components/WorkoutsView';
import { AFT_PROGRAMS, EXERCISE_LIBRARY, PRE_EXISTING_PROGRAMS } from './data/programs';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import {
  createNutritionEntry,
  createWorkoutSession,
  deleteCustomProgram,
  deleteNutritionEntry,
  deleteUserAccountAndData,
  deleteWorkoutSession,
  ensureUserProfile,
  saveCustomProgram,
  saveUserProfile,
  signInWithGoogle,
  signOutAccount,
  subscribeAuth,
  subscribeCustomPrograms,
  subscribeDailyMetrics,
  subscribeNutritionLogs,
  subscribeProgramPreferences,
  subscribeUserProfile,
  subscribeWorkoutSessions,
  updateNutritionEntry,
  upsertDailyMetric,
  upsertProgramPreference,
} from './lib/firebase';
import { buildNormalizedNutritionEntry } from './lib/servingUtils';
import type { BluetoothHRConnection, ParsedWearableDay } from './lib/wearables';
import type {
  DailyMetric,
  ExerciseLibraryItem,
  ExperienceLevel,
  FoodCatalogProduct,
  MealType,
  MovementPattern,
  NutritionEntry,
  ProgramDay,
  ProgramExercise,
  ProgramPreference,
  RotationDays,
  ThemePreference,
  UserProfile,
  WearableSource,
  WorkoutDurationOption,
  WorkoutProgram,
  WorkoutSession,
} from './types/fitness';

type TabKey = 'dashboard' | 'workouts' | 'nutrition' | 'profile';

function getTodayKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
    now.getDate()
  ).padStart(2, '0')}`;
}

const DEFAULT_PROFILE: UserProfile = {
  uid: 'local',
  displayName: 'Athlete',
  dailyCalorieGoal: 2200,
  dailyProteinGoal: 165,
  dailyCarbsGoal: 230,
  dailyFatGoal: 70,
  macroMode: 'recommended',
  weeklyWorkoutGoal: 4,
  dailyWaterGoalMl: 2500,
  dailyStepGoal: 10000,
  dailyActiveCaloriesGoal: 500,
  targetWeightKg: 72,
  currentWeightKg: 75,
  heightCm: 175,
  age: 30,
  biologicalSex: 'neutral',
  activityLevel: 'moderate',
  nutritionGoal: 'lose_weight',
  unitSystem: 'imperial',
  experienceLevel: 'Intermediate',
};

function readLocal<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export default function App() {
  const isOnline = useOnlineStatus();
  const [activeTab, setActiveTab] = useState<TabKey>(() => {
    if (typeof window === 'undefined') return 'dashboard';
    const tab = new URLSearchParams(window.location.search).get('tab');
    if (tab === 'dashboard' || tab === 'workouts' || tab === 'nutrition' || tab === 'profile') {
      return tab;
    }
    return 'dashboard';
  });
  const [selectedDateKey, setSelectedDateKey] = useState<string>(getTodayKey);
  const [themePreference, setThemePreference] = useState<ThemePreference>(() => {
    try {
      const saved = localStorage.getItem('aresforge_theme_preference');
      if (saved === 'light' || saved === 'dark' || saved === 'system') return saved;
    } catch {
      // ignore storage errors
    }
    return 'system';
  });
  const [systemPrefersDark, setSystemPrefersDark] = useState<boolean>(() =>
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
      : false
  );

  // Auth & Sync State
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);

  // Domain Data State (instant localStorage hydration + Firestore live sync when authenticated)
  const [profile, setProfile] = useState<UserProfile>(() => ({
    ...DEFAULT_PROFILE,
    ...readLocal<Partial<UserProfile>>('forma_profile', {}),
  }));
  const [customPrograms, setCustomPrograms] = useState<WorkoutProgram[]>(() =>
    readLocal('forma_custom_programs', [])
  );
  const [programPrefs, setProgramPrefs] = useState<Record<string, ProgramPreference>>(() =>
    readLocal('forma_program_prefs', {})
  );
  const [dailyDurationOverrides, setDailyDurationOverrides] = useState<
    Record<string, WorkoutDurationOption>
  >(() => readLocal('forma_daily_duration_overrides', {}));
  const [workoutSessions, setWorkoutSessions] = useState<WorkoutSession[]>(() =>
    readLocal('forma_workout_sessions', [])
  );
  const [nutritionLogs, setNutritionLogs] = useState<NutritionEntry[]>(() =>
    readLocal('forma_nutrition_logs', [])
  );
  const [dailyMetrics, setDailyMetrics] = useState<Record<string, DailyMetric>>(() =>
    readLocal('forma_daily_metrics', {})
  );

  // Active Modals
  const [scannerMeal, setScannerMeal] = useState<MealType | null>(() => {
    if (typeof window === 'undefined') return null;
    const scan = new URLSearchParams(window.location.search).get('scan');
    return scan === '1' ? 'lunch' : null;
  });
  const [editingProgram, setEditingProgram] = useState<WorkoutProgram | null | undefined>(undefined);
  const [activeWorkout, setActiveWorkout] = useState<{
    program: WorkoutProgram;
    day: ProgramDay;
  } | null>(null);
  const [videoDemo, setVideoDemo] = useState<{
    name: string;
    exerciseId?: string;
    pattern?: MovementPattern;
  } | null>(null);
  const [swapTarget, setSwapTarget] = useState<{
    program: WorkoutProgram;
    exercise: ProgramExercise;
  } | null>(null);
  const [showWearableModal, setShowWearableModal] = useState(false);
  const [legalModalSection, setLegalModalSection] = useState<LegalSection | null>(null);
  const [legalPathSection, setLegalPathSection] = useState<LegalSection | null>(() => {
    if (typeof window === 'undefined') return null;
    const p = window.location.pathname.toLowerCase();
    if (p === '/privacy' || p === '/privacy/') return 'privacy';
    if (p === '/terms' || p === '/terms/') return 'terms';
    if (p === '/support' || p === '/support/') return 'support';
    return null;
  });
  const [disclaimerAck, setDisclaimerAck] = useState<boolean>(() => {
    try {
      return localStorage.getItem('aresforge_disclaimer_ack') === '1';
    } catch {
      return false;
    }
  });
  const [authNotice, setAuthNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Live Bluetooth HR state
  const [liveHeartRate, setLiveHeartRate] = useState<number | null>(null);
  const [bleDeviceName, setBleDeviceName] = useState<string | null>(null);
  const [bleConn, setBleConn] = useState<BluetoothHRConnection | null>(null);

  useEffect(() => {
    const onPopState = () => {
      const p = window.location.pathname.toLowerCase();
      if (p === '/privacy' || p === '/privacy/') setLegalPathSection('privacy');
      else if (p === '/terms' || p === '/terms/') setLegalPathSection('terms');
      else if (p === '/support' || p === '/support/') setLegalPathSection('support');
      else setLegalPathSection(null);
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (event: MediaQueryListEvent) => {
      setSystemPrefersDark(event.matches);
    };
    setSystemPrefersDark(media.matches);
    if (typeof media.addEventListener === 'function') {
      media.addEventListener('change', handleChange);
      return () => media.removeEventListener('change', handleChange);
    }
    media.addListener(handleChange);
    return () => media.removeListener(handleChange);
  }, []);

  const isDarkMode =
    themePreference === 'dark' || (themePreference === 'system' && systemPrefersDark);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', isDarkMode);
    root.style.colorScheme = isDarkMode ? 'dark' : 'light';
    try {
      localStorage.setItem('aresforge_theme_preference', themePreference);
    } catch {
      // ignore storage errors
    }
    const themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (themeColorMeta) {
      themeColorMeta.setAttribute('content', isDarkMode ? '#020617' : '#F8FAFC');
    }
  }, [isDarkMode, themePreference]);

  // Persist local cache whenever state updates
  useEffect(() => {
    localStorage.setItem('forma_profile', JSON.stringify(profile));
  }, [profile]);
  useEffect(() => {
    localStorage.setItem('forma_custom_programs', JSON.stringify(customPrograms));
  }, [customPrograms]);
  useEffect(() => {
    localStorage.setItem('forma_program_prefs', JSON.stringify(programPrefs));
  }, [programPrefs]);
  useEffect(() => {
    localStorage.setItem('forma_daily_duration_overrides', JSON.stringify(dailyDurationOverrides));
  }, [dailyDurationOverrides]);
  useEffect(() => {
    localStorage.setItem('forma_workout_sessions', JSON.stringify(workoutSessions));
  }, [workoutSessions]);
  useEffect(() => {
    localStorage.setItem('forma_nutrition_logs', JSON.stringify(nutritionLogs));
  }, [nutritionLogs]);
  useEffect(() => {
    localStorage.setItem('forma_daily_metrics', JSON.stringify(dailyMetrics));
  }, [dailyMetrics]);

  // Subscribe to Firebase Auth
  useEffect(() => {
    const unsub = subscribeAuth((u) => {
      setUser(u);
      setAuthReady(true);
    });
    return () => unsub();
  }, []);

  // Subscribe to Firestore collections only when authenticated
  useEffect(() => {
    if (!authReady || !user) return;

    let cancelled = false;
    const unsubs: Array<() => void> = [];

    ensureUserProfile(user, profile).then(() => {
      if (cancelled) return;
      unsubs.push(
        subscribeUserProfile(user.uid, (remoteProfile) => {
          if (remoteProfile) setProfile(remoteProfile);
        })
      );
      unsubs.push(subscribeCustomPrograms(user.uid, setCustomPrograms));
      unsubs.push(subscribeProgramPreferences(user.uid, setProgramPrefs));
      unsubs.push(subscribeWorkoutSessions(user.uid, setWorkoutSessions));
      unsubs.push(subscribeNutritionLogs(user.uid, setNutritionLogs));
      unsubs.push(subscribeDailyMetrics(user.uid, setDailyMetrics));
    });

    return () => {
      cancelled = true;
      for (const u of unsubs) u();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authReady, user?.uid]);

  useEffect(() => {
    return () => {
      bleConn?.disconnect();
    };
  }, [bleConn]);

  const currentMetric: DailyMetric = dailyMetrics[selectedDateKey] || {
    dateKey: selectedDateKey,
    waterMl: 0,
    weightKg: profile.currentWeightKg,
    steps: 0,
    activeCalories: 0,
    restingHeartRate: 0,
    avgHeartRate: 0,
    wearableSource: 'manual',
  };

  // Handlers
  const handleSaveProfile = async (next: UserProfile) => {
    setProfile(next);
    if (user) {
      await saveUserProfile(user.uid, next);
    }
  };

  const handleChangeExperienceLevel = async (level: ExperienceLevel) => {
    const next = { ...profile, experienceLevel: level };
    setProfile(next);
    if (user) {
      await saveUserProfile(user.uid, next);
    }
  };

  const handleUpdateProgramPref = async (
    programId: string,
    patch: { rotationDays?: RotationDays; targetMinutes?: WorkoutDurationOption }
  ) => {
    const current = programPrefs[programId];
    const matchedProg = [...customPrograms, ...AFT_PROGRAMS, ...PRE_EXISTING_PROGRAMS].find(
      (p) => p.id === programId
    );
    const defaultRot = Math.min(7, Math.max(3, matchedProg?.daysPerWeek || 4)) as RotationDays;
    const rawMin = matchedProg?.estimatedMinutes || 45;
    const defaultDur: WorkoutDurationOption = rawMin <= 35 ? 30 : rawMin >= 55 ? 60 : 45;
    const nextPref: ProgramPreference = {
      programId,
      rotationDays: patch.rotationDays ?? current?.rotationDays ?? defaultRot,
      targetMinutes: patch.targetMinutes ?? current?.targetMinutes ?? defaultDur,
      exerciseSwaps: current?.exerciseSwaps,
    };
    setProgramPrefs((prev) => ({ ...prev, [programId]: nextPref }));
    if (user) {
      await upsertProgramPreference(user.uid, nextPref);
    }
  };

  const handleSwapProgramExercise = async (
    program: WorkoutProgram,
    exercise: ProgramExercise,
    replacement: ExerciseLibraryItem | null
  ) => {
    const swapKey = exercise.originalExerciseId || exercise.exerciseId || exercise.id;
    const current = programPrefs[program.id];
    const defaultRot = Math.min(7, Math.max(3, program.daysPerWeek || 4)) as RotationDays;
    const rawMin = program.estimatedMinutes || 45;
    const defaultDur: WorkoutDurationOption = rawMin <= 35 ? 30 : rawMin >= 55 ? 60 : 45;
    const updatedSwaps = { ...(current?.exerciseSwaps || {}) };
    if (replacement && replacement.id !== swapKey) {
      updatedSwaps[swapKey] = replacement.id;
    } else {
      delete updatedSwaps[swapKey];
    }
    const cleanedSwaps = Object.keys(updatedSwaps).length > 0 ? updatedSwaps : undefined;
    const nextPref: ProgramPreference = {
      programId: program.id,
      rotationDays: current?.rotationDays ?? defaultRot,
      targetMinutes: current?.targetMinutes ?? defaultDur,
      exerciseSwaps: cleanedSwaps,
    };
    setProgramPrefs((prev) => ({ ...prev, [program.id]: nextPref }));

    // If the user is mid-workout in WorkoutPlayerModal, update the live exercise cleanly too
    if (activeWorkout && activeWorkout.program.id === program.id) {
      const originalLib = EXERCISE_LIBRARY.find((e) => e.id === swapKey);
      setActiveWorkout((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          day: {
            ...prev.day,
            exercises: prev.day.exercises.map((ex) => {
              if (ex.id !== exercise.id) return ex;
              if (replacement) {
                const specialUnitReps =
                  /shuttle|goal pace|3rm|max in/i.test(ex.reps) || ex.pattern !== replacement.pattern;
                return {
                  ...ex,
                  exerciseId: replacement.id,
                  name: replacement.name,
                  muscleGroup: replacement.muscleGroup,
                  equipment: replacement.equipment,
                  pattern: replacement.pattern,
                  reps: specialUnitReps ? replacement.defaultReps : ex.reps,
                  originalExerciseId: swapKey,
                  replacedFromName: ex.replacedFromName || ex.name,
                };
              }
              if (originalLib) {
                return {
                  ...ex,
                  exerciseId: originalLib.id,
                  name: originalLib.name,
                  muscleGroup: originalLib.muscleGroup,
                  equipment: originalLib.equipment,
                  pattern: originalLib.pattern,
                  originalExerciseId: undefined,
                  replacedFromName: undefined,
                };
              }
              return {
                ...ex,
                originalExerciseId: undefined,
                replacedFromName: undefined,
              };
            }),
          },
        };
      });
    }

    if (user) {
      await upsertProgramPreference(user.uid, nextPref);
    }
  };

  const handleSaveProgram = async (program: WorkoutProgram, isNew: boolean) => {
    setCustomPrograms((prev) =>
      isNew ? [program, ...prev] : prev.map((p) => (p.id === program.id ? program : p))
    );
    const rot = Math.min(7, Math.max(3, program.daysPerWeek || 3)) as RotationDays;
    const dur: WorkoutDurationOption =
      program.estimatedMinutes <= 35 ? 30 : program.estimatedMinutes >= 55 ? 60 : 45;
    const nextPref: ProgramPreference = {
      programId: program.id,
      rotationDays: rot,
      targetMinutes: dur,
      exerciseSwaps: programPrefs[program.id]?.exerciseSwaps,
    };
    setProgramPrefs((prev) => ({ ...prev, [program.id]: nextPref }));
    if (user) {
      await saveCustomProgram(user.uid, program, isNew);
      await upsertProgramPreference(user.uid, nextPref);
    }
  };

  const handleDeleteProgram = async (programId: string) => {
    setCustomPrograms((prev) => prev.filter((p) => p.id !== programId));
    if (profile.activeProgramId === programId) {
      const nextProfile = { ...profile, activeProgramId: undefined };
      setProfile(nextProfile);
      if (user) {
        await saveUserProfile(user.uid, nextProfile);
      }
    }
    if (user) {
      await deleteCustomProgram(user.uid, programId);
    }
  };

  const handleStartWorkout = async (program: WorkoutProgram, day: ProgramDay) => {
    setActiveWorkout({ program, day });
    if (profile.activeProgramId !== program.id) {
      const nextProfile: UserProfile = { ...profile, activeProgramId: program.id };
      setProfile(nextProfile);
      if (user) {
        await saveUserProfile(user.uid, nextProfile);
      }
    }
  };

  const handleChangeDailyDuration = async (
    dateKey: string,
    programId: string,
    minutes: WorkoutDurationOption | null
  ) => {
    const key = `${dateKey}:${programId}`;
    setDailyDurationOverrides((prev) => {
      const next = { ...prev };
      if (minutes === null) {
        delete next[key];
      } else {
        next[key] = minutes;
      }
      return next;
    });

    const nextProfile: UserProfile =
      minutes === null
        ? {
            ...profile,
            activeDailyDurationDate:
              profile.activeDailyDurationDate === dateKey ? undefined : profile.activeDailyDurationDate,
            activeDailyDurationMinutes:
              profile.activeDailyDurationDate === dateKey ? undefined : profile.activeDailyDurationMinutes,
          }
        : {
            ...profile,
            activeDailyDurationDate: dateKey,
            activeDailyDurationMinutes: minutes,
          };
    setProfile(nextProfile);
    if (user) {
      await saveUserProfile(user.uid, nextProfile);
    }
  };

  const handleCompleteSession = async (session: WorkoutSession) => {
    setWorkoutSessions((prev) => [session, ...prev]);
    if (user) {
      await createWorkoutSession(user.uid, session);
    }
  };

  const handleDeleteWorkoutSession = async (sessionId: string) => {
    setWorkoutSessions((prev) => prev.filter((s) => s.id !== sessionId));
    if (user) {
      await deleteWorkoutSession(user.uid, sessionId);
    }
  };

  const handleAddFood = async (
    product: FoodCatalogProduct,
    servings: number,
    mealType: MealType
  ) => {
    const entry = buildNormalizedNutritionEntry({
      id: `food_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      dateKey: selectedDateKey,
      mealType,
      product,
      servings,
    });
    setNutritionLogs((prev) => [entry, ...prev]);
    if (user) {
      await createNutritionEntry(user.uid, entry);
    }
  };

  const handleUpdateFood = async (updated: NutritionEntry) => {
    setNutritionLogs((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
    if (user) {
      await updateNutritionEntry(user.uid, updated);
    }
  };

  const handleDeleteFood = async (entryId: string) => {
    setNutritionLogs((prev) => prev.filter((e) => e.id !== entryId));
    if (user) {
      await deleteNutritionEntry(user.uid, entryId);
    }
  };

  const handleAdjustWater = async (deltaMl: number) => {
    const nextWater = Math.min(15000, Math.max(0, currentMetric.waterMl + deltaMl));
    const nextMetric: DailyMetric = { ...currentMetric, waterMl: nextWater };
    setDailyMetrics((prev) => ({ ...prev, [selectedDateKey]: nextMetric }));
    if (user) {
      await upsertDailyMetric(user.uid, nextMetric);
    }
  };

  const handleUpdateWeight = async (dateKey: string, weightKg: number) => {
    const existing = dailyMetrics[dateKey] || {
      dateKey,
      waterMl: 0,
      weightKg,
      steps: 0,
      activeCalories: 0,
      restingHeartRate: 0,
      avgHeartRate: 0,
      wearableSource: 'manual' as WearableSource,
    };
    const nextMetric: DailyMetric = { ...existing, weightKg };
    setDailyMetrics((prev) => ({ ...prev, [dateKey]: nextMetric }));
    const nextProfile = { ...profile, currentWeightKg: weightKg };
    setProfile(nextProfile);
    if (user) {
      await upsertDailyMetric(user.uid, nextMetric);
      await saveUserProfile(user.uid, nextProfile);
    }
  };

  const handleImportWearableDays = async (days: ParsedWearableDay[], source: WearableSource) => {
    const updatedMap = { ...dailyMetrics };
    for (const day of days) {
      const existing = updatedMap[day.dateKey] || {
        dateKey: day.dateKey,
        waterMl: 0,
        weightKg: profile.currentWeightKg,
        steps: 0,
        activeCalories: 0,
        restingHeartRate: 0,
        avgHeartRate: 0,
        wearableSource: source,
      };
      const nextMetric: DailyMetric = {
        ...existing,
        steps: day.steps > 0 ? day.steps : existing.steps,
        activeCalories: day.activeCalories > 0 ? day.activeCalories : existing.activeCalories,
        restingHeartRate:
          day.restingHeartRate > 0 ? day.restingHeartRate : existing.restingHeartRate,
        avgHeartRate: day.avgHeartRate > 0 ? day.avgHeartRate : existing.avgHeartRate,
        wearableSource: source,
      };
      updatedMap[day.dateKey] = nextMetric;
      if (user) {
        await upsertDailyMetric(user.uid, nextMetric);
      }
    }
    setDailyMetrics(updatedMap);
  };

  const handleUpdateBleHeartRate = async (
    bpm: number | null,
    deviceName: string | null,
    conn: BluetoothHRConnection | null
  ) => {
    setLiveHeartRate(bpm);
    setBleDeviceName(deviceName);
    if (conn !== bleConn) setBleConn(conn);
    if (bpm && bpm > 25) {
      const nextMetric: DailyMetric = {
        ...currentMetric,
        avgHeartRate: bpm,
        wearableSource: 'bluetooth_hr',
      };
      setDailyMetrics((prev) => ({ ...prev, [selectedDateKey]: nextMetric }));
      if (user) {
        await upsertDailyMetric(user.uid, nextMetric);
      }
    }
  };

  const handleExportUserData = () => {
    const payload = {
      app: 'ARESFORGE',
      exportedAt: new Date().toISOString(),
      accountUid: user?.uid || null,
      profile,
      customPrograms,
      programPreferences: programPrefs,
      workoutSessions,
      nutritionLogs,
      dailyMetrics,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `aresforge-data-export-${getTodayKey()}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const clearAllLocalState = () => {
    bleConn?.disconnect();
    setBleConn(null);
    setLiveHeartRate(null);
    setBleDeviceName(null);
    const storageKeys = [
      'aresforge_disclaimer_ack',
      'forma_profile',
      'forma_custom_programs',
      'forma_program_prefs',
      'forma_daily_duration_overrides',
      'forma_workout_sessions',
      'forma_nutrition_logs',
      'forma_daily_metrics',
    ];
    for (const key of storageKeys) {
      try {
        localStorage.removeItem(key);
      } catch {
        // ignore storage errors
      }
    }
    setProfile(DEFAULT_PROFILE);
    setCustomPrograms([]);
    setProgramPrefs({});
    setDailyDurationOverrides({});
    setWorkoutSessions([]);
    setNutritionLogs([]);
    setDailyMetrics({});
    setActiveWorkout(null);
    setEditingProgram(undefined);
    setSwapTarget(null);
    setScannerMeal(null);
    setShowWearableModal(false);
  };

  const handleResetLocalData = () => {
    clearAllLocalState();
    setAuthNotice({ type: 'success', text: 'Local device data has been cleared.' });
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    await deleteUserAccountAndData(user);
    clearAllLocalState();
    setAuthNotice({
      type: 'success',
      text: 'Your account and all cloud & local fitness records have been permanently deleted.',
    });
  };

  const handleSignIn = async () => {
    setAuthNotice(null);
    try {
      await signInWithGoogle();
    } catch (err) {
      const code = (err as { code?: string })?.code;
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
        return;
      }
      setAuthNotice({
        type: 'error',
        text: err instanceof Error ? err.message : 'Unable to sign in right now.',
      });
    }
  };

  const handleSignOut = async () => {
    setAuthNotice(null);
    try {
      await signOutAccount();
    } catch (err) {
      setAuthNotice({
        type: 'error',
        text: err instanceof Error ? err.message : 'Unable to sign out right now.',
      });
    }
  };

  const handleAcknowledgeDisclaimer = () => {
    setDisclaimerAck(true);
    try {
      localStorage.setItem('aresforge_disclaimer_ack', '1');
    } catch {
      // ignore storage errors
    }
  };

  const navItems: Array<{ id: TabKey; label: string; icon: React.FC<{ className?: string }> }> = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'workouts', label: 'Workouts', icon: Dumbbell },
    { id: 'nutrition', label: 'Nutrition', icon: Utensils },
    { id: 'profile', label: 'Profile', icon: UserIcon },
  ];

  if (legalPathSection) {
    return (
      <LegalSupportView
        standalone
        section={legalPathSection}
        onChangeSection={(next) => {
          setLegalPathSection(next);
          if (window.location.pathname !== `/${next}`) {
            window.history.pushState({}, '', `/${next}`);
          }
        }}
        onClose={() => {
          setLegalPathSection(null);
          window.history.pushState({}, '', '/');
        }}
        onExportData={handleExportUserData}
        onOpenAccountControls={() => {
          setLegalPathSection(null);
          window.history.pushState({}, '', '/');
          setActiveTab('profile');
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      {/* Desktop & Mobile Top App Bar (Strict 3-Zone Contract on Desktop, Compact 52px on Mobile) */}
      <header className="sticky top-0 z-30 h-14 md:h-16 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto h-full flex items-center justify-between gap-8">
          {/* Zone 1: Brand crest logo + wordmark */}
          <button
            type="button"
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-2.5 whitespace-nowrap shrink-0"
          >
            <img
              src={aresForgeCrestUrl}
              alt="ARESFORGE logo"
              className="w-8 h-8 md:w-9 md:h-9 rounded-lg object-cover border border-slate-200 dark:border-slate-700 bg-slate-900 shrink-0"
            />
            <span className="text-lg md:text-xl font-extrabold tracking-wider text-slate-900 dark:text-white">
              ARESFORGE
            </span>
          </button>

          {/* Zone 2: Clean single-line text navigation links (hidden on mobile, bottom tab bar used instead) */}
          <nav className="hidden md:flex items-center gap-7" aria-label="Primary">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`py-1 text-sm font-medium transition-colors whitespace-nowrap shrink-0 border-b-2 ${
                    isActive
                      ? 'text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400 font-semibold'
                      : 'text-slate-600 dark:text-slate-300 border-transparent hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Single primary action */}
          <div className="shrink-0">
            <button
              type="button"
              onClick={() => setScannerMeal('lunch')}
              className="min-h-[40px] px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-2 whitespace-nowrap shrink-0 transition-colors"
            >
              <ScanBarcode className="w-4 h-4" />
              Scan Food
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-10">
        {!disclaimerAck && (
          <div className="mb-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                <p className="font-bold text-slate-900 dark:text-white">
                  Training &amp; Health Safety Notice
                </p>
                <p className="mt-0.5">
                  ARESFORGE provides informational training and nutrition tracking only and is not
                  medical advice. Consult a physician before starting high-intensity conditioning.{' '}
                  <button
                    type="button"
                    onClick={() => setLegalModalSection('privacy')}
                    className="font-semibold text-blue-600 dark:text-blue-400 underline underline-offset-2"
                  >
                    Privacy Policy
                  </button>{' '}
                  ·{' '}
                  <button
                    type="button"
                    onClick={() => setLegalModalSection('terms')}
                    className="font-semibold text-blue-600 dark:text-blue-400 underline underline-offset-2"
                  >
                    Terms &amp; Safety
                  </button>
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleAcknowledgeDisclaimer}
              className="min-h-[38px] px-4 rounded-xl bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 text-white text-xs font-semibold whitespace-nowrap shrink-0 self-end sm:self-center"
            >
              I Understand
            </button>
          </div>
        )}

        {activeTab === 'dashboard' && (
          <ProgressDashboard
            profile={profile}
            selectedDateKey={selectedDateKey}
            onSelectDateKey={setSelectedDateKey}
            nutritionLogs={nutritionLogs}
            workoutSessions={workoutSessions}
            dailyMetrics={dailyMetrics}
            allPrograms={[...customPrograms, ...AFT_PROGRAMS, ...PRE_EXISTING_PROGRAMS]}
            programPrefs={programPrefs}
            dailyDurationOverrides={dailyDurationOverrides}
            liveHeartRate={liveHeartRate}
            onUpdateWeight={handleUpdateWeight}
            onSaveProfile={handleSaveProfile}
            onChangeDailyDuration={handleChangeDailyDuration}
            onStartWorkout={handleStartWorkout}
            onRequestSwapExercise={(prog, ex) => setSwapTarget({ program: prog, exercise: ex })}
            onWatchFormVideo={(name, exerciseId, pattern) =>
              setVideoDemo({ name, exerciseId, pattern })
            }
            onOpenWearableSync={() => setShowWearableModal(true)}
            onOpenBarcodeScanner={() => setScannerMeal('lunch')}
            onGoToWorkouts={() => setActiveTab('workouts')}
            onDeleteWorkoutSession={handleDeleteWorkoutSession}
          />
        )}

        {activeTab === 'workouts' && (
          <WorkoutsView
            preExistingPrograms={PRE_EXISTING_PROGRAMS}
            customPrograms={customPrograms}
            workoutSessions={workoutSessions}
            experienceLevel={profile.experienceLevel || 'Intermediate'}
            programPrefs={programPrefs}
            onChangeExperienceLevel={handleChangeExperienceLevel}
            onUpdateProgramPref={handleUpdateProgramPref}
            onStartWorkout={handleStartWorkout}
            onRequestSwapExercise={(prog, ex) => setSwapTarget({ program: prog, exercise: ex })}
            onCreateProgram={() => setEditingProgram(null)}
            onEditProgram={(prog) => setEditingProgram(prog)}
            onDeleteProgram={handleDeleteProgram}
            onWatchFormVideo={(name, exerciseId, pattern) =>
              setVideoDemo({ name, exerciseId, pattern })
            }
          />
        )}

        {activeTab === 'nutrition' && (
          <NutritionView
            profile={profile}
            selectedDateKey={selectedDateKey}
            entries={nutritionLogs}
            metric={currentMetric}
            onAddFood={handleAddFood}
            onUpdateEntry={handleUpdateFood}
            onDeleteEntry={handleDeleteFood}
            onAdjustWater={handleAdjustWater}
            onOpenBarcodeScanner={(meal) => setScannerMeal(meal)}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileView
            profile={profile}
            user={user}
            themePreference={themePreference}
            systemPrefersDark={systemPrefersDark}
            dailyMetrics={dailyMetrics}
            workoutSessions={workoutSessions}
            selectedDateKey={selectedDateKey}
            authNotice={authNotice}
            onChangeThemePreference={setThemePreference}
            onSaveProfile={handleSaveProfile}
            onSignIn={handleSignIn}
            onSignOut={handleSignOut}
            onExportUserData={handleExportUserData}
            onResetLocalData={handleResetLocalData}
            onDeleteAccount={handleDeleteAccount}
            onOpenLegalSection={(section) => setLegalModalSection(section)}
            onOpenWearableSync={() => setShowWearableModal(true)}
          />
        )}
      </main>

      {/* Mobile Bottom Tab Bar (Natural Thumb Zone, hidden on md+) */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 pb-safe"
        aria-label="Mobile Navigation"
      >
        <div className="grid grid-cols-4 h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center justify-center min-h-[44px] transition-colors ${
                  isActive
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                <Icon className="w-[22px] h-[22px]" />
                <span className="text-[11px] font-medium tracking-tight mt-1">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Offline Status Toast */}
      {!isOnline && (
        <div className="fixed bottom-20 md:bottom-5 left-4 z-40 flex items-center gap-2 rounded-xl bg-amber-600 px-3.5 py-2 text-xs font-medium text-white shadow-lg">
          <WifiOff className="w-3.5 h-3.5 shrink-0" />
          Offline Mode — Cached data is active
        </div>
      )}

      {/* Modals */}
      {scannerMeal && (
        <BarcodeScannerModal
          defaultMealType={scannerMeal}
          onAddFood={handleAddFood}
          onClose={() => setScannerMeal(null)}
        />
      )}

      {editingProgram !== undefined && (
        <CustomProgramModal
          initialProgram={editingProgram}
          onSave={handleSaveProgram}
          onPreviewVideo={(name, exerciseId, pattern) =>
            setVideoDemo({ name, exerciseId, pattern })
          }
          onClose={() => setEditingProgram(undefined)}
        />
      )}

      {activeWorkout && (
        <WorkoutPlayerModal
          program={activeWorkout.program}
          activeDay={activeWorkout.day}
          dateKey={selectedDateKey}
          unitSystem={profile.unitSystem}
          experienceLevel={profile.experienceLevel || 'Intermediate'}
          liveHeartRate={liveHeartRate}
          onRequestSwapExercise={(prog, ex) => setSwapTarget({ program: prog, exercise: ex })}
          onWatchFormVideo={(name, exerciseId, pattern) =>
            setVideoDemo({ name, exerciseId, pattern })
          }
          onCompleteSession={handleCompleteSession}
          onClose={() => setActiveWorkout(null)}
        />
      )}

      {swapTarget && (
        <ExerciseSwapModal
          programTitle={swapTarget.program.title}
          exercise={swapTarget.exercise}
          onSelectReplacement={(replacement) => {
            handleSwapProgramExercise(swapTarget.program, swapTarget.exercise, replacement);
            setSwapTarget(null);
          }}
          onRevertToOriginal={() => {
            handleSwapProgramExercise(swapTarget.program, swapTarget.exercise, null);
            setSwapTarget(null);
          }}
          onWatchFormVideo={(name, exerciseId, pattern) =>
            setVideoDemo({ name, exerciseId, pattern })
          }
          onClose={() => setSwapTarget(null)}
        />
      )}

      {videoDemo && (
        <ExerciseVideoDemoModal
          exerciseName={videoDemo.name}
          exerciseId={videoDemo.exerciseId}
          pattern={videoDemo.pattern}
          onClose={() => setVideoDemo(null)}
        />
      )}

      {showWearableModal && (
        <WearableSyncModal
          selectedDateKey={selectedDateKey}
          liveHeartRate={liveHeartRate}
          bleDeviceName={bleDeviceName}
          onUpdateBleHeartRate={handleUpdateBleHeartRate}
          onImportWearableDays={handleImportWearableDays}
          onClose={() => setShowWearableModal(false)}
        />
      )}

      {legalModalSection && (
        <LegalSupportModal
          initialSection={legalModalSection}
          onExportData={handleExportUserData}
          onClose={() => setLegalModalSection(null)}
        />
      )}
    </div>
  );
}
