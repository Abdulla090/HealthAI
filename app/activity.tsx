import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Pressable,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Svg, { Path, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import Animated, {
  FadeInDown,
  FadeInUp,
  FadeIn,
  FadeOut,
  FadeInLeft,
  FadeInRight,
  SlideInDown,
  SlideOutDown,
  ZoomIn,
  ZoomOut,
  LinearTransition,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { User, Bell, Footprints, Bike, Flame, ChevronRight, Plus, X, Dumbbell, Waves } from 'lucide-react-native';
import { HealthContext, WorkoutEntry } from '../store/health-store';
import {
  AnimatedPressable,
  AnimatedFAB,
  cardEntering,
  STAGGER_DELAY,
} from '../components/animated-utils';
import * as Haptics from 'expo-haptics';

const PRIMARY = '#007bff';
const LIGHT_BG = '#f5f7f8';
const CARD_LIGHT = '#ffffff';

type PeriodTab = 'Week' | 'Month' | 'Year';

const WORKOUT_TYPES = [
  { type: 'run', name: 'Running', icon: <Footprints size={24} color="#ea580c" />, iconBg: '#fff7ed' },
  { type: 'cycle', name: 'Cycling', icon: <Bike size={24} color="#2563eb" />, iconBg: '#eff6ff' },
  { type: 'yoga', name: 'Yoga', icon: <Flame size={24} color="#9333ea" />, iconBg: '#faf5ff' },
  { type: 'gym', name: 'Gym', icon: <Dumbbell size={24} color="#dc2626" />, iconBg: '#fef2f2' },
  { type: 'swim', name: 'Swimming', icon: <Waves size={24} color="#0891b2" />, iconBg: '#ecfeff' },
  { type: 'walk', name: 'Walking', icon: <Footprints size={24} color="#16a34a" />, iconBg: '#f0fdf4' },
] as const;

function getWorkoutIcon(type: string) {
  const found = WORKOUT_TYPES.find((w) => w.type === type);
  return found ?? WORKOUT_TYPES[0];
}

// Animated bar for streak visualization
function AnimatedStreakBar({ height, isToday, index }: { height: number; isToday: boolean; index: number }) {
  const barHeight = useSharedValue(0);

  React.useEffect(() => {
    barHeight.value = withDelay(
      index * 80 + 300,
      withSpring(height * 48, { damping: 14, stiffness: 100, mass: 0.8 })
    );
  }, [height]);

  const animStyle = useAnimatedStyle(() => ({
    height: barHeight.value,
    backgroundColor: isToday ? '#ffffff' : 'rgba(255,255,255,0.3)',
    borderRadius: 3,
    flex: 1,
  }));

  return <Animated.View style={animStyle} />;
}

export default function ActivityScreen() {
  const { today, streakDays, weeklySteps, weeklyWorkoutCounts, addWorkout } = React.use(HealthContext);
  const [activePeriod, setActivePeriod] = useState<PeriodTab>('Week');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newWorkoutType, setNewWorkoutType] = useState<string>('run');
  const [newName, setNewName] = useState('');
  const [newDuration, setNewDuration] = useState('');
  const [newDistance, setNewDistance] = useState('');
  const [newKcal, setNewKcal] = useState('');

  const textPrimary = '#0f172a';
  const textMuted = '#94a3b8';
  const borderColor = '#f1f5f9';
  const segmentBg = '#e2e8f0';
  const segmentActiveBg = CARD_LIGHT;

  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  const maxStep = Math.max(...weeklySteps, 1);
  const streakBarHeights = weeklyWorkoutCounts.map((c) => Math.max(0.1, c > 0 ? Math.min(1, c / 3) : 0.08));

  // Build line chart from weekly steps
  const chartPoints = weeklySteps.map((s, i) => {
    const x = (i / 6) * 400;
    const y = 90 - (s / Math.max(maxStep, 1)) * 70;
    return { x, y };
  });
  let linePath = '';
  if (chartPoints.length > 1) {
    linePath = `M${chartPoints[0].x},${chartPoints[0].y}`;
    for (let i = 1; i < chartPoints.length; i++) {
      const cp1x = (chartPoints[i - 1].x + chartPoints[i].x) / 2;
      linePath += ` C${cp1x},${chartPoints[i - 1].y} ${cp1x},${chartPoints[i].y} ${chartPoints[i].x},${chartPoints[i].y}`;
    }
  }
  const areaPath = linePath
    ? `${linePath} L400,100 L0,100 Z`
    : '';
  const currentDayIdx = new Date().getDay(); // 0=Sun
  const todayIdx = currentDayIdx === 0 ? 6 : currentDayIdx - 1;
  const dotPoint = chartPoints[todayIdx];

  const handleAddWorkout = async () => {
    const dur = parseInt(newDuration) || 30;
    const kcal = parseInt(newKcal) || Math.round(dur * 8);
    const dist = parseFloat(newDistance) || undefined;
    const wType = WORKOUT_TYPES.find((w) => w.type === newWorkoutType);
    if (Platform.OS === 'ios') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    await addWorkout({
      type: newWorkoutType as WorkoutEntry['type'],
      name: newName.trim() || wType?.name || 'Workout',
      durationMin: dur,
      distanceKm: dist,
      kcal,
    });
    setShowAddModal(false);
    setNewName('');
    setNewDuration('');
    setNewDistance('');
    setNewKcal('');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: LIGHT_BG }} edges={['top']}>
      <StatusBar style="dark" />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header — animated */}
        <Animated.View
          entering={FadeInLeft.duration(450).springify().damping(18)}
          style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingTop: 16, paddingBottom: 8 }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: `${PRIMARY}15`, alignItems: 'center', justifyContent: 'center' }}>
              <User size={20} color={PRIMARY} />
            </View>
            <Text style={{ fontSize: 22, fontWeight: '800', color: textPrimary, letterSpacing: -0.5 }}>Activity</Text>
          </View>
          <AnimatedPressable
            scaleDown={0.88}
            style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: CARD_LIGHT, alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' as any }}
          >
            <Bell size={18} color={textPrimary} />
          </AnimatedPressable>
        </Animated.View>

        <View style={{ paddingHorizontal: 20, gap: 20 }}>
          {/* Streak Banner — animated entrance */}
          <Animated.View
            entering={FadeInDown.delay(100).duration(500).springify().damping(16)}
            style={{ backgroundColor: PRIMARY, borderRadius: 20, padding: 20, overflow: 'hidden', boxShadow: '0 6px 20px rgba(0,123,255,0.35)' as any, borderCurve: 'continuous' }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View>
                <Text style={{ fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.8)' }}>Workout Streak</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
                  <Animated.Text entering={ZoomIn.delay(400).duration(300).springify()} style={{ fontSize: 26, fontWeight: '800', color: '#fff' }}>
                    {streakDays} Day{streakDays !== 1 ? 's' : ''}
                  </Animated.Text>
                  <Animated.View entering={ZoomIn.delay(600).duration(350).springify().damping(10)}>
                    <Flame size={24} color="#fcd34d" fill="#fcd34d" />
                  </Animated.View>
                </View>
              </View>
              <Animated.View entering={FadeIn.delay(500).duration(300)} style={{ backgroundColor: 'rgba(255,255,255,0.25)', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 99 }}>
                <Text style={{ fontSize: 11, fontWeight: '700', color: '#fff' }}>
                  Level {Math.min(10, Math.floor(streakDays / 3) + 1)}
                </Text>
              </Animated.View>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 4, height: 48, marginTop: 20 }}>
              {streakBarHeights.map((h, i) => (
                <AnimatedStreakBar key={i} height={h} isToday={i === todayIdx} index={i} />
              ))}
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
              {days.map((d, i) => (
                <Animated.Text
                  key={i}
                  entering={FadeIn.delay(i * 60 + 600).duration(200)}
                  style={{ flex: 1, textAlign: 'center', fontSize: 10, fontWeight: '700', color: i === todayIdx ? '#fff' : 'rgba(255,255,255,0.65)', textDecorationLine: i === todayIdx ? 'underline' : 'none' }}
                >
                  {d}
                </Animated.Text>
              ))}
            </View>
          </Animated.View>

          {/* Segmented Control — animated */}
          <Animated.View entering={FadeInDown.delay(250).duration(400)} style={{ backgroundColor: segmentBg, borderRadius: 10, padding: 4, flexDirection: 'row' }}>
            {(['Week', 'Month', 'Year'] as PeriodTab[]).map((tab) => (
              <AnimatedPressable
                key={tab}
                onPress={() => {
                  if (Platform.OS === 'ios') Haptics.selectionAsync();
                  setActivePeriod(tab);
                }}
                scaleDown={0.95}
                style={{ flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center', backgroundColor: activePeriod === tab ? segmentActiveBg : 'transparent', boxShadow: activePeriod === tab ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' as any }}
              >
                <Text style={{ fontSize: 13, fontWeight: '600', color: activePeriod === tab ? textPrimary : textMuted }}>{tab}</Text>
              </AnimatedPressable>
            ))}
          </Animated.View>

          {/* Steps Chart */}
          <Animated.View entering={cardEntering(3)} style={{ backgroundColor: CARD_LIGHT, borderRadius: 16, padding: 20, borderWidth: 1, borderColor, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' as any, borderCurve: 'continuous' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <View>
                <Text style={{ fontSize: 12, color: textMuted, fontWeight: '500' }}>Steps Today</Text>
                <Animated.Text entering={FadeInUp.delay(400).duration(350)} style={{ fontSize: 32, fontWeight: '800', color: textPrimary, fontVariant: ['tabular-nums'], letterSpacing: -1 }}>
                  {today.steps.toLocaleString()}
                </Animated.Text>
              </View>
            </View>
            <Animated.View entering={FadeIn.delay(500).duration(600)}>
              <View style={{ height: 100 }}>
                <Svg width="100%" height="100%" viewBox="0 0 400 100" preserveAspectRatio="none">
                  <Defs>
                    <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                      <Stop offset="0%" stopColor={PRIMARY} stopOpacity="0.25" />
                      <Stop offset="100%" stopColor={PRIMARY} stopOpacity="0" />
                    </LinearGradient>
                  </Defs>
                  {areaPath ? <Path d={areaPath} fill="url(#grad)" /> : null}
                  {linePath ? <Path d={linePath} fill="none" stroke={PRIMARY} strokeWidth="2.5" strokeLinecap="round" /> : null}
                  {dotPoint && <Circle cx={dotPoint.x} cy={dotPoint.y} r="5" fill={PRIMARY} />}
                  {dotPoint && <Circle cx={dotPoint.x} cy={dotPoint.y} r="3" fill="white" />}
                </Svg>
              </View>
            </Animated.View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d, i) => (
                <Animated.Text key={d} entering={FadeIn.delay(i * 50 + 600).duration(200)} style={{ fontSize: 10, fontWeight: '700', color: textMuted, textTransform: 'uppercase', letterSpacing: 0.5 }}>{d}</Animated.Text>
              ))}
            </View>
          </Animated.View>

          {/* Workout History */}
          <Animated.View entering={FadeInDown.delay(350).duration(400)}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Text style={{ fontSize: 18, fontWeight: '700', color: textPrimary }}>Workout History</Text>
            </View>

            {today.workouts.length === 0 ? (
              <Animated.View entering={FadeIn.delay(450).duration(400)} style={{ backgroundColor: CARD_LIGHT, borderRadius: 16, padding: 24, borderWidth: 1, borderColor, alignItems: 'center', borderCurve: 'continuous' }}>
                <Animated.View entering={ZoomIn.delay(600).duration(400).springify().damping(12)}>
                  <Dumbbell size={32} color={textMuted} />
                </Animated.View>
                <Text style={{ fontSize: 14, fontWeight: '600', color: textMuted, marginTop: 8 }}>No workouts yet today</Text>
                <Text style={{ fontSize: 12, color: textMuted, marginTop: 4 }}>Tap + to log your first workout</Text>
              </Animated.View>
            ) : (
              <View style={{ gap: 12 }}>
                {today.workouts.map((w, index) => {
                  const wt = getWorkoutIcon(w.type);
                  return (
                    <Animated.View key={w.id} entering={FadeInDown.delay(index * STAGGER_DELAY + 500).duration(400).springify().damping(18)}>
                      <AnimatedPressable
                        scaleDown={0.98}
                        style={{ flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16, backgroundColor: CARD_LIGHT, borderRadius: 16, borderWidth: 1, borderColor, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' as any, borderCurve: 'continuous' }}
                      >
                        <View style={{ width: 52, height: 52, borderRadius: 14, backgroundColor: wt.iconBg, alignItems: 'center', justifyContent: 'center', borderCurve: 'continuous' }}>
                          {wt.icon}
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontSize: 15, fontWeight: '700', color: textPrimary }}>{w.name}</Text>
                          <Text style={{ fontSize: 12, color: textMuted, marginTop: 2 }}>
                            {w.durationMin} min{w.distanceKm ? ` • ${w.distanceKm} km` : ''}
                          </Text>
                        </View>
                        <View style={{ alignItems: 'flex-end', gap: 6 }}>
                          <Animated.View entering={ZoomIn.delay(index * STAGGER_DELAY + 700).duration(300).springify()} style={{ backgroundColor: '#f0fdf4', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 99 }}>
                            <Text style={{ fontSize: 11, fontWeight: '700', color: '#16a34a' }}>{w.kcal} kcal</Text>
                          </Animated.View>
                          <Text style={{ fontSize: 10, color: textMuted }}>
                            {new Date(w.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </Text>
                        </View>
                      </AnimatedPressable>
                    </Animated.View>
                  );
                })}
              </View>
            )}
          </Animated.View>
        </View>
      </ScrollView>

      {/* Animated FAB */}
      <AnimatedFAB
        onPress={() => setShowAddModal(true)}
        style={{ position: 'absolute', bottom: 90, right: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: PRIMARY, alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(0,123,255,0.45)' as any }}
      >
        <View style={{ width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' }}>
          <Plus size={32} color="#fff" />
        </View>
      </AnimatedFAB>

      {/* Add Workout Modal */}
      <Modal visible={showAddModal} animationType="none" transparent>
        <Animated.View
          entering={FadeIn.duration(250)}
          exiting={FadeOut.duration(200)}
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'flex-end' }}
        >
          <Pressable style={{ flex: 1 }} onPress={() => setShowAddModal(false)} />
          <Animated.View
            entering={SlideInDown.duration(450).springify().damping(20).stiffness(90)}
            exiting={SlideOutDown.duration(300)}
            style={{ backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40, borderCurve: 'continuous' }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <Animated.Text entering={FadeInLeft.duration(350)} style={{ fontSize: 20, fontWeight: '800', color: textPrimary }}>Log Workout</Animated.Text>
              <AnimatedPressable onPress={() => setShowAddModal(false)} scaleDown={0.85}>
                <X size={24} color={textMuted} />
              </AnimatedPressable>
            </View>

            {/* Type selection */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, marginBottom: 16 }}>
              {WORKOUT_TYPES.map((wt, i) => (
                <Animated.View key={wt.type} entering={FadeInDown.delay(i * 50 + 100).duration(350).springify()}>
                  <AnimatedPressable
                    onPress={() => {
                      if (Platform.OS === 'ios') Haptics.selectionAsync();
                      setNewWorkoutType(wt.type);
                    }}
                    scaleDown={0.93}
                    style={{
                      padding: 12,
                      borderRadius: 14,
                      backgroundColor: newWorkoutType === wt.type ? `${PRIMARY}15` : '#f1f5f9',
                      borderWidth: 2,
                      borderColor: newWorkoutType === wt.type ? PRIMARY : 'transparent',
                      alignItems: 'center',
                      width: 80,
                      borderCurve: 'continuous',
                    }}
                  >
                    {wt.icon}
                    <Text style={{ fontSize: 10, fontWeight: '700', color: textPrimary, marginTop: 4 }}>{wt.name}</Text>
                  </AnimatedPressable>
                </Animated.View>
              ))}
            </ScrollView>

            <View style={{ gap: 12 }}>
              <Animated.View entering={FadeInDown.delay(200).duration(300)}>
                <TextInput
                  style={{ backgroundColor: '#f1f5f9', borderRadius: 12, padding: 14, fontSize: 15, color: textPrimary }}
                  placeholder="Workout name (optional)"
                  placeholderTextColor={textMuted}
                  value={newName}
                  onChangeText={setNewName}
                />
              </Animated.View>
              <Animated.View entering={FadeInDown.delay(260).duration(300)} style={{ flexDirection: 'row', gap: 12 }}>
                <TextInput
                  style={{ flex: 1, backgroundColor: '#f1f5f9', borderRadius: 12, padding: 14, fontSize: 15, color: textPrimary }}
                  placeholder="Duration (min)"
                  placeholderTextColor={textMuted}
                  keyboardType="numeric"
                  value={newDuration}
                  onChangeText={setNewDuration}
                />
                <TextInput
                  style={{ flex: 1, backgroundColor: '#f1f5f9', borderRadius: 12, padding: 14, fontSize: 15, color: textPrimary }}
                  placeholder="Distance (km)"
                  placeholderTextColor={textMuted}
                  keyboardType="numeric"
                  value={newDistance}
                  onChangeText={setNewDistance}
                />
              </Animated.View>
              <Animated.View entering={FadeInDown.delay(320).duration(300)}>
                <TextInput
                  style={{ backgroundColor: '#f1f5f9', borderRadius: 12, padding: 14, fontSize: 15, color: textPrimary }}
                  placeholder="Calories burned (auto-estimated if empty)"
                  placeholderTextColor={textMuted}
                  keyboardType="numeric"
                  value={newKcal}
                  onChangeText={setNewKcal}
                />
              </Animated.View>
            </View>

            <Animated.View entering={FadeInUp.delay(400).duration(350)}>
              <AnimatedPressable
                onPress={handleAddWorkout}
                scaleDown={0.97}
                style={{ marginTop: 20, backgroundColor: PRIMARY, paddingVertical: 16, borderRadius: 14, alignItems: 'center', boxShadow: '0 4px 14px rgba(0,123,255,0.35)' as any, borderCurve: 'continuous' }}
              >
                <Text style={{ fontSize: 16, fontWeight: '700', color: '#fff' }}>Save Workout</Text>
              </AnimatedPressable>
            </Animated.View>
          </Animated.View>
        </Animated.View>
      </Modal>
    </SafeAreaView>
  );
}
