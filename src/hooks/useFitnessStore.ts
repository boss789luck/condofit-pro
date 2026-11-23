import { useEffect, useMemo, useState } from 'react';
import { MuscleId, UserProfile, WeightEntry, WorkoutSessionLog } from '../types/fitness';
import { EXERCISE_MAP } from '../data/exercises';

const STORAGE_KEY = 'condofit_pro_state_v1';

interface StoredState {
  profile: UserProfile;
  sessions: WorkoutSessionLog[];
  weights: WeightEntry[];
}

const todayStr = () => new Date().toISOString().slice(0, 10);

const DEFAULT_STATE: StoredState = {
  profile: {
    name: 'คุณบอส',
    startWeightKg: 78.0,
    currentWeightKg: 78.0,
    targetWeightKg: 68.0,
    heightCm: 174,
    age: 30,
    gender: 'male',
    activityLevel: 'moderate',
    startDateISO: todayStr(),
    targetMonths: 6,
    activePhase: 1,
    daysPerWeek: 3,
    sessionMinutes: 60,
    dailyWaterMl: 500,
    waterTargetMl: 3000,
    waterLastDate: todayStr(),
  },
  sessions: [],
  weights: [
    {
      id: 'init-weight',
      dateISO: todayStr(),
      weightKg: 78.0,
      note: 'วันเริ่มต้นเป้าหมาย 6 เดือน (78 → 68 กก.)',
    },
  ],
};

function loadState(): StoredState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw) as Partial<StoredState>;
    const mergedProfile: UserProfile = {
      ...DEFAULT_STATE.profile,
      ...(parsed.profile ?? {}),
    };
    // Reset daily water if new day
    if (mergedProfile.waterLastDate !== todayStr()) {
      mergedProfile.dailyWaterMl = 0;
      mergedProfile.waterLastDate = todayStr();
    }
    return {
      profile: mergedProfile,
      sessions: Array.isArray(parsed.sessions) ? parsed.sessions : [],
      weights: Array.isArray(parsed.weights) && parsed.weights.length > 0 ? parsed.weights : DEFAULT_STATE.weights,
    };
  } catch {
    return DEFAULT_STATE;
  }
}

export function useFitnessStore() {
  const [state, setState] = useState<StoredState>(loadState);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore storage quota issues
    }
  }, [state]);

  const updateProfile = (patch: Partial<UserProfile>) => {
    setState((prev) => ({
      ...prev,
      profile: { ...prev.profile, ...patch },
    }));
  };

  const addWater = (ml: number) => {
    setState((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        dailyWaterMl: Math.max(0, prev.profile.dailyWaterMl + ml),
        waterLastDate: todayStr(),
      },
    }));
  };

  const addWeightEntry = (weightKg: number, note?: string, dateISO?: string) => {
    const date = dateISO || todayStr();
    const entry: WeightEntry = {
      id: `w-${Date.now()}`,
      dateISO: date,
      weightKg: Number(weightKg.toFixed(1)),
      note,
    };
    setState((prev) => {
      const updated = [...prev.weights.filter((w) => w.dateISO !== date), entry].sort((a, b) =>
        a.dateISO.localeCompare(b.dateISO)
      );
      const latestWeight = updated[updated.length - 1]?.weightKg ?? prev.profile.currentWeightKg;
      return {
        ...prev,
        weights: updated,
        profile: { ...prev.profile, currentWeightKg: latestWeight },
      };
    });
  };

  const deleteWeightEntry = (id: string) => {
    setState((prev) => {
      if (prev.weights.length <= 1) return prev;
      const updated = prev.weights.filter((w) => w.id !== id);
      const latest = updated[updated.length - 1]?.weightKg ?? prev.profile.startWeightKg;
      return {
        ...prev,
        weights: updated,
        profile: { ...prev.profile, currentWeightKg: latest },
      };
    });
  };

  const addSession = (session: WorkoutSessionLog) => {
    setState((prev) => ({
      ...prev,
      sessions: [session, ...prev.sessions],
    }));
  };

  const deleteSession = (id: string) => {
    setState((prev) => ({
      ...prev,
      sessions: prev.sessions.filter((s) => s.id !== id),
    }));
  };

  // Compute Personal Records (max weight per exercise)
  const personalRecords = useMemo(() => {
    const map: Record<string, { maxWeightKg: number; maxReps: number; lastWeightKg: number; lastReps: number }> = {};
    // iterate oldest -> newest so lastWeight is most recent
    const chrono = [...state.sessions].reverse();
    for (const s of chrono) {
      for (const ex of s.exercises) {
        for (const set of ex.sets) {
          if (!set.completed) continue;
          const prev = map[ex.exerciseId];
          if (!prev) {
            map[ex.exerciseId] = {
              maxWeightKg: set.weightKg,
              maxReps: set.reps,
              lastWeightKg: set.weightKg,
              lastReps: set.reps,
            };
          } else {
            map[ex.exerciseId] = {
              maxWeightKg: Math.max(prev.maxWeightKg, set.weightKg),
              maxReps: Math.max(prev.maxReps, set.reps),
              lastWeightKg: set.weightKg,
              lastReps: set.reps,
            };
          }
        }
      }
    }
    return map;
  }, [state.sessions]);

  // Compute 7-day Muscle Heatmap (0..1)
  const weeklyMuscleHeatmap = useMemo(() => {
    const now = Date.now();
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
    const counts: Partial<Record<MuscleId, number>> = {};
    for (const s of state.sessions) {
      const diff = now - new Date(s.dateISO).getTime();
      if (diff <= sevenDaysMs) {
        for (const ex of s.exercises) {
          const info = EXERCISE_MAP[ex.exerciseId];
          if (!info) continue;
          const doneSets = ex.sets.filter((st) => st.completed).length;
          if (doneSets === 0) continue;
          for (const m of info.primaryMuscles) {
            counts[m] = (counts[m] ?? 0) + doneSets;
          }
          for (const m of info.secondaryMuscles) {
            counts[m] = (counts[m] ?? 0) + doneSets * 0.4;
          }
        }
      }
    }
    const normalized: Partial<Record<MuscleId, number>> = {};
    for (const [k, v] of Object.entries(counts)) {
      normalized[k as MuscleId] = Math.min(1, (v ?? 0) / 10);
    }
    return normalized;
  }, [state.sessions]);

  const weeklyStats = useMemo(() => {
    const now = Date.now();
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
    const thisWeek = state.sessions.filter((s) => now - new Date(s.dateISO).getTime() <= sevenDaysMs);
    return {
      workoutsThisWeek: thisWeek.length,
      totalWorkouts: state.sessions.length,
      volumeThisWeek: thisWeek.reduce((acc, s) => acc + s.totalVolumeKg, 0),
      caloriesThisWeek: thisWeek.reduce((acc, s) => acc + s.estimatedCalories, 0),
    };
  }, [state.sessions]);

  const exportBackupJson = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `condofit-pro-backup-${todayStr()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importBackupJson = (jsonText: string): boolean => {
    try {
      const parsed = JSON.parse(jsonText) as StoredState;
      if (parsed && parsed.profile && Array.isArray(parsed.sessions)) {
        setState(parsed);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  return {
    profile: state.profile,
    sessions: state.sessions,
    weights: state.weights,
    personalRecords,
    weeklyMuscleHeatmap,
    weeklyStats,
    updateProfile,
    addWater,
    addWeightEntry,
    deleteWeightEntry,
    addSession,
    deleteSession,
    exportBackupJson,
    importBackupJson,
  };
}
