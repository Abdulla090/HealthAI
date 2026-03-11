import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Modal,
  Pressable,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Animated, {
  FadeInDown,
  FadeInUp,
  FadeIn,
  FadeOut,
  FadeInLeft,
  FadeInRight,
  LinearTransition,
  SlideInDown,
  SlideOutDown,
  ZoomIn,
} from 'react-native-reanimated';
import {
  Moon,
  Droplet,
  Utensils,
  TrendingDown,
  Activity,
  LogOut,
  Footprints,
  X,
} from 'lucide-react-native';
import { HealthContext } from '../store/health-store';
import {
  AnimatedPressable,
  AnimatedProgressBar,
  cardEntering,
  STAGGER_DELAY,
} from '../components/animated-utils';
import * as Haptics from 'expo-haptics';

const PRIMARY = '#007bff';
const LIGHT_BG = '#f8fafc';
const CARD_LIGHT = '#ffffff';

export default function TodayScreen() {
  const {
    user,
    today,
    goals,
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

  // Sleep modal
  const [showSleepModal, setShowSleepModal] = React.useState(false);
  const [sleepHoursInput, setSleepHoursInput] = React.useState('7');
  const [sleepMinutesInput, setSleepMinutesInput] = React.useState('30');
  const [sleepQualityInput, setSleepQualityInput] = React.useState('80');

  const textPrimary = '#0f172a';
  const textMuted = '#94a3b8';
  const borderColor = '#f1f5f9';

  const totalWaterMl = today.water.reduce((sum, w) => sum + w.ml, 0);
  const waterGoalL = goals.dailyWaterMl / 1000;
  const waterLiters = (totalWaterMl / 1000).toFixed(1);
  const waterPct = Math.min(100, (totalWaterMl / goals.dailyWaterMl) * 100);

  const caloriesLeft = Math.max(0, today.calorieGoal - today.caloriesConsumed);

  const sleepStr = today.sleep
    ? `${today.sleep.hours}h ${today.sleep.minutes}m`
    : 'Not logged';

  const stressColor =
    today.stressLevel === 'low'
      ? '#10b981'
      : today.stressLevel === 'medium'
      ? '#f59e0b'
      : '#ef4444';
  const stressText = today.stressLevel.charAt(0).toUpperCase() + today.stressLevel.slice(1);

  const progressPct = Math.round(
    (today.steps >= goals.dailySteps ? 25 : today.steps > 0 ? Math.round((today.steps / goals.dailySteps) * 25) : 0) +
    (totalWaterMl >= goals.dailyWaterMl ? 25 : totalWaterMl > 0 ? Math.round((totalWaterMl / goals.dailyWaterMl) * 25) : 0) +
    (today.workouts.length > 0 ? 25 : 0) +
    (today.sleep ? 25 : 0)
  );

  const dayName = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  const triggerHaptic = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleSaveSleep = () => {
    const hours = parseInt(sleepHoursInput) || 0;
    const minutes = parseInt(sleepMinutesInput) || 0;
    const quality = Math.max(0, Math.min(100, parseInt(sleepQualityInput) || 0));
    if (hours > 0 || minutes > 0) {
      if (Platform.OS === 'ios') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      updateSleep(hours, minutes, quality);
      setShowSleepModal(false);
    }
  };

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
        <Animated.View
          entering={FadeInLeft.duration(500).springify().damping(18)}
          style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: 24, paddingTop: 16, paddingBottom: 12 }}
        >
          <View>
            <Text style={{ fontSize: 32, fontWeight: '800', color: textPrimary, letterSpacing: -0.5 }}>Today</Text>
            <Text style={{ fontSize: 14, color: textMuted, fontWeight: '500', marginTop: 2 }}>{dayName}</Text>
          </View>
          <AnimatedPressable
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
            scaleDown={0.85}
          >
            <LogOut size={18} color={PRIMARY} />
          </AnimatedPressable>
        </Animated.View>

        {/* Greeting */}
        {user && (
          <Animated.View entering={FadeIn.delay(200).duration(400)} style={{ paddingHorizontal: 24, marginBottom: 8 }}>
            <Text style={{ fontSize: 16, color: textMuted }}>
              Hello, <Text style={{ fontWeight: '700', color: textPrimary }}>{user.name}</Text>
            </Text>
          </Animated.View>
        )}

        {/* Daily Progress Summary */}
        <Animated.View entering={cardEntering(0)} style={{ paddingHorizontal: 24, marginBottom: 24 }}>
          <AnimatedPressable
            scaleDown={0.98}
            onPress={() => {}}
            style={{
              backgroundColor: CARD_LIGHT,
              borderRadius: 16,
              padding: 16,
              borderWidth: 1,
              borderColor,
              ...(Platform.OS === 'web' ? { boxShadow: '0 1px 3px rgba(0,0,0,0.06)' } : { elevation: 1 }),
              borderCurve: 'continuous' as any,
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Text style={{ fontSize: 10, fontWeight: '700', color: textMuted, letterSpacing: 1, textTransform: 'uppercase' }}>
                Daily Progress Summary
              </Text>
              <Animated.Text
                entering={ZoomIn.delay(300).duration(350).springify()}
                style={{ fontSize: 11, fontWeight: '700', color: PRIMARY }}
              >
                {progressPct}% Overall
              </Animated.Text>
            </View>
            <AnimatedProgressBar progress={progressPct} color={PRIMARY} height={8} delay={400} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
              <Animated.View entering={FadeInUp.delay(500).duration(300)} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Footprints size={12} color={PRIMARY} />
                <Text style={{ fontSize: 10, fontWeight: '700', color: textMuted }}>{today.steps.toLocaleString()} steps</Text>
              </Animated.View>
              <Animated.View entering={FadeInUp.delay(580).duration(300)} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Droplet size={12} color="#06b6d4" />
                <Text style={{ fontSize: 10, fontWeight: '700', color: textMuted }}>{waterLiters}L water</Text>
              </Animated.View>
              <Animated.View entering={FadeInUp.delay(660).duration(300)} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Activity size={12} color="#10b981" />
                <Text style={{ fontSize: 10, fontWeight: '700', color: textMuted }}>{today.workouts.length} workouts</Text>
              </Animated.View>
            </View>
          </AnimatedPressable>
        </Animated.View>

        {/* Metric Cards */}
        <View style={{ paddingHorizontal: 24, gap: 14 }}>

          {/* Sleep Card */}
          <Animated.View entering={cardEntering(1)} layout={LinearTransition.springify().damping(18)}>
            <AnimatedPressable
              scaleDown={0.98}
              onPress={() => {
                if (!today.sleep) {
                  triggerHaptic();
                  setShowSleepModal(true);
                }
              }}
              style={{ backgroundColor: CARD_LIGHT, borderRadius: 16, padding: 16, borderWidth: 1, borderColor, ...(Platform.OS === 'web' ? { boxShadow: '0 1px 3px rgba(0,0,0,0.06)' } : { elevation: 1 }), borderCurve: 'continuous' as any }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: '#eef2ff', alignItems: 'center', justifyContent: 'center', borderCurve: 'continuous' as any }}>
                    <Moon size={18} color="#4f46e5" />
                  </View>
                  <View>
                    <Text style={{ fontSize: 13, fontWeight: '700', color: textPrimary }}>Sleep Quality</Text>
                    <Text style={{ fontSize: 11, color: textMuted }}>
                      {today.sleep ? `Quality: ${today.sleep.quality}%` : 'Restorative Period'}
                    </Text>
                  </View>
                </View>
                <Animated.Text entering={FadeInRight.delay(300).duration(300)} style={{ fontSize: 18, fontWeight: '700', color: textPrimary }}>
                  {sleepStr}
                </Animated.Text>
              </View>
              {!today.sleep && (
                <Animated.View entering={FadeInDown.duration(300)} exiting={FadeOut.duration(200)}>
                  <View style={{ marginTop: 12, backgroundColor: '#4f46e515', padding: 10, borderRadius: 10, alignItems: 'center', borderCurve: 'continuous' as any }}>
                    <Text style={{ fontSize: 12, fontWeight: '700', color: '#4f46e5' }}>+ Log Sleep</Text>
                  </View>
                </Animated.View>
              )}
            </AnimatedPressable>
          </Animated.View>

          {/* Hydration Card */}
          <Animated.View entering={cardEntering(2)} layout={LinearTransition.springify().damping(18)}>
            <View style={{ backgroundColor: CARD_LIGHT, borderRadius: 16, padding: 16, borderWidth: 1, borderColor, ...(Platform.OS === 'web' ? { boxShadow: '0 1px 3px rgba(0,0,0,0.06)' } : { elevation: 1 }), borderCurve: 'continuous' as any }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: '#ecfeff', alignItems: 'center', justifyContent: 'center', borderCurve: 'continuous' as any }}>
                    <Droplet size={18} color="#0284c7" />
                  </View>
                  <View>
                    <Text style={{ fontSize: 13, fontWeight: '700', color: textPrimary }}>Hydration</Text>
                    <Text style={{ fontSize: 11, color: textMuted }}>Goal: {waterGoalL}L</Text>
                  </View>
                </View>
                <Animated.Text entering={FadeInRight.delay(400).duration(300)} style={{ fontSize: 18, fontWeight: '700', color: textPrimary }}>
                  {waterLiters} <Text style={{ fontSize: 11, color: textMuted }}>/ {waterGoalL}L</Text>
                </Animated.Text>
              </View>
              <View style={{ marginTop: 12 }}>
                <AnimatedProgressBar progress={waterPct} color="#06b6d4" delay={600} />
              </View>
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
                {[250, 500].map((ml) => (
                  <AnimatedPressable
                    key={ml}
                    onPress={() => {
                      triggerHaptic();
                      addWater(ml);
                    }}
                    scaleDown={0.94}
                    style={{ flex: 1, backgroundColor: '#06b6d410', padding: 10, borderRadius: 10, alignItems: 'center', borderCurve: 'continuous' as any }}
                  >
                    <Text style={{ fontSize: 12, fontWeight: '700', color: '#0284c7' }}>+ {ml}ml</Text>
                  </AnimatedPressable>
                ))}
              </View>
            </View>
          </Animated.View>

          {/* Nutrition Card */}
          <Animated.View entering={cardEntering(3)} layout={LinearTransition.springify().damping(18)}>
            <View style={{ backgroundColor: CARD_LIGHT, borderRadius: 16, padding: 16, borderWidth: 1, borderColor, ...(Platform.OS === 'web' ? { boxShadow: '0 1px 3px rgba(0,0,0,0.06)' } : { elevation: 1 }), borderCurve: 'continuous' as any }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: '#fffbeb', alignItems: 'center', justifyContent: 'center', borderCurve: 'continuous' as any }}>
                    <Utensils size={18} color="#d97706" />
                  </View>
                  <View>
                    <Text style={{ fontSize: 13, fontWeight: '700', color: textPrimary }}>Nutrition</Text>
                    <Text style={{ fontSize: 11, color: textMuted }}>Goal: {goals.dailyCalories} kcal</Text>
                  </View>
                </View>
                <Text style={{ fontSize: 18, fontWeight: '700', color: textPrimary }}>
                  {caloriesLeft.toLocaleString()} <Text style={{ fontSize: 11, color: textMuted }}>kcal left</Text>
                </Text>
              </View>
              {!showCalInput ? (
                <Animated.View entering={FadeIn.duration(250)} exiting={FadeOut.duration(200)}>
                  <AnimatedPressable
                    onPress={() => {
                      triggerHaptic();
                      setShowCalInput(true);
                    }}
                    scaleDown={0.95}
                    style={{ marginTop: 12, backgroundColor: '#f59e0b15', padding: 10, borderRadius: 10, alignItems: 'center', borderCurve: 'continuous' as any }}
                  >
                    <Text style={{ fontSize: 12, fontWeight: '700', color: '#d97706' }}>+ Log Calories</Text>
                  </AnimatedPressable>
                </Animated.View>
              ) : (
                <Animated.View entering={SlideInDown.duration(350).springify().damping(18)} exiting={SlideOutDown.duration(250)} style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
                  <TextInput
                    style={{ flex: 1, backgroundColor: '#f1f5f9', borderRadius: 10, padding: 10, fontSize: 14, color: textPrimary }}
                    placeholder="kcal eaten"
                    placeholderTextColor={textMuted}
                    keyboardType="numeric"
                    value={caloriesInput}
                    onChangeText={setCaloriesInput}
                    autoFocus
                  />
                  <AnimatedPressable
                    onPress={() => {
                      const val = parseInt(caloriesInput);
                      if (val > 0) {
                        triggerHaptic();
                        updateCalories(today.caloriesConsumed + val);
                        setCaloriesInput('');
                        setShowCalInput(false);
                      }
                    }}
                    scaleDown={0.92}
                    style={{ backgroundColor: '#f59e0b', paddingHorizontal: 16, borderRadius: 10, justifyContent: 'center' }}
                  >
                    <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}>Add</Text>
                  </AnimatedPressable>
                  <AnimatedPressable
                    onPress={() => {
                      setCaloriesInput('');
                      setShowCalInput(false);
                    }}
                    scaleDown={0.92}
                    style={{ paddingHorizontal: 10, justifyContent: 'center' }}
                  >
                    <X size={18} color={textMuted} />
                  </AnimatedPressable>
                </Animated.View>
              )}
            </View>
          </Animated.View>

          {/* Steps Card */}
          <Animated.View entering={cardEntering(4)} layout={LinearTransition.springify().damping(18)}>
            <View style={{ backgroundColor: CARD_LIGHT, borderRadius: 16, padding: 16, borderWidth: 1, borderColor, ...(Platform.OS === 'web' ? { boxShadow: '0 1px 3px rgba(0,0,0,0.06)' } : { elevation: 1 }), borderCurve: 'continuous' as any }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: `${PRIMARY}15`, alignItems: 'center', justifyContent: 'center', borderCurve: 'continuous' as any }}>
                    <Footprints size={18} color={PRIMARY} />
                  </View>
                  <View>
                    <Text style={{ fontSize: 13, fontWeight: '700', color: textPrimary }}>Steps</Text>
                    <Text style={{ fontSize: 11, color: textMuted }}>Goal: {goals.dailySteps.toLocaleString()}</Text>
                  </View>
                </View>
                <Animated.Text entering={FadeInRight.delay(500).duration(300)} style={{ fontSize: 18, fontWeight: '700', color: textPrimary, fontVariant: ['tabular-nums'] }}>
                  {today.steps.toLocaleString()}
                </Animated.Text>
              </View>
              <View style={{ marginTop: 12 }}>
                <AnimatedProgressBar progress={Math.min(100, (today.steps / goals.dailySteps) * 100)} color={PRIMARY} delay={700} />
              </View>
              {!showStepsInput ? (
                <Animated.View entering={FadeIn.duration(250)} exiting={FadeOut.duration(200)}>
                  <AnimatedPressable
                    onPress={() => {
                      triggerHaptic();
                      setShowStepsInput(true);
                    }}
                    scaleDown={0.95}
                    style={{ marginTop: 12, backgroundColor: `${PRIMARY}10`, padding: 10, borderRadius: 10, alignItems: 'center', borderCurve: 'continuous' as any }}
                  >
                    <Text style={{ fontSize: 12, fontWeight: '700', color: PRIMARY }}>+ Log Steps</Text>
                  </AnimatedPressable>
                </Animated.View>
              ) : (
                <Animated.View entering={SlideInDown.duration(350).springify().damping(18)} exiting={SlideOutDown.duration(250)} style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
                  <TextInput
                    style={{ flex: 1, backgroundColor: '#f1f5f9', borderRadius: 10, padding: 10, fontSize: 14, color: textPrimary }}
                    placeholder="Number of steps"
                    placeholderTextColor={textMuted}
                    keyboardType="numeric"
                    value={stepsInput}
                    onChangeText={setStepsInput}
                    autoFocus
                  />
                  <AnimatedPressable
                    onPress={() => {
                      const val = parseInt(stepsInput);
                      if (val > 0) {
                        triggerHaptic();
                        updateSteps(today.steps + val);
                        setStepsInput('');
                        setShowStepsInput(false);
                      }
                    }}
                    scaleDown={0.92}
                    style={{ backgroundColor: PRIMARY, paddingHorizontal: 16, borderRadius: 10, justifyContent: 'center' }}
                  >
                    <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}>Add</Text>
                  </AnimatedPressable>
                  <AnimatedPressable
                    onPress={() => {
                      setStepsInput('');
                      setShowStepsInput(false);
                    }}
                    scaleDown={0.92}
                    style={{ paddingHorizontal: 10, justifyContent: 'center' }}
                  >
                    <X size={18} color={textMuted} />
                  </AnimatedPressable>
                </Animated.View>
              )}
            </View>
          </Animated.View>

          {/* Stress Card */}
          <Animated.View entering={cardEntering(5)}>
            <View style={{ backgroundColor: CARD_LIGHT, borderRadius: 16, padding: 16, borderWidth: 1, borderColor, ...(Platform.OS === 'web' ? { boxShadow: '0 1px 3px rgba(0,0,0,0.06)' } : { elevation: 1 }), borderCurve: 'continuous' as any }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: '#f0fdf4', alignItems: 'center', justifyContent: 'center', borderCurve: 'continuous' as any }}>
                    <TrendingDown size={18} color="#059669" />
                  </View>
                  <View>
                    <Text style={{ fontSize: 13, fontWeight: '700', color: textPrimary }}>Stress Level</Text>
                    <Text style={{ fontSize: 11, color: textMuted }}>How are you feeling?</Text>
                  </View>
                </View>
                <Animated.Text entering={FadeIn.delay(600).duration(300)} style={{ fontSize: 18, fontWeight: '700', color: stressColor }}>
                  {stressText}
                </Animated.Text>
              </View>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {(['low', 'medium', 'high'] as const).map((level) => {
                  const isActive = today.stressLevel === level;
                  const levelColor = level === 'low' ? '#10b981' : level === 'medium' ? '#f59e0b' : '#ef4444';
                  return (
                    <AnimatedPressable
                      key={level}
                      onPress={() => {
                        triggerHaptic();
                        updateStress(level);
                      }}
                      scaleDown={0.92}
                      style={{
                        flex: 1,
                        paddingVertical: 8,
                        borderRadius: 10,
                        alignItems: 'center',
                        backgroundColor: isActive ? levelColor : '#f1f5f9',
                        borderCurve: 'continuous' as any,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 12,
                          fontWeight: '700',
                          color: isActive ? '#fff' : textMuted,
                        }}
                      >
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                      </Text>
                    </AnimatedPressable>
                  );
                })}
              </View>
            </View>
          </Animated.View>
        </View>

        {/* Today's Workouts */}
        {today.workouts.length > 0 && (
          <Animated.View entering={FadeInDown.delay(400).duration(400)} style={{ paddingHorizontal: 24, marginTop: 20 }}>
            <Text style={{ fontSize: 11, fontWeight: '700', color: textMuted, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 12 }}>
              Today's Workouts
            </Text>
            <View style={{ gap: 10 }}>
              {today.workouts.map((w, index) => (
                <Animated.View
                  key={w.id}
                  entering={FadeInDown.delay(index * STAGGER_DELAY + 500).duration(400).springify().damping(18)}
                >
                  <AnimatedPressable
                    scaleDown={0.98}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 12,
                      padding: 14,
                      backgroundColor: CARD_LIGHT,
                      borderRadius: 14,
                      borderWidth: 1,
                      borderColor,
                      borderCurve: 'continuous' as any,
                    }}
                  >
                    <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: '#eff6ff', alignItems: 'center', justifyContent: 'center', borderCurve: 'continuous' as any }}>
                      <Activity size={18} color="#3b82f6" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 12, fontWeight: '600', color: textPrimary }}>{w.name}</Text>
                      <Text style={{ fontSize: 10, color: textMuted, marginTop: 2 }}>
                        {w.durationMin} min{w.distanceKm ? ` • ${w.distanceKm} km` : ''}
                      </Text>
                    </View>
                    <Animated.View entering={ZoomIn.delay(index * STAGGER_DELAY + 700).duration(300).springify()} style={{ backgroundColor: '#f0fdf4', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99 }}>
                      <Text style={{ fontSize: 11, fontWeight: '700', color: '#16a34a' }}>{w.kcal} kcal</Text>
                    </Animated.View>
                  </AnimatedPressable>
                </Animated.View>
              ))}
            </View>
          </Animated.View>
        )}
      </ScrollView>

      {/* Sleep Input Modal */}
      <Modal visible={showSleepModal} animationType="none" transparent>
        <Animated.View
          entering={FadeIn.duration(250)}
          exiting={FadeOut.duration(200)}
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', paddingHorizontal: 32 }}
        >
          <Animated.View
            entering={ZoomIn.duration(400).springify().damping(16).stiffness(120)}
            style={{ backgroundColor: '#fff', borderRadius: 20, padding: 24, borderCurve: 'continuous' as any }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <Animated.Text entering={FadeInDown.delay(100).duration(300)} style={{ fontSize: 20, fontWeight: '800', color: textPrimary }}>
                Log Sleep
              </Animated.Text>
              <AnimatedPressable onPress={() => setShowSleepModal(false)} scaleDown={0.85}>
                <X size={24} color={textMuted} />
              </AnimatedPressable>
            </View>

            <View style={{ gap: 12 }}>
              <Animated.View entering={FadeInDown.delay(150).duration(300)} style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 12, fontWeight: '600', color: textMuted, marginBottom: 4 }}>Hours</Text>
                  <TextInput
                    style={{ backgroundColor: '#f1f5f9', borderRadius: 12, padding: 14, fontSize: 18, color: textPrimary, textAlign: 'center', fontWeight: '700' }}
                    keyboardType="numeric"
                    value={sleepHoursInput}
                    onChangeText={setSleepHoursInput}
                    maxLength={2}
                    selectTextOnFocus
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 12, fontWeight: '600', color: textMuted, marginBottom: 4 }}>Minutes</Text>
                  <TextInput
                    style={{ backgroundColor: '#f1f5f9', borderRadius: 12, padding: 14, fontSize: 18, color: textPrimary, textAlign: 'center', fontWeight: '700' }}
                    keyboardType="numeric"
                    value={sleepMinutesInput}
                    onChangeText={setSleepMinutesInput}
                    maxLength={2}
                    selectTextOnFocus
                  />
                </View>
              </Animated.View>
              <Animated.View entering={FadeInDown.delay(220).duration(300)}>
                <Text style={{ fontSize: 12, fontWeight: '600', color: textMuted, marginBottom: 4 }}>Quality (0–100%)</Text>
                <TextInput
                  style={{ backgroundColor: '#f1f5f9', borderRadius: 12, padding: 14, fontSize: 18, color: textPrimary, textAlign: 'center', fontWeight: '700' }}
                  keyboardType="numeric"
                  value={sleepQualityInput}
                  onChangeText={setSleepQualityInput}
                  maxLength={3}
                  selectTextOnFocus
                />
              </Animated.View>
            </View>

            <Animated.View entering={FadeInUp.delay(280).duration(300)} style={{ flexDirection: 'row', gap: 12, marginTop: 20 }}>
              <AnimatedPressable
                onPress={() => setShowSleepModal(false)}
                scaleDown={0.95}
                style={{ flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center', backgroundColor: '#f1f5f9', borderCurve: 'continuous' as any }}
              >
                <Text style={{ fontSize: 14, fontWeight: '600', color: textMuted }}>Cancel</Text>
              </AnimatedPressable>
              <AnimatedPressable
                onPress={handleSaveSleep}
                scaleDown={0.95}
                style={{ flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center', backgroundColor: '#4f46e5', borderCurve: 'continuous' as any }}
              >
                <Text style={{ fontSize: 14, fontWeight: '700', color: '#fff' }}>Save</Text>
              </AnimatedPressable>
            </Animated.View>
          </Animated.View>
        </Animated.View>
      </Modal>
    </SafeAreaView>
  );
}
