import { initializeApp } from 'firebase/app';
import {
  deleteUser,
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  reauthenticateWithPopup,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocFromServer,
  getDocs,
  getFirestore,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { normalizeMacroPercentages } from './nutritionCoach';
import type {
  ActivityLevel,
  BiologicalSex,
  DailyMetric,
  ExperienceLevel,
  MacroMode,
  NutritionEntry,
  NutritionGoal,
  ProgramPreference,
  RotationDays,
  UserProfile,
  WorkoutDurationOption,
  WorkoutProgram,
  WorkoutSession,
} from '../types/fitness';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
testConnection();

export function subscribeAuth(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

export async function signInWithGoogle() {
  return signInWithPopup(auth, googleProvider);
}

export async function signOutAccount() {
  return signOut(auth);
}

const USER_SUBCOLLECTIONS = [
  'customPrograms',
  'workoutSessions',
  'nutritionLogs',
  'dailyMetrics',
  'programPreferences',
] as const;

export async function deleteUserAccountAndData(user: User): Promise<void> {
  const userId = user.uid;

  for (const subcollection of USER_SUBCOLLECTIONS) {
    const colPath = `users/${userId}/${subcollection}`;
    const q = query(
      collection(db, 'users', userId, subcollection),
      where('userId', '==', userId)
    );
    let snap;
    try {
      snap = await getDocs(q);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, colPath);
    }

    if (snap && !snap.empty) {
      for (let i = 0; i < snap.docs.length; i += 400) {
        const chunk = snap.docs.slice(i, i + 400);
        const batch = writeBatch(db);
        for (const docSnap of chunk) {
          batch.delete(docSnap.ref);
        }
        try {
          await batch.commit();
        } catch (error) {
          handleFirestoreError(error, OperationType.DELETE, colPath);
        }
      }
    }
  }

  const profilePath = `users/${userId}`;
  try {
    await deleteDoc(doc(db, 'users', userId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, profilePath);
  }

  try {
    await deleteUser(user);
  } catch (error) {
    const code = (error as { code?: string })?.code;
    if (code === 'auth/requires-recent-login') {
      await reauthenticateWithPopup(user, googleProvider);
      await deleteUser(user);
      return;
    }
    throw error;
  }
}

function clamp(val: number, min: number, max: number): number {
  if (!Number.isFinite(val)) return min;
  return Math.min(max, Math.max(min, val));
}

export function sanitizeId(raw: string): string {
  const cleaned = raw.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 128);
  return cleaned || `id_${Date.now()}`;
}

function normalizeSex(raw: unknown): BiologicalSex {
  return raw === 'male' || raw === 'female' ? raw : 'neutral';
}

function normalizeActivityLevel(raw: unknown): ActivityLevel {
  if (
    raw === 'sedentary' ||
    raw === 'light' ||
    raw === 'moderate' ||
    raw === 'active' ||
    raw === 'very_active'
  ) {
    return raw;
  }
  return 'moderate';
}

function normalizeNutritionGoal(raw: unknown): NutritionGoal {
  if (
    raw === 'lose_weight' ||
    raw === 'maintain' ||
    raw === 'build_muscle' ||
    raw === 'recomp' ||
    raw === 'performance'
  ) {
    return raw;
  }
  return 'recomp';
}

export async function ensureUserProfile(user: User, defaults: UserProfile): Promise<void> {
  const path = `users/${user.uid}`;
  const ref = doc(db, 'users', user.uid);
  const validExp: ExperienceLevel =
    defaults.experienceLevel === 'Beginner' || defaults.experienceLevel === 'Advanced'
      ? defaults.experienceLevel
      : 'Intermediate';
  try {
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      const initPcts = normalizeMacroPercentages({
        proteinPct: defaults.macroProteinPct,
        carbsPct: defaults.macroCarbsPct,
        fatPct: defaults.macroFatPct,
      });
      const initMacroMode: MacroMode = defaults.macroMode === 'custom' ? 'custom' : 'recommended';
      await setDoc(ref, {
        uid: user.uid,
        displayName: (user.displayName || defaults.displayName || 'Athlete').slice(0, 60),
        dailyCalorieGoal: clamp(defaults.dailyCalorieGoal, 800, 10000),
        dailyProteinGoal: clamp(defaults.dailyProteinGoal, 0, 1500),
        dailyCarbsGoal: clamp(defaults.dailyCarbsGoal, 0, 2500),
        dailyFatGoal: clamp(defaults.dailyFatGoal, 0, 1100),
        macroMode: initMacroMode,
        macroProteinPct: initPcts.proteinPct,
        macroCarbsPct: initPcts.carbsPct,
        macroFatPct: initPcts.fatPct,
        weeklyWorkoutGoal: clamp(defaults.weeklyWorkoutGoal, 1, 14),
        dailyWaterGoalMl: clamp(defaults.dailyWaterGoalMl, 500, 10000),
        dailyStepGoal: clamp(defaults.dailyStepGoal, 1000, 100000),
        dailyActiveCaloriesGoal: clamp(defaults.dailyActiveCaloriesGoal, 100, 5000),
        targetWeightKg: clamp(defaults.targetWeightKg, 25, 350),
        currentWeightKg: clamp(defaults.currentWeightKg, 25, 350),
        heightCm: clamp(Math.round(defaults.heightCm || 175), 100, 250),
        age: clamp(Math.round(defaults.age || 30), 13, 110),
        biologicalSex: normalizeSex(defaults.biologicalSex),
        activityLevel: normalizeActivityLevel(defaults.activityLevel),
        nutritionGoal: normalizeNutritionGoal(defaults.nutritionGoal),
        activeProgramId: defaults.activeProgramId ? sanitizeId(defaults.activeProgramId) : '',
        activeDailyDurationDate: defaults.activeDailyDurationDate || '',
        activeDailyDurationMinutes:
          defaults.activeDailyDurationMinutes === 30 || defaults.activeDailyDurationMinutes === 60
            ? defaults.activeDailyDurationMinutes
            : 45,
        unitSystem: defaults.unitSystem,
        experienceLevel: validExp,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function saveUserProfile(userId: string, profile: UserProfile): Promise<void> {
  const path = `users/${userId}`;
  const ref = doc(db, 'users', userId);
  const validExp: ExperienceLevel =
    profile.experienceLevel === 'Beginner' || profile.experienceLevel === 'Advanced'
      ? profile.experienceLevel
      : 'Intermediate';
  const durationMinutes: WorkoutDurationOption =
    profile.activeDailyDurationMinutes === 30 || profile.activeDailyDurationMinutes === 60
      ? profile.activeDailyDurationMinutes
      : 45;
  const savedPcts = normalizeMacroPercentages({
    proteinPct: profile.macroProteinPct,
    carbsPct: profile.macroCarbsPct,
    fatPct: profile.macroFatPct,
  });
  const savedMacroMode: MacroMode = profile.macroMode === 'custom' ? 'custom' : 'recommended';
  try {
    await updateDoc(ref, {
      displayName: (profile.displayName || 'Athlete').trim().slice(0, 60) || 'Athlete',
      dailyCalorieGoal: clamp(Math.round(profile.dailyCalorieGoal), 800, 10000),
      dailyProteinGoal: clamp(Math.round(profile.dailyProteinGoal), 0, 1500),
      dailyCarbsGoal: clamp(Math.round(profile.dailyCarbsGoal), 0, 2500),
      dailyFatGoal: clamp(Math.round(profile.dailyFatGoal), 0, 1100),
      macroMode: savedMacroMode,
      macroProteinPct: savedPcts.proteinPct,
      macroCarbsPct: savedPcts.carbsPct,
      macroFatPct: savedPcts.fatPct,
      weeklyWorkoutGoal: clamp(Math.round(profile.weeklyWorkoutGoal), 1, 14),
      dailyWaterGoalMl: clamp(Math.round(profile.dailyWaterGoalMl), 500, 10000),
      dailyStepGoal: clamp(Math.round(profile.dailyStepGoal), 1000, 100000),
      dailyActiveCaloriesGoal: clamp(Math.round(profile.dailyActiveCaloriesGoal), 100, 5000),
      targetWeightKg: clamp(Number(profile.targetWeightKg), 25, 350),
      currentWeightKg: clamp(Number(profile.currentWeightKg), 25, 350),
      heightCm: clamp(Math.round(profile.heightCm || 175), 100, 250),
      age: clamp(Math.round(profile.age || 30), 13, 110),
      biologicalSex: normalizeSex(profile.biologicalSex),
      activityLevel: normalizeActivityLevel(profile.activityLevel),
      nutritionGoal: normalizeNutritionGoal(profile.nutritionGoal),
      activeProgramId: profile.activeProgramId ? sanitizeId(profile.activeProgramId) : '',
      activeDailyDurationDate:
        profile.activeDailyDurationDate && /^\d{4}-\d{2}-\d{2}$/.test(profile.activeDailyDurationDate)
          ? profile.activeDailyDurationDate
          : '',
      activeDailyDurationMinutes: durationMinutes,
      unitSystem: profile.unitSystem,
      experienceLevel: validExp,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export function subscribeUserProfile(
  userId: string,
  onData: (profile: UserProfile | null) => void,
  onErr?: (err: Error) => void
) {
  const path = `users/${userId}`;
  return onSnapshot(
    doc(db, 'users', userId),
    (snap) => {
      if (!snap.exists()) {
        onData(null);
        return;
      }
      const d = snap.data();
      const exp: ExperienceLevel =
        d.experienceLevel === 'Beginner' || d.experienceLevel === 'Advanced'
          ? d.experienceLevel
          : 'Intermediate';
      const hasMacroPcts =
        typeof d.macroProteinPct === 'number' &&
        typeof d.macroCarbsPct === 'number' &&
        typeof d.macroFatPct === 'number';
      const syncedPcts = hasMacroPcts
        ? normalizeMacroPercentages({
            proteinPct: d.macroProteinPct,
            carbsPct: d.macroCarbsPct,
            fatPct: d.macroFatPct,
          })
        : null;
      onData({
        uid: String(d.uid),
        displayName: String(d.displayName || 'Athlete'),
        dailyCalorieGoal: Number(d.dailyCalorieGoal || 2200),
        dailyProteinGoal: d.dailyProteinGoal !== undefined ? Number(d.dailyProteinGoal) : 160,
        dailyCarbsGoal: d.dailyCarbsGoal !== undefined ? Number(d.dailyCarbsGoal) : 220,
        dailyFatGoal: d.dailyFatGoal !== undefined ? Number(d.dailyFatGoal) : 70,
        macroMode: d.macroMode === 'custom' ? 'custom' : 'recommended',
        macroProteinPct: syncedPcts?.proteinPct,
        macroCarbsPct: syncedPcts?.carbsPct,
        macroFatPct: syncedPcts?.fatPct,
        weeklyWorkoutGoal: Number(d.weeklyWorkoutGoal || 4),
        dailyWaterGoalMl: Number(d.dailyWaterGoalMl || 2500),
        dailyStepGoal: Number(d.dailyStepGoal || 10000),
        dailyActiveCaloriesGoal: Number(d.dailyActiveCaloriesGoal || 500),
        targetWeightKg: Number(d.targetWeightKg || 72),
        currentWeightKg: Number(d.currentWeightKg || 75),
        heightCm: Number(d.heightCm || 175),
        age: Number(d.age || 30),
        biologicalSex: normalizeSex(d.biologicalSex),
        activityLevel: normalizeActivityLevel(d.activityLevel),
        nutritionGoal: normalizeNutritionGoal(d.nutritionGoal),
        activeProgramId: typeof d.activeProgramId === 'string' && d.activeProgramId ? d.activeProgramId : undefined,
        activeDailyDurationDate:
          typeof d.activeDailyDurationDate === 'string' && d.activeDailyDurationDate
            ? d.activeDailyDurationDate
            : undefined,
        activeDailyDurationMinutes:
          d.activeDailyDurationMinutes === 30 ||
          d.activeDailyDurationMinutes === 45 ||
          d.activeDailyDurationMinutes === 60
            ? d.activeDailyDurationMinutes
            : undefined,
        unitSystem: d.unitSystem === 'metric' ? 'metric' : 'imperial',
        experienceLevel: exp,
      });
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.GET, path);
      } catch (e) {
        onErr?.(e as Error);
      }
    }
  );
}

export async function saveCustomProgram(userId: string, program: WorkoutProgram, isNew: boolean): Promise<void> {
  const id = sanitizeId(program.id);
  const path = `users/${userId}/customPrograms/${id}`;
  const ref = doc(db, 'users', userId, 'customPrograms', id);
  const exercises = program.exercises.slice(0, 25).map((ex) => ({
    id: sanitizeId(ex.id),
    exerciseId: ex.exerciseId || '',
    name: ex.name.trim().slice(0, 80),
    muscleGroup: ex.muscleGroup.slice(0, 40),
    sets: clamp(Math.round(ex.sets), 1, 20),
    reps: ex.reps.trim().slice(0, 20) || '10',
    restSeconds: clamp(Math.round(ex.restSeconds), 10, 600),
    notes: (ex.notes || '').slice(0, 120),
    pattern: ex.pattern || 'squat',
    dayIndex: typeof ex.dayIndex === 'number' ? clamp(Math.round(ex.dayIndex), 0, 6) : 0,
    dayFocus: (ex.dayFocus || '').trim().slice(0, 60),
  }));

  try {
    if (isNew) {
      await setDoc(ref, {
        id,
        userId,
        title: program.title.trim().slice(0, 80),
        category: program.category,
        difficulty: program.difficulty,
        estimatedMinutes: clamp(Math.round(program.estimatedMinutes), 5, 300),
        daysPerWeek: clamp(Math.round(program.daysPerWeek), 1, 7),
        description: program.description.trim().slice(0, 300),
        exercises,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      await updateDoc(ref, {
        title: program.title.trim().slice(0, 80),
        category: program.category,
        difficulty: program.difficulty,
        estimatedMinutes: clamp(Math.round(program.estimatedMinutes), 5, 300),
        daysPerWeek: clamp(Math.round(program.daysPerWeek), 1, 7),
        description: program.description.trim().slice(0, 300),
        exercises,
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, isNew ? OperationType.CREATE : OperationType.UPDATE, path);
  }
}

export async function deleteCustomProgram(userId: string, programId: string): Promise<void> {
  const id = sanitizeId(programId);
  const path = `users/${userId}/customPrograms/${id}`;
  try {
    await deleteDoc(doc(db, 'users', userId, 'customPrograms', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export function subscribeCustomPrograms(
  userId: string,
  onData: (programs: WorkoutProgram[]) => void
) {
  const path = `users/${userId}/customPrograms`;
  const q = query(
    collection(db, 'users', userId, 'customPrograms'),
    where('userId', '==', userId),
    orderBy('updatedAt', 'desc')
  );
  return onSnapshot(
    q,
    (snap) => {
      const items: WorkoutProgram[] = snap.docs.map((docSnap) => {
        const d = docSnap.data();
        return {
          id: docSnap.id,
          userId: String(d.userId),
          isCustom: true,
          title: String(d.title || 'Custom Program'),
          category: d.category || 'Custom',
          difficulty: d.difficulty || 'Intermediate',
          estimatedMinutes: Number(d.estimatedMinutes || 40),
          daysPerWeek: Number(d.daysPerWeek || 3),
          description: String(d.description || ''),
          exercises: Array.isArray(d.exercises) ? d.exercises : [],
        };
      });
      onData(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export async function createWorkoutSession(userId: string, session: WorkoutSession): Promise<void> {
  const id = sanitizeId(session.id);
  const path = `users/${userId}/workoutSessions/${id}`;
  try {
    await setDoc(doc(db, 'users', userId, 'workoutSessions', id), {
      id,
      userId,
      programId: session.programId.slice(0, 128),
      programTitle: session.programTitle.trim().slice(0, 80),
      dateKey: session.dateKey,
      durationMinutes: clamp(Math.round(session.durationMinutes), 1, 600),
      caloriesBurned: clamp(Math.round(session.caloriesBurned), 0, 5000),
      totalVolumeKg: clamp(Math.round(session.totalVolumeKg), 0, 500000),
      completedSets: clamp(Math.round(session.completedSets), 0, 300),
      exercisesSummary: session.exercisesSummary.slice(0, 25),
      notes: session.notes.trim().slice(0, 300),
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function deleteWorkoutSession(userId: string, sessionId: string): Promise<void> {
  const id = sanitizeId(sessionId);
  const path = `users/${userId}/workoutSessions/${id}`;
  try {
    await deleteDoc(doc(db, 'users', userId, 'workoutSessions', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export function subscribeWorkoutSessions(
  userId: string,
  onData: (sessions: WorkoutSession[]) => void
) {
  const path = `users/${userId}/workoutSessions`;
  const q = query(
    collection(db, 'users', userId, 'workoutSessions'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(
    q,
    (snap) => {
      const items: WorkoutSession[] = snap.docs.map((docSnap) => {
        const d = docSnap.data();
        return {
          id: docSnap.id,
          userId: String(d.userId),
          programId: String(d.programId),
          programTitle: String(d.programTitle),
          dateKey: String(d.dateKey),
          durationMinutes: Number(d.durationMinutes || 0),
          caloriesBurned: Number(d.caloriesBurned || 0),
          totalVolumeKg: Number(d.totalVolumeKg || 0),
          completedSets: Number(d.completedSets || 0),
          exercisesSummary: Array.isArray(d.exercisesSummary) ? d.exercisesSummary : [],
          notes: String(d.notes || ''),
        };
      });
      onData(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export async function createNutritionEntry(userId: string, entry: NutritionEntry): Promise<void> {
  const id = sanitizeId(entry.id);
  const path = `users/${userId}/nutritionLogs/${id}`;
  try {
    await setDoc(doc(db, 'users', userId, 'nutritionLogs', id), {
      id,
      userId,
      dateKey: entry.dateKey,
      mealType: entry.mealType,
      name: entry.name.trim().slice(0, 120) || 'Food Item',
      brand: entry.brand.trim().slice(0, 80),
      barcode: entry.barcode.trim().slice(0, 40),
      servingLabel: entry.servingLabel.trim().slice(0, 60) || '1 serving',
      servings: clamp(Number(entry.servings), 0.1, 50),
      calories: clamp(Math.round(entry.calories), 0, 10000),
      proteinG: clamp(Math.round(entry.proteinG * 10) / 10, 0, 1000),
      carbsG: clamp(Math.round(entry.carbsG * 10) / 10, 0, 1000),
      fatG: clamp(Math.round(entry.fatG * 10) / 10, 0, 1000),
      source: entry.source,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateNutritionEntry(userId: string, entry: NutritionEntry): Promise<void> {
  const id = sanitizeId(entry.id);
  const path = `users/${userId}/nutritionLogs/${id}`;
  try {
    await updateDoc(doc(db, 'users', userId, 'nutritionLogs', id), {
      mealType: entry.mealType,
      servings: clamp(Number(entry.servings), 0.1, 50),
      calories: clamp(Math.round(entry.calories), 0, 10000),
      proteinG: clamp(Math.round(entry.proteinG * 10) / 10, 0, 1000),
      carbsG: clamp(Math.round(entry.carbsG * 10) / 10, 0, 1000),
      fatG: clamp(Math.round(entry.fatG * 10) / 10, 0, 1000),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteNutritionEntry(userId: string, entryId: string): Promise<void> {
  const id = sanitizeId(entryId);
  const path = `users/${userId}/nutritionLogs/${id}`;
  try {
    await deleteDoc(doc(db, 'users', userId, 'nutritionLogs', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export function subscribeNutritionLogs(
  userId: string,
  onData: (entries: NutritionEntry[]) => void
) {
  const path = `users/${userId}/nutritionLogs`;
  const q = query(
    collection(db, 'users', userId, 'nutritionLogs'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(
    q,
    (snap) => {
      const items: NutritionEntry[] = snap.docs.map((docSnap) => {
        const d = docSnap.data();
        return {
          id: docSnap.id,
          userId: String(d.userId),
          dateKey: String(d.dateKey),
          mealType: d.mealType,
          name: String(d.name),
          brand: String(d.brand || ''),
          barcode: String(d.barcode || ''),
          servingLabel: String(d.servingLabel || '1 serving'),
          servings: Number(d.servings || 1),
          calories: Number(d.calories || 0),
          proteinG: Number(d.proteinG || 0),
          carbsG: Number(d.carbsG || 0),
          fatG: Number(d.fatG || 0),
          source: d.source || 'manual',
        };
      });
      onData(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export async function upsertDailyMetric(userId: string, metric: DailyMetric): Promise<void> {
  const path = `users/${userId}/dailyMetrics/${metric.dateKey}`;
  const ref = doc(db, 'users', userId, 'dailyMetrics', metric.dateKey);
  try {
    const existing = await getDoc(ref);
    const payload = {
      userId,
      dateKey: metric.dateKey,
      waterMl: clamp(Math.round(metric.waterMl), 0, 15000),
      weightKg: clamp(Number(metric.weightKg), 0, 400),
      steps: clamp(Math.round(metric.steps), 0, 200000),
      activeCalories: clamp(Math.round(metric.activeCalories), 0, 15000),
      restingHeartRate: clamp(Math.round(metric.restingHeartRate), 0, 240),
      avgHeartRate: clamp(Math.round(metric.avgHeartRate), 0, 240),
      wearableSource: metric.wearableSource || 'manual',
      updatedAt: serverTimestamp(),
    };
    if (!existing.exists()) {
      await setDoc(ref, payload);
    } else {
      await updateDoc(ref, {
        waterMl: payload.waterMl,
        weightKg: payload.weightKg,
        steps: payload.steps,
        activeCalories: payload.activeCalories,
        restingHeartRate: payload.restingHeartRate,
        avgHeartRate: payload.avgHeartRate,
        wearableSource: payload.wearableSource,
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export function subscribeDailyMetrics(
  userId: string,
  onData: (metrics: Record<string, DailyMetric>) => void
) {
  const path = `users/${userId}/dailyMetrics`;
  const q = query(
    collection(db, 'users', userId, 'dailyMetrics'),
    where('userId', '==', userId)
  );
  return onSnapshot(
    q,
    (snap) => {
      const map: Record<string, DailyMetric> = {};
      for (const docSnap of snap.docs) {
        const d = docSnap.data();
        map[docSnap.id] = {
          userId: String(d.userId),
          dateKey: String(d.dateKey || docSnap.id),
          waterMl: Number(d.waterMl || 0),
          weightKg: Number(d.weightKg || 0),
          steps: Number(d.steps || 0),
          activeCalories: Number(d.activeCalories || 0),
          restingHeartRate: Number(d.restingHeartRate || 0),
          avgHeartRate: Number(d.avgHeartRate || 0),
          wearableSource: d.wearableSource || 'manual',
        };
      }
      onData(map);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

function sanitizeExerciseSwaps(raw: unknown): Record<string, string> {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
  const result: Record<string, string> = {};
  const entries = Object.entries(raw as Record<string, unknown>).slice(0, 40);
  for (const [k, v] of entries) {
    if (typeof v === 'string' && v.trim()) {
      const cleanKey = sanitizeId(k);
      const cleanVal = sanitizeId(v);
      if (cleanKey && cleanVal && cleanKey !== cleanVal) {
        result[cleanKey] = cleanVal;
      }
    }
  }
  return result;
}

export async function upsertProgramPreference(
  userId: string,
  pref: ProgramPreference
): Promise<void> {
  const programId = sanitizeId(pref.programId);
  const path = `users/${userId}/programPreferences/${programId}`;
  const ref = doc(db, 'users', userId, 'programPreferences', programId);
  const rotationDays = clamp(Math.round(pref.rotationDays), 3, 7) as RotationDays;
  const targetMinutes: WorkoutDurationOption =
    pref.targetMinutes === 30 || pref.targetMinutes === 60 ? pref.targetMinutes : 45;
  const exerciseSwaps = sanitizeExerciseSwaps(pref.exerciseSwaps);
  try {
    const existing = await getDoc(ref);
    if (!existing.exists()) {
      await setDoc(ref, {
        userId,
        programId,
        rotationDays,
        targetMinutes,
        exerciseSwaps,
        updatedAt: serverTimestamp(),
      });
    } else {
      await updateDoc(ref, {
        rotationDays,
        targetMinutes,
        exerciseSwaps,
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export function subscribeProgramPreferences(
  userId: string,
  onData: (prefs: Record<string, ProgramPreference>) => void
) {
  const path = `users/${userId}/programPreferences`;
  const q = query(
    collection(db, 'users', userId, 'programPreferences'),
    where('userId', '==', userId)
  );
  return onSnapshot(
    q,
    (snap) => {
      const map: Record<string, ProgramPreference> = {};
      for (const docSnap of snap.docs) {
        const d = docSnap.data();
        const rawDays = clamp(Math.round(Number(d.rotationDays || 4)), 3, 7) as RotationDays;
        const rawMinutes: WorkoutDurationOption =
          d.targetMinutes === 30 || d.targetMinutes === 60 ? d.targetMinutes : 45;
        const swaps = sanitizeExerciseSwaps(d.exerciseSwaps);
        map[docSnap.id] = {
          userId: String(d.userId),
          programId: String(d.programId || docSnap.id),
          rotationDays: rawDays,
          targetMinutes: rawMinutes,
          exerciseSwaps: Object.keys(swaps).length > 0 ? swaps : undefined,
        };
      }
      onData(map);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}
