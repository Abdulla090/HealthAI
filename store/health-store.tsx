import React, { createContext, useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ── Types ──────────────────────────────────────────────
export interface UserProfile {
  name: string;
  email: string;
  createdAt: string;
}

export interface WaterEntry {
  id: string;
  ml: number;
  time: string;
}

export interface WorkoutEntry {
  id: string;
  type: 'run' | 'cycle' | 'yoga' | 'walk' | 'swim' | 'gym';
  name: string;
  durationMin: number;
  distanceKm?: number;
  kcal: number;
  time: string;
}

export interface MealEntry {
  id: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  name: string;
  kcal: number;
  carbsG: number;
  proteinG: number;
  fatG: number;
  time: string;
}

export interface DailySleep {
  date: string;
  hours: number;
  minutes: number;
  quality: number;
}

export interface DayData {
  date: string;
  steps: number;
  water: WaterEntry[];
  workouts: WorkoutEntry[];
  meals: MealEntry[];
  sleep: DailySleep | null;
  stressLevel: 'low' | 'medium' | 'high';
  calorieGoal: number;
  caloriesConsumed: number;
}

export interface UserGoals {
  dailySteps: number;
  dailyWaterMl: number;
  dailyCalories: number;
  dailyCarbsG: number;
  dailyProteinG: number;
  dailyFatG: number;
}

export interface HealthState {
  isAuthenticated: boolean;
  user: UserProfile | null;
  goals: UserGoals;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (name: string) => Promise<void>;

  today: DayData;
  streakDays: number;
  weeklySteps: number[];
  weeklyWorkoutCounts: number[];

  addWater: (ml: number) => Promise<void>;
  addWorkout: (w: Omit<WorkoutEntry, 'id' | 'time'>) => Promise<void>;
  addMeal: (m: Omit<MealEntry, 'id' | 'time'>) => Promise<void>;
  deleteMeal: (id: string) => Promise<void>;
  updateSteps: (steps: number) => Promise<void>;
  updateSleep: (hours: number, minutes: number, quality: number) => Promise<void>;
  updateStress: (level: 'low' | 'medium' | 'high') => Promise<void>;
  updateCalories: (consumed: number) => Promise<void>;
  updateGoals: (g: Partial<UserGoals>) => Promise<void>;

  loading: boolean;
}

const todayStr = () => new Date().toISOString().slice(0, 10);

const DEFAULT_GOALS: UserGoals = {
  dailySteps: 10000,
  dailyWaterMl: 2500,
  dailyCalories: 2200,
  dailyCarbsG: 250,
  dailyProteinG: 120,
  dailyFatG: 70,
};

function emptyDay(date?: string): DayData {
  return {
    date: date || todayStr(),
    steps: 0,
    water: [],
    workouts: [],
    meals: [],
    sleep: null,
    stressLevel: 'low',
    calorieGoal: DEFAULT_GOALS.dailyCalories,
    caloriesConsumed: 0,
  };
}

const KEYS = {
  user: '@ht_user',
  password: '@ht_password',
  dayPrefix: '@ht_day_',
  streak: '@ht_streak',
  goals: '@ht_goals',
};

export const HealthContext = createContext<HealthState>({} as HealthState);

export function HealthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [today, setToday] = useState<DayData>(emptyDay());
  const [goals, setGoals] = useState<UserGoals>(DEFAULT_GOALS);
  const [streakDays, setStreakDays] = useState(0);
  const [weeklySteps, setWeeklySteps] = useState<number[]>([0, 0, 0, 0, 0, 0, 0]);
  const [weeklyWorkoutCounts, setWeeklyWorkoutCounts] = useState<number[]>([0, 0, 0, 0, 0, 0, 0]);
  const [loading, setLoading] = useState(true);

  const saveDayData = useCallback(async (day: DayData) => {
    await AsyncStorage.setItem(KEYS.dayPrefix + day.date, JSON.stringify(day));
  }, []);

  const loadDayData = useCallback(async (date: string): Promise<DayData> => {
    const raw = await AsyncStorage.getItem(KEYS.dayPrefix + date);
    if (!raw) return emptyDay(date);
    const parsed = JSON.parse(raw);
    // Ensure meals array exists (migration for older data)
    if (!parsed.meals) parsed.meals = [];
    return parsed;
  }, []);

  const loadWeekly = useCallback(async () => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const steps: number[] = [];
    const workoutCounts: number[] = [];

    for (let i = 0; i < 7; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() + mondayOffset + i);
      const dateStr = d.toISOString().slice(0, 10);
      const dayData = await loadDayData(dateStr);
      steps.push(dayData.steps);
      workoutCounts.push(dayData.workouts.length);
    }
    setWeeklySteps(steps);
    setWeeklyWorkoutCounts(workoutCounts);
  }, [loadDayData]);

  const calcStreak = useCallback(async () => {
    let streak = 0;
    const d = new Date();
    for (let i = 0; i < 365; i++) {
      const dateStr = d.toISOString().slice(0, 10);
      const dayData = await loadDayData(dateStr);
      if (dayData.workouts.length > 0 || dayData.steps > 1000) {
        streak++;
      } else if (i > 0) {
        break;
      } else {
        break;
      }
      d.setDate(d.getDate() - 1);
    }
    setStreakDays(streak);
  }, [loadDayData]);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(KEYS.user);
        const goalsRaw = await AsyncStorage.getItem(KEYS.goals);
        if (goalsRaw) setGoals(JSON.parse(goalsRaw));
        if (raw) {
          const parsed: UserProfile = JSON.parse(raw);
          setUser(parsed);
          setIsAuthenticated(true);
          const td = await loadDayData(todayStr());
          setToday(td);
          await loadWeekly();
          await calcStreak();
        }
      } catch (e) {
        console.warn('Init error', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    const existing = await AsyncStorage.getItem(KEYS.user);
    if (existing) {
      const parsed: UserProfile = JSON.parse(existing);
      if (parsed.email === email) return false;
    }
    const profile: UserProfile = { name, email, createdAt: new Date().toISOString() };
    await AsyncStorage.setItem(KEYS.user, JSON.stringify(profile));
    await AsyncStorage.setItem(KEYS.password, password);
    setUser(profile);
    setIsAuthenticated(true);
    const td = await loadDayData(todayStr());
    setToday(td);
    await loadWeekly();
    return true;
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    const raw = await AsyncStorage.getItem(KEYS.user);
    const storedPw = await AsyncStorage.getItem(KEYS.password);
    if (!raw || !storedPw) return false;
    const profile: UserProfile = JSON.parse(raw);
    if (profile.email !== email || storedPw !== password) return false;
    setUser(profile);
    setIsAuthenticated(true);
    const td = await loadDayData(todayStr());
    setToday(td);
    await loadWeekly();
    await calcStreak();
    return true;
  };

  const logout = async () => {
    setUser(null);
    setIsAuthenticated(false);
    setToday(emptyDay());
  };

  const updateProfile = async (name: string) => {
    if (!user) return;
    const updated = { ...user, name };
    await AsyncStorage.setItem(KEYS.user, JSON.stringify(updated));
    setUser(updated);
  };

  const addWater = async (ml: number) => {
    const entry: WaterEntry = { id: Date.now().toString(), ml, time: new Date().toISOString() };
    const updated = { ...today, water: [...today.water, entry] };
    setToday(updated);
    await saveDayData(updated);
  };

  const addWorkout = async (w: Omit<WorkoutEntry, 'id' | 'time'>) => {
    const entry: WorkoutEntry = { ...w, id: Date.now().toString(), time: new Date().toISOString() };
    const updated = { ...today, workouts: [...today.workouts, entry] };
    setToday(updated);
    await saveDayData(updated);
    await calcStreak();
    await loadWeekly();
  };

  const addMeal = async (m: Omit<MealEntry, 'id' | 'time'>) => {
    const entry: MealEntry = { ...m, id: Date.now().toString(), time: new Date().toISOString() };
    const newCalories = today.caloriesConsumed + m.kcal;
    const updated = { ...today, meals: [...today.meals, entry], caloriesConsumed: newCalories };
    setToday(updated);
    await saveDayData(updated);
  };

  const deleteMeal = async (id: string) => {
    const meal = today.meals.find((m) => m.id === id);
    if (!meal) return;
    const newCalories = Math.max(0, today.caloriesConsumed - meal.kcal);
    const updated = { ...today, meals: today.meals.filter((m) => m.id !== id), caloriesConsumed: newCalories };
    setToday(updated);
    await saveDayData(updated);
  };

  const updateSteps = async (steps: number) => {
    const updated = { ...today, steps };
    setToday(updated);
    await saveDayData(updated);
    await loadWeekly();
  };

  const updateSleep = async (hours: number, minutes: number, quality: number) => {
    const sleep: DailySleep = { date: today.date, hours, minutes, quality };
    const updated = { ...today, sleep };
    setToday(updated);
    await saveDayData(updated);
  };

  const updateStress = async (level: 'low' | 'medium' | 'high') => {
    const updated = { ...today, stressLevel: level };
    setToday(updated);
    await saveDayData(updated);
  };

  const updateCalories = async (consumed: number) => {
    const updated = { ...today, caloriesConsumed: consumed };
    setToday(updated);
    await saveDayData(updated);
  };

  const updateGoals = async (g: Partial<UserGoals>) => {
    const updated = { ...goals, ...g };
    setGoals(updated);
    await AsyncStorage.setItem(KEYS.goals, JSON.stringify(updated));
  };

  return (
    <HealthContext value={{
      isAuthenticated,
      user,
      goals,
      login,
      register,
      logout,
      updateProfile,
      today,
      streakDays,
      weeklySteps,
      weeklyWorkoutCounts,
      addWater,
      addWorkout,
      addMeal,
      deleteMeal,
      updateSteps,
      updateSleep,
      updateStress,
      updateCalories,
      updateGoals,
      loading,
    }}>
      {children}
    </HealthContext>
  );
}
