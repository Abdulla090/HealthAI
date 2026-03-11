import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Modal,
  Image,
  Platform,
  Pressable,
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
  SlideInDown,
  SlideOutDown,
  ZoomIn,
  LinearTransition,
} from 'react-native-reanimated';
import {
  User,
  Target,
  Bell,
  Link2,
  Shield,
  Info,
  LogOut,
  ChevronRight,
  X,
  Flame,
  Footprints,
  Droplet,
} from 'lucide-react-native';
import { HealthContext } from '../store/health-store';
import {
  AnimatedPressable,
  cardEntering,
  STAGGER_DELAY,
} from '../components/animated-utils';
import * as Haptics from 'expo-haptics';

const PRIMARY = '#007bff';
const LIGHT_BG = '#f8fafc';
const CARD_LIGHT = '#ffffff';

export default function ProfileScreen() {
  const {
    user,
    goals,
    today,
    streakDays,
    weeklyWorkoutCounts,
    logout,
    updateProfile,
    updateGoals,
  } = React.use(HealthContext);

  const [showGoalsModal, setShowGoalsModal] = useState(false);
  const [showEditName, setShowEditName] = useState(false);
  const [newName, setNewName] = useState(user?.name || '');
  const [goalSteps, setGoalSteps] = useState(goals.dailySteps.toString());
  const [goalWater, setGoalWater] = useState((goals.dailyWaterMl / 1000).toString());
  const [goalCal, setGoalCal] = useState(goals.dailyCalories.toString());
  const [goalCarbs, setGoalCarbs] = useState(goals.dailyCarbsG.toString());
  const [goalProtein, setGoalProtein] = useState(goals.dailyProteinG.toString());
  const [goalFat, setGoalFat] = useState(goals.dailyFatG.toString());

  const textPrimary = '#0f172a';
  const textMuted = '#94a3b8';
  const borderColor = '#f1f5f9';

  const totalWorkouts = weeklyWorkoutCounts.reduce((s, c) => s + c, 0);
  const goalsCompleted = [
    today.steps >= goals.dailySteps,
    today.water.reduce((s, w) => s + w.ml, 0) >= goals.dailyWaterMl,
    today.caloriesConsumed > 0 && today.caloriesConsumed <= goals.dailyCalories + 200,
  ].filter(Boolean).length;

  const triggerHaptic = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleSaveGoals = async () => {
    if (Platform.OS === 'ios') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    await updateGoals({
      dailySteps: parseInt(goalSteps) || 10000,
      dailyWaterMl: Math.round(parseFloat(goalWater) * 1000) || 2500,
      dailyCalories: parseInt(goalCal) || 2200,
      dailyCarbsG: parseInt(goalCarbs) || 250,
      dailyProteinG: parseInt(goalProtein) || 120,
      dailyFatG: parseInt(goalFat) || 70,
    });
    setShowGoalsModal(false);
  };

  const handleSaveName = async () => {
    if (newName.trim()) {
      triggerHaptic();
      await updateProfile(newName.trim());
      setShowEditName(false);
    }
  };

  const settingsSections = [
    {
      title: 'ACCOUNT SETTINGS',
      items: [
        {
          icon: <Target size={20} color="#10b981" />,
          iconBg: '#f0fdf4',
          label: 'Goals',
          onPress: () => {
            triggerHaptic();
            setShowGoalsModal(true);
          },
        },
        {
          icon: <Bell size={20} color="#f59e0b" />,
          iconBg: '#fffbeb',
          label: 'Notifications',
          onPress: () => { triggerHaptic(); },
        },
      ],
    },
    {
      title: 'CONNECTIONS',
      items: [
        {
          icon: <Link2 size={20} color="#6366f1" />,
          iconBg: '#eef2ff',
          label: 'Integrations',
          trailing: <Text style={{ fontSize: 13, color: textMuted }}>None</Text>,
          onPress: () => { triggerHaptic(); },
        },
      ],
    },
    {
      title: 'SECURITY & INFO',
      items: [
        {
          icon: <Shield size={20} color="#64748b" />,
          iconBg: '#f8fafc',
          label: 'Data & Privacy',
          onPress: () => { triggerHaptic(); },
        },
        {
          icon: <Info size={20} color="#64748b" />,
          iconBg: '#f8fafc',
          label: 'About',
          onPress: () => { triggerHaptic(); },
        },
      ],
    },
  ];

  let globalItemIdx = 0;

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
        <Animated.View entering={FadeIn.delay(100).duration(350)} style={{ alignItems: 'center', paddingTop: 16, paddingBottom: 8 }}>
          <Text style={{ fontSize: 17, fontWeight: '700', color: textPrimary }}>Profile</Text>
        </Animated.View>

        {/* Profile Card */}
        <Animated.View entering={cardEntering(0)} style={{ paddingHorizontal: 20, marginBottom: 24 }}>
          <View style={{ backgroundColor: CARD_LIGHT, borderRadius: 20, padding: 24, borderWidth: 1, borderColor, alignItems: 'center', ...(Platform.OS === 'web' ? { boxShadow: '0 2px 8px rgba(0,0,0,0.06)' } : { elevation: 2 }), borderCurve: 'continuous' as any }}>
            {/* Avatar */}
            <Animated.View entering={ZoomIn.delay(200).duration(450).springify().damping(12)}>
              <AnimatedPressable
                onPress={() => {
                  triggerHaptic();
                  setNewName(user?.name || '');
                  setShowEditName(true);
                }}
                scaleDown={0.93}
                style={{ marginBottom: 12 }}
              >
                <Image 
                  source={{ uri: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80' }}
                  style={{ width: 72, height: 72, borderRadius: 36, borderWidth: 3, borderColor: PRIMARY }}
                />
              </AnimatedPressable>
            </Animated.View>

            {/* Name + badge */}
            <Animated.View entering={FadeInDown.delay(300).duration(400)} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={{ fontSize: 20, fontWeight: '800', color: textPrimary }}>{user?.name || 'User'}</Text>
              <Animated.View entering={ZoomIn.delay(500).duration(300).springify().damping(10)} style={{ backgroundColor: '#f97316', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 }}>
                <Text style={{ fontSize: 9, fontWeight: '800', color: '#fff', letterSpacing: 0.5 }}>PRO</Text>
              </Animated.View>
            </Animated.View>

            {/* Stats row */}
            <View style={{ flexDirection: 'row', gap: 32, marginTop: 16 }}>
              {[
                { value: streakDays, label: 'STREAK' },
                { value: goalsCompleted, label: 'GOALS' },
                { value: totalWorkouts, label: 'WORKOUTS' },
              ].map((stat, i) => (
                <Animated.View key={stat.label} entering={FadeInUp.delay(i * 80 + 400).duration(350).springify()} style={{ alignItems: 'center' }}>
                  <Text style={{ fontSize: 20, fontWeight: '800', color: textPrimary, fontVariant: ['tabular-nums'] }}>{stat.value}</Text>
                  <Text style={{ fontSize: 11, fontWeight: '600', color: textMuted, marginTop: 2 }}>{stat.label}</Text>
                </Animated.View>
              ))}
            </View>
          </View>
        </Animated.View>

        {/* Settings sections */}
        {settingsSections.map((section, sectionIdx) => {
          const sectionDelay = sectionIdx * 120 + 200;
          return (
            <Animated.View key={section.title} entering={FadeInDown.delay(sectionDelay).duration(400).springify().damping(18)} style={{ paddingHorizontal: 20, marginBottom: 24 }}>
              <Animated.Text entering={FadeIn.delay(sectionDelay + 100).duration(300)} style={{ fontSize: 11, fontWeight: '700', color: textMuted, letterSpacing: 1.5, marginBottom: 8, paddingHorizontal: 4 }}>
                {section.title}
              </Animated.Text>
              <View style={{ backgroundColor: CARD_LIGHT, borderRadius: 16, borderWidth: 1, borderColor, overflow: 'hidden', borderCurve: 'continuous' as any }}>
                {section.items.map((item, i) => {
                  globalItemIdx++;
                  const itemIdx = globalItemIdx;
                  return (
                    <Animated.View
                      key={item.label}
                      entering={FadeInRight.delay(itemIdx * 60 + sectionDelay).duration(350)}
                    >
                      <AnimatedPressable
                        onPress={item.onPress}
                        scaleDown={0.98}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 14,
                          padding: 16,
                          borderBottomWidth: i < section.items.length - 1 ? 1 : 0,
                          borderBottomColor: borderColor,
                        }}
                      >
                        <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: item.iconBg, alignItems: 'center', justifyContent: 'center', borderCurve: 'continuous' }}>
                          {item.icon}
                        </View>
                        <Text style={{ flex: 1, fontSize: 15, fontWeight: '600', color: textPrimary }}>{item.label}</Text>
                        {'trailing' in item && item.trailing ? item.trailing : null}
                        <ChevronRight size={18} color="#cbd5e1" />
                      </AnimatedPressable>
                    </Animated.View>
                  );
                })}
              </View>
            </Animated.View>
          );
        })}

        {/* Sign Out */}
        <Animated.View entering={FadeInUp.delay(800).duration(400)} style={{ paddingHorizontal: 20, marginBottom: 16 }}>
          <AnimatedPressable
            onPress={() => {
              if (Platform.OS === 'ios') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
              logout();
            }}
            scaleDown={0.97}
            style={{
              backgroundColor: CARD_LIGHT,
              borderRadius: 16,
              padding: 16,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: '#fecaca',
              borderCurve: 'continuous',
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: '700', color: '#ef4444' }}>Sign Out</Text>
          </AnimatedPressable>
        </Animated.View>

        {/* Version */}
        <Animated.Text entering={FadeIn.delay(900).duration(300)} style={{ textAlign: 'center', fontSize: 12, color: textMuted, marginTop: 4 }}>
          Version 1.0.0 (1)
        </Animated.Text>
      </ScrollView>

      {/* Goals Modal */}
      <Modal visible={showGoalsModal} animationType="none" transparent>
        <Animated.View
          entering={FadeIn.duration(250)}
          exiting={FadeOut.duration(200)}
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'flex-end' }}
        >
          <Pressable style={{ flex: 1 }} onPress={() => setShowGoalsModal(false)} />
          <Animated.View
            entering={SlideInDown.duration(500).springify().damping(20).stiffness(90)}
            exiting={SlideOutDown.duration(300)}
            style={{ backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40, borderCurve: 'continuous' }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <Animated.Text entering={FadeInLeft.duration(350)} style={{ fontSize: 20, fontWeight: '800', color: textPrimary }}>Edit Goals</Animated.Text>
              <AnimatedPressable onPress={() => setShowGoalsModal(false)} scaleDown={0.85}>
                <X size={24} color={textMuted} />
              </AnimatedPressable>
            </View>

            <View style={{ gap: 12 }}>
              <Animated.View entering={FadeInDown.delay(100).duration(300)}>
                <Text style={{ fontSize: 12, fontWeight: '600', color: textMuted, marginBottom: 4 }}>Daily Steps</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#f1f5f9', borderRadius: 12, paddingHorizontal: 14 }}>
                  <Footprints size={16} color={PRIMARY} />
                  <TextInput
                    style={{ flex: 1, padding: 14, fontSize: 15, color: textPrimary }}
                    keyboardType="numeric"
                    value={goalSteps}
                    onChangeText={setGoalSteps}
                  />
                  <Text style={{ fontSize: 13, color: textMuted }}>steps</Text>
                </View>
              </Animated.View>
              <Animated.View entering={FadeInDown.delay(160).duration(300)}>
                <Text style={{ fontSize: 12, fontWeight: '600', color: textMuted, marginBottom: 4 }}>Daily Water</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#f1f5f9', borderRadius: 12, paddingHorizontal: 14 }}>
                  <Droplet size={16} color="#06b6d4" />
                  <TextInput
                    style={{ flex: 1, padding: 14, fontSize: 15, color: textPrimary }}
                    keyboardType="numeric"
                    value={goalWater}
                    onChangeText={setGoalWater}
                  />
                  <Text style={{ fontSize: 13, color: textMuted }}>liters</Text>
                </View>
              </Animated.View>
              <Animated.View entering={FadeInDown.delay(220).duration(300)}>
                <Text style={{ fontSize: 12, fontWeight: '600', color: textMuted, marginBottom: 4 }}>Daily Calories</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#f1f5f9', borderRadius: 12, paddingHorizontal: 14 }}>
                  <Flame size={16} color="#f59e0b" />
                  <TextInput
                    style={{ flex: 1, padding: 14, fontSize: 15, color: textPrimary }}
                    keyboardType="numeric"
                    value={goalCal}
                    onChangeText={setGoalCal}
                  />
                  <Text style={{ fontSize: 13, color: textMuted }}>kcal</Text>
                </View>
              </Animated.View>
              <Animated.View entering={FadeInDown.delay(280).duration(300)}>
                <Text style={{ fontSize: 12, fontWeight: '600', color: textMuted, marginBottom: 4 }}>Macros (g)</Text>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <View style={{ flex: 1 }}>
                    <TextInput
                      style={{ backgroundColor: '#f1f5f9', borderRadius: 12, padding: 14, fontSize: 15, color: textPrimary, textAlign: 'center' }}
                      placeholder="Carbs"
                      placeholderTextColor={textMuted}
                      keyboardType="numeric"
                      value={goalCarbs}
                      onChangeText={setGoalCarbs}
                    />
                    <Text style={{ fontSize: 10, textAlign: 'center', color: textMuted, marginTop: 4 }}>Carbs</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <TextInput
                      style={{ backgroundColor: '#f1f5f9', borderRadius: 12, padding: 14, fontSize: 15, color: textPrimary, textAlign: 'center' }}
                      placeholder="Protein"
                      placeholderTextColor={textMuted}
                      keyboardType="numeric"
                      value={goalProtein}
                      onChangeText={setGoalProtein}
                    />
                    <Text style={{ fontSize: 10, textAlign: 'center', color: textMuted, marginTop: 4 }}>Protein</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <TextInput
                      style={{ backgroundColor: '#f1f5f9', borderRadius: 12, padding: 14, fontSize: 15, color: textPrimary, textAlign: 'center' }}
                      placeholder="Fat"
                      placeholderTextColor={textMuted}
                      keyboardType="numeric"
                      value={goalFat}
                      onChangeText={setGoalFat}
                    />
                    <Text style={{ fontSize: 10, textAlign: 'center', color: textMuted, marginTop: 4 }}>Fat</Text>
                  </View>
                </View>
              </Animated.View>
            </View>

            <Animated.View entering={FadeInUp.delay(350).duration(350)}>
              <AnimatedPressable
                onPress={handleSaveGoals}
                scaleDown={0.97}
                style={{ marginTop: 20, backgroundColor: PRIMARY, paddingVertical: 16, borderRadius: 14, alignItems: 'center', boxShadow: '0 4px 14px rgba(0,123,255,0.35)' as any, borderCurve: 'continuous' }}
              >
                <Text style={{ fontSize: 16, fontWeight: '700', color: '#fff' }}>Save Goals</Text>
              </AnimatedPressable>
            </Animated.View>
          </Animated.View>
        </Animated.View>
      </Modal>

      {/* Edit Name Modal */}
      <Modal visible={showEditName} animationType="none" transparent>
        <Animated.View
          entering={FadeIn.duration(250)}
          exiting={FadeOut.duration(200)}
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', paddingHorizontal: 32 }}
        >
          <Animated.View
            entering={ZoomIn.duration(400).springify().damping(16).stiffness(120)}
            style={{ backgroundColor: '#fff', borderRadius: 20, padding: 24, borderCurve: 'continuous' }}
          >
            <Animated.Text entering={FadeInDown.delay(100).duration(300)} style={{ fontSize: 18, fontWeight: '700', color: textPrimary, marginBottom: 16 }}>
              Edit Name
            </Animated.Text>
            <Animated.View entering={FadeInDown.delay(150).duration(300)}>
              <TextInput
                style={{ backgroundColor: '#f1f5f9', borderRadius: 12, padding: 14, fontSize: 15, color: textPrimary }}
                value={newName}
                onChangeText={setNewName}
                placeholder="Your name"
                placeholderTextColor={textMuted}
                autoFocus
              />
            </Animated.View>
            <Animated.View entering={FadeInUp.delay(200).duration(300)} style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
              <AnimatedPressable
                onPress={() => setShowEditName(false)}
                scaleDown={0.95}
                style={{ flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center', backgroundColor: '#f1f5f9', borderCurve: 'continuous' }}
              >
                <Text style={{ fontSize: 14, fontWeight: '600', color: textMuted }}>Cancel</Text>
              </AnimatedPressable>
              <AnimatedPressable
                onPress={handleSaveName}
                scaleDown={0.95}
                style={{ flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center', backgroundColor: PRIMARY, borderCurve: 'continuous' }}
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
