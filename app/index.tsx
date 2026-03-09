import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import {
  Moon,
  Droplet,
  Utensils,
  TrendingDown,
  User,
  Activity,
  HeartPulse,
  LogOut,
  Footprints,
} from 'lucide-react-native';
import { HealthContext } from '../store/health-store';

const PRIMARY = '#007bff';
const LIGHT_BG = '#f8fafc';
const CARD_LIGHT = '#ffffff';

export default function TodayScreen() {
  const {
    user,
    today,
    streakDays,
    weeklySteps,
    addWater,
    updateSteps,
    updateSleep,
    updateStress,
    updateCalories,
    logout,
  } = React.use(HealthContext);

  const [stepsInput, setStepsInput] = React.useState('');
  const [caloriesInput, setCaloriesInput] = React.useState('');
  const [showStepsInput, setShowStepsInput] = React.useState(false);
  const [showCalInput, setShowCalInput] = React.useState(false);

  const textPrimary = '#0f172a';
  const textMuted = '#94a3b8';
  const borderColor = '#f1f5f9';

  const totalWaterMl = today.water.reduce((sum, w) => sum + w.ml, 0);
  const waterLiters = (totalWaterMl / 1000).toFixed(1);
  const waterGoal = 2.5;
  const waterPct = Math.min(100, (totalWaterMl / (waterGoal * 1000)) * 100);

  const totalWorkoutKcal = today.workouts.reduce((sum, w) => sum + w.kcal, 0);
  const caloriesLeft = Math.max(0, today.calorieGoal - today.caloriesConsumed);

  const sleepStr = today.sleep
    ? `${today.sleep.hours}h ${today.sleep.minutes}m`
    : 'Not logged';
  const sleepQuality = today.sleep?.quality ?? 0;

  const stressColor =
    today.stressLevel === 'low'
      ? '#10b981'
      : today.stressLevel === 'medium'
      ? '#f59e0b'
      : '#ef4444';
  const stressText = today.stressLevel.charAt(0).toUpperCase() + today.stressLevel.slice(1);

  const progressPct = Math.round(
    ((today.steps > 0 ? 25 : 0) +
      (totalWaterMl > 500 ? 25 : 0) +
      (today.workouts.length > 0 ? 25 : 0) +
      (today.sleep ? 25 : 0)) 
  );

  const dayName = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: LIGHT_BG }} edges={['top']}>
      <StatusBar style="dark" />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: 24, paddingTop: 16, paddingBottom: 12 }}>
          <View>
            <Text style={{ fontSize: 32, fontWeight: '800', color: textPrimary, letterSpacing: -0.5 }}>Today</Text>
            <Text style={{ fontSize: 14, color: textMuted, fontWeight: '500', marginTop: 2 }}>{dayName}</Text>
          </View>
          <TouchableOpacity
            onPress={logout}
            style={{
              width: 42,
              height: 42,
              borderRadius: 21,
              borderWidth: 2,
              borderColor: PRIMARY,
              backgroundColor: `${PRIMARY}20`,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <LogOut size={18} color={PRIMARY} />
          </TouchableOpacity>
        </View>

        {/* Greeting */}
        {user && (
          <View style={{ paddingHorizontal: 24, marginBottom: 8 }}>
            <Text style={{ fontSize: 16, color: textMuted }}>
              Hello, <Text style={{ fontWeight: '700', color: textPrimary }}>{user.name}</Text>
            </Text>
          </View>
        )}

        {/* Daily Progress Summary */}
        <View style={{ paddingHorizontal: 24, marginBottom: 24 }}>
          <View
            style={{
              backgroundColor: CARD_LIGHT,
              borderRadius: 16,
              padding: 16,
              borderWidth: 1,
              borderColor,
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)' as any,
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Text style={{ fontSize: 10, fontWeight: '700', color: textMuted, letterSpacing: 1, textTransform: 'uppercase' }}>
                Daily Progress Summary
              </Text>
              <Text style={{ fontSize: 11, fontWeight: '700', color: PRIMARY }}>{progressPct}% Overall</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 4, height: 8 }}>
              <View style={{ flex: progressPct, backgroundColor: PRIMARY, borderRadius: 99 }} />
              <View style={{ flex: Math.max(1, 100 - progressPct), backgroundColor: '#f1f5f9', borderRadius: 99 }} />
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Footprints size={12} color={PRIMARY} />
                <Text style={{ fontSize: 10, fontWeight: '700', color: textMuted }}>{today.steps.toLocaleString()} steps</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Droplet size={12} color="#06b6d4" />
                <Text style={{ fontSize: 10, fontWeight: '700', color: textMuted }}>{waterLiters}L water</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Activity size={12} color="#10b981" />
                <Text style={{ fontSize: 10, fontWeight: '700', color: textMuted }}>{today.workouts.length} workouts</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Metric Cards */}
        <View style={{ paddingHorizontal: 24, gap: 14 }}>

          {/* Sleep Card */}
          <View style={{ backgroundColor: CARD_LIGHT, borderRadius: 16, padding: 16, borderWidth: 1, borderColor, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' as any }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: '#eef2ff', alignItems: 'center', justifyContent: 'center' }}>
                  <Moon size={18} color="#4f46e5" />
                </View>
                <View>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: textPrimary }}>Sleep Quality</Text>
                  <Text style={{ fontSize: 11, color: textMuted }}>Restorative Period</Text>
                </View>
              </View>
              <Text style={{ fontSize: 18, fontWeight: '700', color: textPrimary }}>{sleepStr}</Text>
            </View>
            {!today.sleep && (
              <TouchableOpacity
                onPress={() => updateSleep(7, 30, 80)}
                style={{ marginTop: 12, backgroundColor: `${PRIMARY}10`, padding: 10, borderRadius: 10, alignItems: 'center' }}
              >
                <Text style={{ fontSize: 12, fontWeight: '700', color: PRIMARY }}>+ Log Sleep (7h 30m)</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Hydration Card */}
          <View style={{ backgroundColor: CARD_LIGHT, borderRadius: 16, padding: 16, borderWidth: 1, borderColor, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' as any }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: '#ecfeff', alignItems: 'center', justifyContent: 'center' }}>
                  <Droplet size={18} color="#0284c7" />
                </View>
                <View>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: textPrimary }}>Hydration</Text>
                  <Text style={{ fontSize: 11, color: textMuted }}>Goal: {waterGoal}L</Text>
                </View>
              </View>
              <Text style={{ fontSize: 18, fontWeight: '700', color: textPrimary }}>
                {waterLiters} <Text style={{ fontSize: 11, color: textMuted }}>/ {waterGoal}L</Text>
              </Text>
            </View>
            <View style={{ height: 6, backgroundColor: '#f1f5f9', borderRadius: 99, marginTop: 12, overflow: 'hidden' }}>
              <View style={{ height: '100%', width: `${waterPct}%`, backgroundColor: '#06b6d4', borderRadius: 99 }} />
            </View>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
              {[250, 500].map((ml) => (
                <TouchableOpacity
                  key={ml}
                  onPress={() => addWater(ml)}
                  style={{ flex: 1, backgroundColor: `#06b6d410`, padding: 10, borderRadius: 10, alignItems: 'center' }}
                >
                  <Text style={{ fontSize: 12, fontWeight: '700', color: '#0284c7' }}>+ {ml}ml</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Nutrition Card */}
          <View style={{ backgroundColor: CARD_LIGHT, borderRadius: 16, padding: 16, borderWidth: 1, borderColor, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' as any }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: '#fffbeb', alignItems: 'center', justifyContent: 'center' }}>
                  <Utensils size={18} color="#d97706" />
                </View>
                <View>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: textPrimary }}>Nutrition</Text>
                  <Text style={{ fontSize: 11, color: textMuted }}>Goal: {today.calorieGoal} kcal</Text>
                </View>
              </View>
              <Text style={{ fontSize: 18, fontWeight: '700', color: textPrimary }}>
                {caloriesLeft.toLocaleString()} <Text style={{ fontSize: 11, color: textMuted }}>kcal left</Text>
              </Text>
            </View>
            {!showCalInput ? (
              <TouchableOpacity
                onPress={() => setShowCalInput(true)}
                style={{ marginTop: 12, backgroundColor: '#f59e0b15', padding: 10, borderRadius: 10, alignItems: 'center' }}
              >
                <Text style={{ fontSize: 12, fontWeight: '700', color: '#d97706' }}>+ Log Calories</Text>
              </TouchableOpacity>
            ) : (
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
                <TextInput
                  style={{ flex: 1, backgroundColor: '#f1f5f9', borderRadius: 10, padding: 10, fontSize: 14, color: textPrimary }}
                  placeholder="kcal eaten"
                  placeholderTextColor={textMuted}
                  keyboardType="numeric"
                  value={caloriesInput}
                  onChangeText={setCaloriesInput}
                />
                <TouchableOpacity
                  onPress={() => {
                    const val = parseInt(caloriesInput);
                    if (val > 0) {
                      updateCalories(today.caloriesConsumed + val);
                      setCaloriesInput('');
                      setShowCalInput(false);
                    }
                  }}
                  style={{ backgroundColor: '#f59e0b', paddingHorizontal: 16, borderRadius: 10, justifyContent: 'center' }}
                >
                  <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}>Add</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Steps Card */}
          <View style={{ backgroundColor: CARD_LIGHT, borderRadius: 16, padding: 16, borderWidth: 1, borderColor, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' as any }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: `${PRIMARY}15`, alignItems: 'center', justifyContent: 'center' }}>
                  <Footprints size={18} color={PRIMARY} />
                </View>
                <View>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: textPrimary }}>Steps</Text>
                  <Text style={{ fontSize: 11, color: textMuted }}>Goal: 10,000</Text>
                </View>
              </View>
              <Text style={{ fontSize: 18, fontWeight: '700', color: textPrimary, fontVariant: ['tabular-nums'] }}>
                {today.steps.toLocaleString()}
              </Text>
            </View>
            <View style={{ height: 6, backgroundColor: '#f1f5f9', borderRadius: 99, marginTop: 12, overflow: 'hidden' }}>
              <View style={{ height: '100%', width: `${Math.min(100, (today.steps / 10000) * 100)}%`, backgroundColor: PRIMARY, borderRadius: 99 }} />
            </View>
            {!showStepsInput ? (
              <TouchableOpacity
                onPress={() => setShowStepsInput(true)}
                style={{ marginTop: 12, backgroundColor: `${PRIMARY}10`, padding: 10, borderRadius: 10, alignItems: 'center' }}
              >
                <Text style={{ fontSize: 12, fontWeight: '700', color: PRIMARY }}>+ Log Steps</Text>
              </TouchableOpacity>
            ) : (
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
                <TextInput
                  style={{ flex: 1, backgroundColor: '#f1f5f9', borderRadius: 10, padding: 10, fontSize: 14, color: textPrimary }}
                  placeholder="Number of steps"
                  placeholderTextColor={textMuted}
                  keyboardType="numeric"
                  value={stepsInput}
                  onChangeText={setStepsInput}
                />
                <TouchableOpacity
                  onPress={() => {
                    const val = parseInt(stepsInput);
                    if (val > 0) {
                      updateSteps(today.steps + val);
                      setStepsInput('');
                      setShowStepsInput(false);
                    }
                  }}
                  style={{ backgroundColor: PRIMARY, paddingHorizontal: 16, borderRadius: 10, justifyContent: 'center' }}
                >
                  <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}>Add</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Stress Card */}
          <View style={{ backgroundColor: CARD_LIGHT, borderRadius: 16, padding: 16, borderWidth: 1, borderColor, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' as any }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: '#f0fdf4', alignItems: 'center', justifyContent: 'center' }}>
                  <TrendingDown size={18} color="#059669" />
                </View>
                <View>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: textPrimary }}>Stress Level</Text>
                  <Text style={{ fontSize: 11, color: textMuted }}>How are you feeling?</Text>
                </View>
              </View>
              <Text style={{ fontSize: 18, fontWeight: '700', color: stressColor }}>{stressText}</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {(['low', 'medium', 'high'] as const).map((level) => (
                <TouchableOpacity
                  key={level}
                  onPress={() => updateStress(level)}
                  style={{
                    flex: 1,
                    paddingVertical: 8,
                    borderRadius: 10,
                    alignItems: 'center',
                    backgroundColor: today.stressLevel === level
                      ? (level === 'low' ? '#10b981' : level === 'medium' ? '#f59e0b' : '#ef4444')
                      : '#f1f5f9',
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: '700',
                      color: today.stressLevel === level ? '#fff' : textMuted,
                    }}
                  >
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Today's Workouts */}
        {today.workouts.length > 0 && (
          <View style={{ paddingHorizontal: 24, marginTop: 20 }}>
            <Text style={{ fontSize: 11, fontWeight: '700', color: textMuted, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 12 }}>
              Today's Workouts
            </Text>
            <View style={{ gap: 10 }}>
              {today.workouts.map((w) => (
                <View
                  key={w.id}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                    padding: 14,
                    backgroundColor: CARD_LIGHT,
                    borderRadius: 14,
                    borderWidth: 1,
                    borderColor,
                  }}
                >
                  <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: '#eff6ff', alignItems: 'center', justifyContent: 'center' }}>
                    <Activity size={18} color="#3b82f6" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 12, fontWeight: '600', color: textPrimary }}>{w.name}</Text>
                    <Text style={{ fontSize: 10, color: textMuted, marginTop: 2 }}>
                      {w.durationMin} min{w.distanceKm ? ` • ${w.distanceKm} km` : ''}
                    </Text>
                  </View>
                  <View style={{ backgroundColor: '#f0fdf4', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99 }}>
                    <Text style={{ fontSize: 11, fontWeight: '700', color: '#16a34a' }}>{w.kcal} kcal</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
