import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
  Image,
  Platform,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Svg, { Circle } from 'react-native-svg';
import * as ImagePicker from 'expo-image-picker';
import Animated, {
  FadeInDown,
  FadeInUp,
  FadeIn,
  FadeOut,
  FadeInLeft,
  FadeInRight,
  FadeOutDown,
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
  withRepeat,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import {
  Utensils,
  Plus,
  X,
  Coffee,
  Sun,
  Moon,
  Cookie,
  ChevronRight,
  Trash2,
  Camera,
  ImageIcon,
  Sparkles,
  Star,
  Lightbulb,
} from 'lucide-react-native';
import { HealthContext, MealEntry } from '../store/health-store';
import { analyzeFood, FoodAnalysis } from '../services/gemini-vision';
import {
  AnimatedPressable,
  AnimatedProgressBar,
  cardEntering,
  STAGGER_DELAY,
} from '../components/animated-utils';
import * as Haptics from 'expo-haptics';

const PRIMARY = '#f59e0b';
const LIGHT_BG = '#f8fafc';
const CARD_LIGHT = '#ffffff';

const MEAL_TYPES = [
  { type: 'breakfast', label: 'Breakfast', icon: <Coffee size={20} color="#f59e0b" />, iconBg: '#fffbeb' },
  { type: 'lunch', label: 'Lunch', icon: <Sun size={20} color="#f97316" />, iconBg: '#fff7ed' },
  { type: 'dinner', label: 'Dinner', icon: <Moon size={20} color="#8b5cf6" />, iconBg: '#faf5ff' },
  { type: 'snack', label: 'Snack', icon: <Cookie size={20} color="#10b981" />, iconBg: '#f0fdf4' },
] as const;

// Pulsing scan indicator
function ScanPulse() {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.6);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.3, { duration: 700, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 700, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 700 }),
        withTiming(0.4, { duration: 700 })
      ),
      -1,
      true
    );
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[{ width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(139,92,246,0.15)', alignItems: 'center', justifyContent: 'center' }, pulseStyle]}>
      <ActivityIndicator size="large" color="#8b5cf6" />
    </Animated.View>
  );
}

export default function NutritionScreen() {
  const { today, goals, addMeal, deleteMeal } = React.use(HealthContext);

  // Manual modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [mealType, setMealType] = useState<MealEntry['type']>('breakfast');
  const [mealName, setMealName] = useState('');
  const [mealKcal, setMealKcal] = useState('');
  const [mealCarbs, setMealCarbs] = useState('');
  const [mealProtein, setMealProtein] = useState('');
  const [mealFat, setMealFat] = useState('');

  // AI scan
  const [showScanModal, setShowScanModal] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState('');
  const [scanResult, setScanResult] = useState<FoodAnalysis | null>(null);
  const [previewUri, setPreviewUri] = useState<string | null>(null);

  const textPrimary = '#0f172a';
  const textMuted = '#94a3b8';
  const borderColor = '#f1f5f9';

  const totalKcal = today.meals.reduce((s, m) => s + m.kcal, 0);
  const totalCarbs = today.meals.reduce((s, m) => s + m.carbsG, 0);
  const totalProtein = today.meals.reduce((s, m) => s + m.proteinG, 0);
  const totalFat = today.meals.reduce((s, m) => s + m.fatG, 0);
  const calPct = Math.min(100, Math.round((totalKcal / goals.dailyCalories) * 100));

  const mealsByType = MEAL_TYPES.map((mt) => ({
    ...mt,
    entries: today.meals.filter((m) => m.type === mt.type),
  }));

  const circumference = 2 * Math.PI * 45;
  const calDashOffset = circumference * (1 - Math.min(1, totalKcal / goals.dailyCalories));

  const triggerHaptic = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  // Pick image from library
  const pickFromLibrary = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      setScanError('Permission to access gallery is required.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
      base64: true,
      allowsEditing: true,
      aspect: [4, 3],
    });
    if (!result.canceled && result.assets[0]?.base64) {
      processImage(result.assets[0].base64, result.assets[0].uri);
    }
  };

  // Take photo
  const takePhoto = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      setScanError('Permission to use camera is required.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.7,
      base64: true,
      allowsEditing: true,
      aspect: [4, 3],
    });
    if (!result.canceled && result.assets[0]?.base64) {
      processImage(result.assets[0].base64, result.assets[0].uri);
    }
  };

  const processImage = async (base64: string, uri: string) => {
    setPreviewUri(uri);
    setScanning(true);
    setScanError('');
    setScanResult(null);
    try {
      const analysis = await analyzeFood(base64, 'image/jpeg');
      setScanResult(analysis);
      if (Platform.OS === 'ios') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (e: any) {
      setScanError(e.message || 'Failed to analyze. Try again.');
      if (Platform.OS === 'ios') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } finally {
      setScanning(false);
    }
  };

  const handleAddScanResult = async () => {
    if (!scanResult) return;
    const hour = new Date().getHours();
    let type: MealEntry['type'] = 'snack';
    if (hour < 11) type = 'breakfast';
    else if (hour < 15) type = 'lunch';
    else if (hour < 20) type = 'dinner';

    triggerHaptic();
    await addMeal({
      type,
      name: scanResult.name,
      kcal: scanResult.totalCalories,
      carbsG: scanResult.carbsG,
      proteinG: scanResult.proteinG,
      fatG: scanResult.fatG,
    });
    setShowScanModal(false);
    setScanResult(null);
    setPreviewUri(null);
  };

  const handleAddMeal = async () => {
    const kcal = parseInt(mealKcal) || 0;
    if (kcal <= 0) return;
    triggerHaptic();
    await addMeal({
      type: mealType,
      name: mealName.trim() || 'Meal',
      kcal,
      carbsG: parseInt(mealCarbs) || 0,
      proteinG: parseInt(mealProtein) || 0,
      fatG: parseInt(mealFat) || 0,
    });
    setShowAddModal(false);
    setMealName('');
    setMealKcal('');
    setMealCarbs('');
    setMealProtein('');
    setMealFat('');
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
        <Animated.View
          entering={FadeInLeft.duration(450).springify().damping(18)}
          style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingTop: 16, paddingBottom: 8 }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#fffbeb', alignItems: 'center', justifyContent: 'center' }}>
              <Utensils size={20} color="#f59e0b" />
            </View>
            <Text style={{ fontSize: 22, fontWeight: '800', color: textPrimary, letterSpacing: -0.5 }}>Nutrition</Text>
          </View>
        </Animated.View>

        <View style={{ paddingHorizontal: 20, gap: 16 }}>

          {/* AI Scan Banner */}
          <Animated.View entering={FadeInDown.delay(100).duration(450).springify().damping(16)}>
            <AnimatedPressable
              onPress={() => {
                triggerHaptic();
                setScanResult(null);
                setPreviewUri(null);
                setScanError('');
                setShowScanModal(true);
              }}
              scaleDown={0.97}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 14,
                padding: 18,
                backgroundColor: '#f97316',
                borderRadius: 20,
                boxShadow: '0 6px 20px rgba(249,115,22,0.35)' as any,
                borderCurve: 'continuous',
              }}
            >
              <Animated.View entering={ZoomIn.delay(300).duration(350).springify().damping(10)} style={{ width: 48, height: 48, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', borderCurve: 'continuous' }}>
                <Sparkles size={24} color="#fff" />
              </Animated.View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: '800', color: '#fff' }}>AI Food Scanner</Text>
                <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', marginTop: 2 }}>
                  Snap a photo to instantly analyze nutrition
                </Text>
              </View>
              <Camera size={22} color="rgba(255,255,255,0.8)" />
            </AnimatedPressable>
          </Animated.View>

          {/* Calorie Summary Card */}
          <Animated.View entering={cardEntering(1)} style={{ backgroundColor: CARD_LIGHT, borderRadius: 20, padding: 24, borderWidth: 1, borderColor, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' as any, borderCurve: 'continuous' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 20 }}>
              <Animated.View entering={ZoomIn.delay(300).duration(400).springify().damping(12)} style={{ alignItems: 'center', justifyContent: 'center' }}>
                <Svg width={100} height={100} viewBox="0 0 100 100">
                  <Circle cx={50} cy={50} r={45} fill="transparent" stroke="#f1f5f9" strokeWidth={8} />
                  <Circle cx={50} cy={50} r={45} fill="transparent" stroke="#f59e0b" strokeWidth={8} strokeDasharray={`${circumference}`} strokeDashoffset={calDashOffset} strokeLinecap="round" transform="rotate(-90, 50, 50)" />
                </Svg>
                <View style={{ position: 'absolute', alignItems: 'center' }}>
                  <Text style={{ fontSize: 10, fontWeight: '600', color: textMuted, textTransform: 'uppercase', letterSpacing: 0.5 }}>Calories</Text>
                </View>
              </Animated.View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
                  <Animated.Text entering={FadeInRight.delay(400).duration(350)} style={{ fontSize: 32, fontWeight: '800', color: textPrimary, fontVariant: ['tabular-nums'] }}>{totalKcal.toLocaleString()}</Animated.Text>
                  <Text style={{ fontSize: 14, color: textMuted }}>/ {goals.dailyCalories.toLocaleString()} kcal</Text>
                </View>
                <Animated.Text entering={FadeIn.delay(500).duration(300)} style={{ fontSize: 13, fontWeight: '600', color: '#f59e0b', marginTop: 2 }}>{calPct}% of daily goal</Animated.Text>
                <View style={{ marginTop: 12 }}>
                  <AnimatedProgressBar progress={Math.min(100, (totalCarbs / goals.dailyCarbsG) * 100)} color="#3b82f6" delay={600} />
                </View>
              </View>
            </View>
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
              {[
                { label: 'Carbs', value: totalCarbs, goal: goals.dailyCarbsG, color: '#3b82f6' },
                { label: 'Protein', value: totalProtein, goal: goals.dailyProteinG, color: '#10b981' },
                { label: 'Fat', value: totalFat, goal: goals.dailyFatG, color: '#f59e0b' },
              ].map((macro, i) => (
                <Animated.View key={macro.label} entering={FadeInUp.delay(i * 80 + 600).duration(350)} style={{ flex: 1, alignItems: 'center' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                    <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: macro.color }} />
                    <Text style={{ fontSize: 11, fontWeight: '600', color: textMuted }}>{macro.label}</Text>
                  </View>
                  <Text style={{ fontSize: 15, fontWeight: '700', color: textPrimary }}>
                    {macro.value}g
                    <Text style={{ fontSize: 11, color: textMuted }}> /{macro.goal}g</Text>
                  </Text>
                </Animated.View>
              ))}
            </View>
          </Animated.View>

          {/* Meals Header */}
          <Animated.View entering={FadeIn.delay(400).duration(350)} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: textPrimary }}>Meals Today</Text>
            <AnimatedPressable
              onPress={() => {
                triggerHaptic();
                setShowAddModal(true);
              }}
              scaleDown={0.93}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#fffbeb', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 99 }}
            >
              <Plus size={14} color="#f59e0b" />
              <Text style={{ fontSize: 12, fontWeight: '700', color: '#f59e0b' }}>Add Meal</Text>
            </AnimatedPressable>
          </Animated.View>

          {/* Meal slots */}
          <View style={{ gap: 12 }}>
            {mealsByType.map((slot, slotIdx) => (
              <Animated.View key={slot.type} entering={cardEntering(slotIdx + 3)} layout={LinearTransition.springify().damping(18)}>
                {slot.entries.length > 0 ? (
                  slot.entries.map((meal, mealIdx) => (
                    <Animated.View key={meal.id} entering={FadeInDown.delay(mealIdx * 60).duration(350).springify()} layout={LinearTransition.springify().damping(18)}>
                      <AnimatedPressable
                        scaleDown={0.98}
                        style={{ flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16, backgroundColor: CARD_LIGHT, borderRadius: 16, borderWidth: 1, borderColor, marginBottom: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' as any, borderCurve: 'continuous' }}
                      >
                        <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: slot.iconBg, alignItems: 'center', justifyContent: 'center', borderCurve: 'continuous' }}>{slot.icon}</View>
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontSize: 11, fontWeight: '700', color: textMuted, textTransform: 'uppercase', letterSpacing: 0.5 }}>{slot.label}</Text>
                          <Text style={{ fontSize: 14, fontWeight: '600', color: textPrimary, marginTop: 2 }}>{meal.name}</Text>
                          {(meal.carbsG > 0 || meal.proteinG > 0 || meal.fatG > 0) && (
                            <Text style={{ fontSize: 11, color: textMuted, marginTop: 2 }}>C: {meal.carbsG}g • P: {meal.proteinG}g • F: {meal.fatG}g</Text>
                          )}
                        </View>
                        <View style={{ alignItems: 'flex-end', gap: 6 }}>
                          <Text style={{ fontSize: 16, fontWeight: '700', color: textPrimary }}>{meal.kcal}</Text>
                          <Text style={{ fontSize: 10, fontWeight: '600', color: textMuted }}>KCAL</Text>
                        </View>
                        <AnimatedPressable
                          onPress={() => {
                            if (Platform.OS === 'ios') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                            deleteMeal(meal.id);
                          }}
                          scaleDown={0.8}
                          style={{ marginLeft: 4 }}
                        >
                          <Trash2 size={16} color="#ef4444" />
                        </AnimatedPressable>
                      </AnimatedPressable>
                    </Animated.View>
                  ))
                ) : (
                  <AnimatedPressable
                    onPress={() => {
                      triggerHaptic();
                      setMealType(slot.type as MealEntry['type']);
                      setShowAddModal(true);
                    }}
                    scaleDown={0.98}
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16, backgroundColor: CARD_LIGHT, borderRadius: 16, borderWidth: 1, borderColor, borderStyle: 'dashed', borderCurve: 'continuous' }}
                  >
                    <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: '#f8fafc', alignItems: 'center', justifyContent: 'center', borderCurve: 'continuous' }}>
                      <Plus size={20} color={textMuted} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 14, fontWeight: '600', color: textPrimary }}>{slot.label}</Text>
                      <Text style={{ fontSize: 12, color: textMuted }}>Not logged yet</Text>
                    </View>
                    <ChevronRight size={18} color="#cbd5e1" />
                  </AnimatedPressable>
                )}
              </Animated.View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* ═══════════ AI SCAN MODAL ═══════════ */}
      <Modal visible={showScanModal} animationType="none" transparent>
        <Animated.View
          entering={FadeIn.duration(250)}
          exiting={FadeOut.duration(200)}
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}
        >
          <Pressable style={{ flex: 1 }} onPress={() => setShowScanModal(false)} />
          <Animated.View
            entering={SlideInDown.duration(500).springify().damping(20).stiffness(90)}
            exiting={SlideOutDown.duration(300)}
            style={{ backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 40, maxHeight: '90%', borderCurve: 'continuous' }}
          >
            <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
              {/* Header */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <Animated.View entering={FadeInLeft.duration(350)} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Sparkles size={22} color="#8b5cf6" />
                  <Text style={{ fontSize: 20, fontWeight: '800', color: textPrimary }}>AI Food Scanner</Text>
                </Animated.View>
                <AnimatedPressable onPress={() => setShowScanModal(false)} scaleDown={0.85}>
                  <X size={24} color={textMuted} />
                </AnimatedPressable>
              </View>

              {/* No result yet — show pick options */}
              {!scanResult && !scanning && (
                <View style={{ gap: 12 }}>
                  <Animated.Text entering={FadeIn.delay(100).duration(300)} style={{ fontSize: 14, color: textMuted, lineHeight: 20, marginBottom: 4 }}>
                    Take a photo of your food or pick one from your gallery. Gemini AI will instantly estimate calories and macros.
                  </Animated.Text>

                  <Animated.View entering={FadeInDown.delay(150).duration(400).springify()}>
                    <AnimatedPressable
                      onPress={takePhoto}
                      scaleDown={0.97}
                      style={{ flexDirection: 'row', alignItems: 'center', gap: 14, padding: 18, backgroundColor: '#0f172a', borderRadius: 16, borderCurve: 'continuous' }}
                    >
                      <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: 'rgba(139,92,246,0.25)', alignItems: 'center', justifyContent: 'center', borderCurve: 'continuous' }}>
                        <Camera size={22} color="#a78bfa" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 15, fontWeight: '700', color: '#fff' }}>Take Photo</Text>
                        <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>Use camera to snap your meal</Text>
                      </View>
                    </AnimatedPressable>
                  </Animated.View>

                  <Animated.View entering={FadeInDown.delay(220).duration(400).springify()}>
                    <AnimatedPressable
                      onPress={pickFromLibrary}
                      scaleDown={0.97}
                      style={{ flexDirection: 'row', alignItems: 'center', gap: 14, padding: 18, backgroundColor: '#f1f5f9', borderRadius: 16, borderCurve: 'continuous' }}
                    >
                      <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: '#e2e8f0', alignItems: 'center', justifyContent: 'center', borderCurve: 'continuous' }}>
                        <ImageIcon size={22} color="#64748b" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 15, fontWeight: '700', color: textPrimary }}>Choose from Gallery</Text>
                        <Text style={{ fontSize: 12, color: textMuted }}>Pick an existing food photo</Text>
                      </View>
                    </AnimatedPressable>
                  </Animated.View>

                  {scanError ? (
                    <Animated.View entering={FadeInDown.duration(300)} style={{ backgroundColor: '#fef2f2', padding: 12, borderRadius: 12 }}>
                      <Text style={{ fontSize: 13, color: '#dc2626', fontWeight: '600' }}>{scanError}</Text>
                    </Animated.View>
                  ) : null}
                </View>
              )}

              {/* Scanning state */}
              {scanning && (
                <Animated.View entering={FadeIn.duration(350)} style={{ alignItems: 'center', paddingVertical: 40, gap: 16 }}>
                  {previewUri && (
                    <Animated.View entering={ZoomIn.duration(400).springify().damping(14)}>
                      <Image source={{ uri: previewUri }} style={{ width: '100%', height: 200, borderRadius: 16 }} resizeMode="cover" />
                    </Animated.View>
                  )}
                  <ScanPulse />
                  <Animated.Text entering={FadeInUp.delay(200).duration(300)} style={{ fontSize: 16, fontWeight: '700', color: textPrimary }}>Analyzing with Gemini AI...</Animated.Text>
                  <Animated.Text entering={FadeInUp.delay(300).duration(300)} style={{ fontSize: 13, color: textMuted, textAlign: 'center' }}>
                    Identifying food items and calculating nutrition
                  </Animated.Text>
                </Animated.View>
              )}

              {/* Scan result */}
              {scanResult && !scanning && (
                <Animated.View entering={FadeIn.duration(400)} style={{ gap: 16 }}>
                  {previewUri && (
                    <Animated.View entering={ZoomIn.duration(400).springify().damping(14)}>
                      <Image source={{ uri: previewUri }} style={{ width: '100%', height: 180, borderRadius: 16 }} resizeMode="cover" />
                    </Animated.View>
                  )}

                  {/* Food name + health score */}
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Animated.View entering={FadeInLeft.delay(100).duration(350)} style={{ flex: 1 }}>
                      <Text style={{ fontSize: 22, fontWeight: '800', color: textPrimary }}>{scanResult.name}</Text>
                    </Animated.View>
                    <Animated.View entering={ZoomIn.delay(200).duration(350).springify().damping(12)} style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: scanResult.healthScore >= 7 ? '#f0fdf4' : scanResult.healthScore >= 4 ? '#fffbeb' : '#fef2f2', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 99 }}>
                      <Star size={14} color={scanResult.healthScore >= 7 ? '#16a34a' : scanResult.healthScore >= 4 ? '#f59e0b' : '#ef4444'} fill={scanResult.healthScore >= 7 ? '#16a34a' : scanResult.healthScore >= 4 ? '#f59e0b' : '#ef4444'} />
                      <Text style={{ fontSize: 13, fontWeight: '700', color: scanResult.healthScore >= 7 ? '#16a34a' : scanResult.healthScore >= 4 ? '#f59e0b' : '#ef4444' }}>{scanResult.healthScore}/10</Text>
                    </Animated.View>
                  </View>

                  {/* Total macros */}
                  <Animated.View entering={FadeInDown.delay(150).duration(400).springify()} style={{ backgroundColor: '#f8fafc', borderRadius: 16, padding: 16, gap: 8, borderCurve: 'continuous' }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={{ fontSize: 14, fontWeight: '600', color: textMuted }}>Total Calories</Text>
                      <Text style={{ fontSize: 24, fontWeight: '800', color: textPrimary }}>{scanResult.totalCalories} kcal</Text>
                    </View>
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      {[
                        { label: 'Carbs', value: scanResult.carbsG, color: '#3b82f6' },
                        { label: 'Protein', value: scanResult.proteinG, color: '#10b981' },
                        { label: 'Fat', value: scanResult.fatG, color: '#f59e0b' },
                      ].map((m, i) => (
                        <Animated.View key={m.label} entering={FadeInUp.delay(i * 60 + 250).duration(300)} style={{ flex: 1, alignItems: 'center', paddingVertical: 8, backgroundColor: '#fff', borderRadius: 10, borderCurve: 'continuous' }}>
                          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: m.color, marginBottom: 4 }} />
                          <Text style={{ fontSize: 15, fontWeight: '700', color: textPrimary }}>{m.value}g</Text>
                          <Text style={{ fontSize: 10, fontWeight: '600', color: textMuted }}>{m.label}</Text>
                        </Animated.View>
                      ))}
                    </View>
                  </Animated.View>

                  {/* Detected items */}
                  {scanResult.items && scanResult.items.length > 0 && (
                    <Animated.View entering={FadeInDown.delay(300).duration(350)}>
                      <Text style={{ fontSize: 13, fontWeight: '700', color: textMuted, marginBottom: 8, letterSpacing: 0.5, textTransform: 'uppercase' }}>Detected Items</Text>
                      <View style={{ gap: 6 }}>
                        {scanResult.items.map((item, i) => (
                          <Animated.View key={i} entering={FadeInDown.delay(i * 60 + 350).duration(300).springify()} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 12, backgroundColor: '#f8fafc', borderRadius: 10, borderCurve: 'continuous' }}>
                            <View>
                              <Text style={{ fontSize: 14, fontWeight: '600', color: textPrimary }}>{item.name}</Text>
                              <Text style={{ fontSize: 11, color: textMuted }}>{item.portion}</Text>
                            </View>
                            <Text style={{ fontSize: 14, fontWeight: '700', color: textPrimary }}>{item.kcal} kcal</Text>
                          </Animated.View>
                        ))}
                      </View>
                    </Animated.View>
                  )}

                  {/* Tip */}
                  {scanResult.tips && (
                    <Animated.View entering={FadeInDown.delay(400).duration(350)} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: '#faf5ff', padding: 14, borderRadius: 14, borderWidth: 1, borderColor: '#e9d5ff', borderCurve: 'continuous' }}>
                      <Lightbulb size={16} color="#7c3aed" style={{ marginTop: 2 }} />
                      <Text style={{ flex: 1, fontSize: 12, color: '#6d28d9', lineHeight: 18, fontWeight: '500' }}>{scanResult.tips}</Text>
                    </Animated.View>
                  )}

                  {/* Actions */}
                  <Animated.View entering={FadeInUp.delay(450).duration(350)} style={{ flexDirection: 'row', gap: 12 }}>
                    <AnimatedPressable
                      onPress={() => { setScanResult(null); setPreviewUri(null); }}
                      scaleDown={0.95}
                      style={{ flex: 1, paddingVertical: 16, borderRadius: 14, alignItems: 'center', backgroundColor: '#f1f5f9', borderCurve: 'continuous' }}
                    >
                      <Text style={{ fontSize: 14, fontWeight: '700', color: textMuted }}>Retake</Text>
                    </AnimatedPressable>
                    <AnimatedPressable
                      onPress={handleAddScanResult}
                      scaleDown={0.97}
                      style={{ flex: 2, paddingVertical: 16, borderRadius: 14, alignItems: 'center', backgroundColor: '#10b981', boxShadow: '0 4px 14px rgba(16,185,129,0.35)' as any, borderCurve: 'continuous' }}
                    >
                      <Text style={{ fontSize: 14, fontWeight: '700', color: '#fff' }}>Add to Meals</Text>
                    </AnimatedPressable>
                  </Animated.View>
                </Animated.View>
              )}
            </ScrollView>
          </Animated.View>
        </Animated.View>
      </Modal>

      {/* ═══════════ MANUAL ADD MODAL ═══════════ */}
      <Modal visible={showAddModal} animationType="none" transparent>
        <Animated.View
          entering={FadeIn.duration(250)}
          exiting={FadeOut.duration(200)}
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'flex-end' }}
        >
          <Pressable style={{ flex: 1 }} onPress={() => setShowAddModal(false)} />
          <Animated.View
            entering={SlideInDown.duration(500).springify().damping(20).stiffness(90)}
            exiting={SlideOutDown.duration(300)}
            style={{ backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40, borderCurve: 'continuous' }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <Animated.Text entering={FadeInLeft.duration(350)} style={{ fontSize: 20, fontWeight: '800', color: textPrimary }}>Log Meal</Animated.Text>
              <AnimatedPressable onPress={() => setShowAddModal(false)} scaleDown={0.85}>
                <X size={24} color={textMuted} />
              </AnimatedPressable>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, marginBottom: 16 }}>
              {MEAL_TYPES.map((mt, i) => (
                <Animated.View key={mt.type} entering={FadeInDown.delay(i * 60 + 100).duration(350).springify()}>
                  <AnimatedPressable
                    onPress={() => {
                      if (Platform.OS === 'ios') Haptics.selectionAsync();
                      setMealType(mt.type as MealEntry['type']);
                    }}
                    scaleDown={0.93}
                    style={{ padding: 12, borderRadius: 14, backgroundColor: mealType === mt.type ? '#fffbeb' : '#f1f5f9', borderWidth: 2, borderColor: mealType === mt.type ? '#f59e0b' : 'transparent', alignItems: 'center', width: 80, borderCurve: 'continuous' }}
                  >
                    {mt.icon}
                    <Text style={{ fontSize: 10, fontWeight: '700', color: textPrimary, marginTop: 4 }}>{mt.label}</Text>
                  </AnimatedPressable>
                </Animated.View>
              ))}
            </ScrollView>

            <View style={{ gap: 12 }}>
              <Animated.View entering={FadeInDown.delay(200).duration(300)}>
                <TextInput style={{ backgroundColor: '#f1f5f9', borderRadius: 12, padding: 14, fontSize: 15, color: textPrimary }} placeholder="Meal name" placeholderTextColor={textMuted} value={mealName} onChangeText={setMealName} />
              </Animated.View>
              <Animated.View entering={FadeInDown.delay(260).duration(300)}>
                <TextInput style={{ backgroundColor: '#f1f5f9', borderRadius: 12, padding: 14, fontSize: 15, color: textPrimary }} placeholder="Calories (kcal) *" placeholderTextColor={textMuted} keyboardType="numeric" value={mealKcal} onChangeText={setMealKcal} />
              </Animated.View>
              <Animated.View entering={FadeInDown.delay(320).duration(300)} style={{ flexDirection: 'row', gap: 8 }}>
                <TextInput style={{ flex: 1, backgroundColor: '#f1f5f9', borderRadius: 12, padding: 14, fontSize: 15, color: textPrimary }} placeholder="Carbs (g)" placeholderTextColor={textMuted} keyboardType="numeric" value={mealCarbs} onChangeText={setMealCarbs} />
                <TextInput style={{ flex: 1, backgroundColor: '#f1f5f9', borderRadius: 12, padding: 14, fontSize: 15, color: textPrimary }} placeholder="Protein (g)" placeholderTextColor={textMuted} keyboardType="numeric" value={mealProtein} onChangeText={setMealProtein} />
                <TextInput style={{ flex: 1, backgroundColor: '#f1f5f9', borderRadius: 12, padding: 14, fontSize: 15, color: textPrimary }} placeholder="Fat (g)" placeholderTextColor={textMuted} keyboardType="numeric" value={mealFat} onChangeText={setMealFat} />
              </Animated.View>
            </View>

            <Animated.View entering={FadeInUp.delay(400).duration(350)}>
              <AnimatedPressable
                onPress={handleAddMeal}
                scaleDown={0.97}
                style={{ marginTop: 20, backgroundColor: '#f59e0b', paddingVertical: 16, borderRadius: 14, alignItems: 'center', boxShadow: '0 4px 14px rgba(245,158,11,0.35)' as any, borderCurve: 'continuous' }}
              >
                <Text style={{ fontSize: 16, fontWeight: '700', color: '#fff' }}>Save Meal</Text>
              </AnimatedPressable>
            </Animated.View>
          </Animated.View>
        </Animated.View>
      </Modal>
    </SafeAreaView>
  );
}
