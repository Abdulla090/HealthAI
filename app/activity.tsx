import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Svg, { Path, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { User, Bell, Footprints, Bike, Flame, ChevronRight, Plus, X, Dumbbell, Waves } from 'lucide-react-native';
import { HealthContext, WorkoutEntry } from '../store/health-store';

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
        {/* Header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingTop: 16, paddingBottom: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: `${PRIMARY}15`, alignItems: 'center', justifyContent: 'center' }}>
              <User size={20} color={PRIMARY} />
            </View>
            <Text style={{ fontSize: 22, fontWeight: '800', color: textPrimary, letterSpacing: -0.5 }}>Activity</Text>
          </View>
          <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: CARD_LIGHT, alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' as any }}>
            <Bell size={18} color={textPrimary} />
          </View>
        </View>

        <View style={{ paddingHorizontal: 20, gap: 20 }}>
          {/* Streak Banner */}
          <View style={{ backgroundColor: PRIMARY, borderRadius: 20, padding: 20, overflow: 'hidden', boxShadow: '0 6px 20px rgba(0,123,255,0.35)' as any }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View>
                <Text style={{ fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.8)' }}>Workout Streak</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
                  <Text style={{ fontSize: 26, fontWeight: '800', color: '#fff' }}>
                    {streakDays} Day{streakDays !== 1 ? 's' : ''}
                  </Text>
                  <Flame size={24} color="#fcd34d" fill="#fcd34d" />
                </View>
              </View>
              <View style={{ backgroundColor: 'rgba(255,255,255,0.25)', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 99 }}>
                <Text style={{ fontSize: 11, fontWeight: '700', color: '#fff' }}>
                  Level {Math.min(10, Math.floor(streakDays / 3) + 1)}
                </Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 4, height: 48, marginTop: 20 }}>
              {streakBarHeights.map((h, i) => (
                <View key={i} style={{ flex: 1, height: h * 48, backgroundColor: i === todayIdx ? '#ffffff' : 'rgba(255,255,255,0.3)', borderRadius: 3 }} />
              ))}
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
              {days.map((d, i) => (
                <Text key={i} style={{ flex: 1, textAlign: 'center', fontSize: 10, fontWeight: '700', color: i === todayIdx ? '#fff' : 'rgba(255,255,255,0.65)', textDecorationLine: i === todayIdx ? 'underline' : 'none' }}>
                  {d}
                </Text>
              ))}
            </View>
          </View>

          {/* Segmented Control */}
          <View style={{ backgroundColor: segmentBg, borderRadius: 10, padding: 4, flexDirection: 'row' }}>
            {(['Week', 'Month', 'Year'] as PeriodTab[]).map((tab) => (
              <TouchableOpacity key={tab} onPress={() => setActivePeriod(tab)} style={{ flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center', backgroundColor: activePeriod === tab ? segmentActiveBg : 'transparent', boxShadow: activePeriod === tab ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' as any }}>
                <Text style={{ fontSize: 13, fontWeight: '600', color: activePeriod === tab ? textPrimary : textMuted }}>{tab}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Steps Chart */}
          <View style={{ backgroundColor: CARD_LIGHT, borderRadius: 16, padding: 20, borderWidth: 1, borderColor, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' as any }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <View>
                <Text style={{ fontSize: 12, color: textMuted, fontWeight: '500' }}>Steps Today</Text>
                <Text style={{ fontSize: 32, fontWeight: '800', color: textPrimary, fontVariant: ['tabular-nums'], letterSpacing: -1 }}>
                  {today.steps.toLocaleString()}
                </Text>
              </View>
            </View>
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
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
                <Text key={d} style={{ fontSize: 10, fontWeight: '700', color: textMuted, textTransform: 'uppercase', letterSpacing: 0.5 }}>{d}</Text>
              ))}
            </View>
          </View>

          {/* Workout History */}
          <View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Text style={{ fontSize: 18, fontWeight: '700', color: textPrimary }}>Workout History</Text>
            </View>

            {today.workouts.length === 0 ? (
              <View style={{ backgroundColor: CARD_LIGHT, borderRadius: 16, padding: 24, borderWidth: 1, borderColor, alignItems: 'center' }}>
                <Dumbbell size={32} color={textMuted} />
                <Text style={{ fontSize: 14, fontWeight: '600', color: textMuted, marginTop: 8 }}>No workouts yet today</Text>
                <Text style={{ fontSize: 12, color: textMuted, marginTop: 4 }}>Tap + to log your first workout</Text>
              </View>
            ) : (
              <View style={{ gap: 12 }}>
                {today.workouts.map((w) => {
                  const wt = getWorkoutIcon(w.type);
                  return (
                    <View key={w.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16, backgroundColor: CARD_LIGHT, borderRadius: 16, borderWidth: 1, borderColor, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' as any }}>
                      <View style={{ width: 52, height: 52, borderRadius: 14, backgroundColor: wt.iconBg, alignItems: 'center', justifyContent: 'center' }}>
                        {wt.icon}
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 15, fontWeight: '700', color: textPrimary }}>{w.name}</Text>
                        <Text style={{ fontSize: 12, color: textMuted, marginTop: 2 }}>
                          {w.durationMin} min{w.distanceKm ? ` • ${w.distanceKm} km` : ''}
                        </Text>
                      </View>
                      <View style={{ alignItems: 'flex-end', gap: 6 }}>
                        <View style={{ backgroundColor: '#f0fdf4', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 99 }}>
                          <Text style={{ fontSize: 11, fontWeight: '700', color: '#16a34a' }}>{w.kcal} kcal</Text>
                        </View>
                        <Text style={{ fontSize: 10, color: textMuted }}>
                          {new Date(w.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        onPress={() => setShowAddModal(true)}
        style={{ position: 'absolute', bottom: 90, right: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: PRIMARY, alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(0,123,255,0.45)' as any }}
        activeOpacity={0.85}
      >
        <Plus size={32} color="#fff" />
      </TouchableOpacity>

      {/* Add Workout Modal */}
      <Modal visible={showAddModal} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <Text style={{ fontSize: 20, fontWeight: '800', color: textPrimary }}>Log Workout</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <X size={24} color={textMuted} />
              </TouchableOpacity>
            </View>

            {/* Type selection */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, marginBottom: 16 }}>
              {WORKOUT_TYPES.map((wt) => (
                <TouchableOpacity
                  key={wt.type}
                  onPress={() => setNewWorkoutType(wt.type)}
                  style={{
                    padding: 12,
                    borderRadius: 14,
                    backgroundColor: newWorkoutType === wt.type ? `${PRIMARY}15` : '#f1f5f9',
                    borderWidth: 2,
                    borderColor: newWorkoutType === wt.type ? PRIMARY : 'transparent',
                    alignItems: 'center',
                    width: 80,
                  }}
                >
                  {wt.icon}
                  <Text style={{ fontSize: 10, fontWeight: '700', color: textPrimary, marginTop: 4 }}>{wt.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={{ gap: 12 }}>
              <TextInput
                style={{ backgroundColor: '#f1f5f9', borderRadius: 12, padding: 14, fontSize: 15, color: textPrimary }}
                placeholder="Workout name (optional)"
                placeholderTextColor={textMuted}
                value={newName}
                onChangeText={setNewName}
              />
              <View style={{ flexDirection: 'row', gap: 12 }}>
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
              </View>
              <TextInput
                style={{ backgroundColor: '#f1f5f9', borderRadius: 12, padding: 14, fontSize: 15, color: textPrimary }}
                placeholder="Calories burned (auto-estimated if empty)"
                placeholderTextColor={textMuted}
                keyboardType="numeric"
                value={newKcal}
                onChangeText={setNewKcal}
              />
            </View>

            <TouchableOpacity
              onPress={handleAddWorkout}
              style={{ marginTop: 20, backgroundColor: PRIMARY, paddingVertical: 16, borderRadius: 14, alignItems: 'center', boxShadow: '0 4px 14px rgba(0,123,255,0.35)' as any }}
              activeOpacity={0.85}
            >
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#fff' }}>Save Workout</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
