import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
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

  const handleSaveGoals = async () => {
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
          onPress: () => setShowGoalsModal(true),
        },
        {
          icon: <Bell size={20} color="#f59e0b" />,
          iconBg: '#fffbeb',
          label: 'Notifications',
          onPress: () => {},
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
          onPress: () => {},
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
          onPress: () => {},
        },
        {
          icon: <Info size={20} color="#64748b" />,
          iconBg: '#f8fafc',
          label: 'About',
          onPress: () => {},
        },
      ],
    },
  ];

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
        <View style={{ alignItems: 'center', paddingTop: 16, paddingBottom: 8 }}>
          <Text style={{ fontSize: 17, fontWeight: '700', color: textPrimary }}>Profile</Text>
        </View>

        {/* Profile Card */}
        <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
          <View style={{ backgroundColor: CARD_LIGHT, borderRadius: 20, padding: 24, borderWidth: 1, borderColor, alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' as any }}>
            {/* Avatar */}
            <TouchableOpacity
              onPress={() => {
                setNewName(user?.name || '');
                setShowEditName(true);
              }}
              style={{ marginBottom: 12 }}
            >
              <Image 
                source={{ uri: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80' }}
                style={{ width: 72, height: 72, borderRadius: 36, borderWidth: 3, borderColor: PRIMARY }}
              />
            </TouchableOpacity>

            {/* Name + badge */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={{ fontSize: 20, fontWeight: '800', color: textPrimary }}>{user?.name || 'User'}</Text>
              <View style={{ backgroundColor: '#f97316', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 }}>
                <Text style={{ fontSize: 9, fontWeight: '800', color: '#fff', letterSpacing: 0.5 }}>PRO</Text>
              </View>
            </View>

            {/* Stats row */}
            <View style={{ flexDirection: 'row', gap: 32, marginTop: 16 }}>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 20, fontWeight: '800', color: textPrimary }}>{streakDays}</Text>
                <Text style={{ fontSize: 11, fontWeight: '600', color: textMuted, marginTop: 2 }}>STREAK</Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 20, fontWeight: '800', color: textPrimary }}>{goalsCompleted}</Text>
                <Text style={{ fontSize: 11, fontWeight: '600', color: textMuted, marginTop: 2 }}>GOALS</Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 20, fontWeight: '800', color: textPrimary }}>{totalWorkouts}</Text>
                <Text style={{ fontSize: 11, fontWeight: '600', color: textMuted, marginTop: 2 }}>WORKOUTS</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Settings sections */}
        {settingsSections.map((section) => (
          <View key={section.title} style={{ paddingHorizontal: 20, marginBottom: 24 }}>
            <Text style={{ fontSize: 11, fontWeight: '700', color: textMuted, letterSpacing: 1.5, marginBottom: 8, paddingHorizontal: 4 }}>
              {section.title}
            </Text>
            <View style={{ backgroundColor: CARD_LIGHT, borderRadius: 16, borderWidth: 1, borderColor, overflow: 'hidden' }}>
              {section.items.map((item, i) => (
                <TouchableOpacity
                  key={item.label}
                  onPress={item.onPress}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 14,
                    padding: 16,
                    borderBottomWidth: i < section.items.length - 1 ? 1 : 0,
                    borderBottomColor: borderColor,
                  }}
                  activeOpacity={0.65}
                >
                  <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: item.iconBg, alignItems: 'center', justifyContent: 'center' }}>
                    {item.icon}
                  </View>
                  <Text style={{ flex: 1, fontSize: 15, fontWeight: '600', color: textPrimary }}>{item.label}</Text>
                  {'trailing' in item && item.trailing ? item.trailing : null}
                  <ChevronRight size={18} color="#cbd5e1" />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Sign Out */}
        <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
          <TouchableOpacity
            onPress={logout}
            style={{
              backgroundColor: CARD_LIGHT,
              borderRadius: 16,
              padding: 16,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: '#fecaca',
            }}
            activeOpacity={0.65}
          >
            <Text style={{ fontSize: 16, fontWeight: '700', color: '#ef4444' }}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        {/* Version */}
        <Text style={{ textAlign: 'center', fontSize: 12, color: textMuted, marginTop: 4 }}>
          Version 1.0.0 (1)
        </Text>
      </ScrollView>

      {/* Goals Modal */}
      <Modal visible={showGoalsModal} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <Text style={{ fontSize: 20, fontWeight: '800', color: textPrimary }}>Edit Goals</Text>
              <TouchableOpacity onPress={() => setShowGoalsModal(false)}>
                <X size={24} color={textMuted} />
              </TouchableOpacity>
            </View>

            <View style={{ gap: 12 }}>
              <View>
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
              </View>
              <View>
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
              </View>
              <View>
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
              </View>
              <View>
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
              </View>
            </View>

            <TouchableOpacity
              onPress={handleSaveGoals}
              style={{ marginTop: 20, backgroundColor: PRIMARY, paddingVertical: 16, borderRadius: 14, alignItems: 'center', boxShadow: '0 4px 14px rgba(0,123,255,0.35)' as any }}
              activeOpacity={0.85}
            >
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#fff' }}>Save Goals</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Edit Name Modal */}
      <Modal visible={showEditName} animationType="fade" transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', paddingHorizontal: 32 }}>
          <View style={{ backgroundColor: '#fff', borderRadius: 20, padding: 24 }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: textPrimary, marginBottom: 16 }}>Edit Name</Text>
            <TextInput
              style={{ backgroundColor: '#f1f5f9', borderRadius: 12, padding: 14, fontSize: 15, color: textPrimary }}
              value={newName}
              onChangeText={setNewName}
              placeholder="Your name"
              placeholderTextColor={textMuted}
              autoFocus
            />
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
              <TouchableOpacity
                onPress={() => setShowEditName(false)}
                style={{ flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center', backgroundColor: '#f1f5f9' }}
              >
                <Text style={{ fontSize: 14, fontWeight: '600', color: textMuted }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSaveName}
                style={{ flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center', backgroundColor: PRIMARY }}
              >
                <Text style={{ fontSize: 14, fontWeight: '700', color: '#fff' }}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
