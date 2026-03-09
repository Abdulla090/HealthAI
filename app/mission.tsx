import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Svg, { Circle } from 'react-native-svg';
import {
  User,
  ArrowRightLeft,
  Lightbulb,
  Plus,
  Footprints,
  Flame,
  Moon,
  Heart,
  TrendingDown,
  Utensils,
  Droplet,
  CheckCircle,
  Activity,
} from 'lucide-react-native';
import { HealthContext } from '../store/health-store';

const PRIMARY = '#007bff';
const LIGHT_BG = '#f5f7f8';
const CARD_LIGHT = '#ffffff';

export default function MissionControlScreen() {
  const {
    user,
    today,
    addWater,
  } = React.use(HealthContext);

  const textPrimary = '#0f172a';
  const textMuted = '#94a3b8';
  const borderColor = '#f1f5f9';

  const totalWaterMl = today.water.reduce((sum, w) => sum + w.ml, 0);
  const waterGoal = 2500; // ml
  const waterLiters = (totalWaterMl / 1000).toFixed(1);
  const waterGoalL = (waterGoal / 1000).toFixed(1);
  const circumference = 2 * Math.PI * 88;
  const progress = Math.min(1, totalWaterMl / waterGoal);
  const dashOffset = circumference * (1 - progress);

  const totalWorkoutKcal = today.workouts.reduce((sum, w) => sum + w.kcal, 0);
  const sleepPct = today.sleep?.quality ?? 0;
  const stressText = today.stressLevel.charAt(0).toUpperCase() + today.stressLevel.slice(1);

  // Tips based on data
  const getProTip = () => {
    const remaining = waterGoal - totalWaterMl;
    if (remaining > 1000) {
      return `Drink at least 500ml now to stay on track. You still need ${(remaining / 1000).toFixed(1)}L today.`;
    } else if (remaining > 0) {
      return `Almost there! Just ${remaining}ml more to hit your daily water goal.`;
    }
    return "Great job! You've hit your water goal today. Keep sipping throughout the day.";
  };

  const miniStats = [
    { icon: <Footprints size={20} color={PRIMARY} />, borderColor: `${PRIMARY}33`, value: today.steps > 999 ? `${(today.steps / 1000).toFixed(1)}k` : `${today.steps}`, label: 'Steps' },
    { icon: <Flame size={20} color="#f97316" />, borderColor: '#f9731633', value: `${totalWorkoutKcal}`, label: 'Kcal' },
    { icon: <Moon size={20} color="#8b5cf6" />, borderColor: '#8b5cf633', value: today.sleep ? `${sleepPct}%` : '--', label: 'Sleep' },
    { icon: <Heart size={20} color="#ef4444" />, borderColor: '#ef444433', value: today.workouts.length > 0 ? '72' : '--', label: 'Heart' },
    { icon: <TrendingDown size={20} color="#10b981" />, borderColor: '#10b98133', value: stressText, label: 'Stress' },
    { icon: <Utensils size={20} color="#f59e0b" />, borderColor: '#f59e0b33', value: today.caloriesConsumed > 0 ? `${(today.caloriesConsumed / 1000).toFixed(1)}k` : '0', label: 'Fuel' },
  ];

  // Build recent activity from logged data
  const recentItems: { icon: React.ReactNode; iconBg: string; title: string; subtitle: string; badge: React.ReactNode; unit?: string }[] = [];

  // Add workouts
  today.workouts.forEach((w) => {
    recentItems.push({
      icon: <Activity size={20} color="#2563eb" />,
      iconBg: '#eff6ff',
      title: w.name,
      subtitle: `${new Date(w.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • ${w.durationMin} min`,
      badge: <Text style={{ fontSize: 14, fontWeight: '700', color: textPrimary }}>+{w.kcal}</Text>,
      unit: 'KCAL',
    });
  });

  // Add water logs (last 3)
  today.water.slice(-3).forEach((w) => {
    recentItems.push({
      icon: <Droplet size={20} color="#06b6d4" />,
      iconBg: '#ecfeff',
      title: 'Water Intake',
      subtitle: `${new Date(w.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • ${w.ml}ml`,
      badge: <CheckCircle size={18} color="#06b6d4" />,
    });
  });

  const dayName = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

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
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: 24, paddingTop: 16, paddingBottom: 12 }}>
          <View>
            <Text style={{ fontSize: 34, fontWeight: '800', color: textPrimary, letterSpacing: -1 }}>Mission Control</Text>
            <Text style={{ fontSize: 14, color: textMuted, fontWeight: '500', marginTop: 2 }}>{dayName}</Text>
          </View>
          <View style={{ width: 48, height: 48, borderRadius: 24, borderWidth: 2, borderColor: PRIMARY, backgroundColor: `${PRIMARY}15`, alignItems: 'center', justifyContent: 'center', marginTop: 4 }}>
            <User size={24} color={PRIMARY} />
          </View>
        </View>

        {/* Primary Focus Card */}
        <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
          <View style={{ backgroundColor: CARD_LIGHT, borderRadius: 28, padding: 28, borderWidth: 1, borderColor, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' as any, overflow: 'hidden' }}>
            <View style={{ position: 'absolute', top: -60, right: -60, width: 160, height: 160, borderRadius: 80, backgroundColor: `${PRIMARY}08` }} />

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <View style={{ backgroundColor: `${PRIMARY}15`, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 99 }}>
                <Text style={{ fontSize: 9, fontWeight: '700', color: PRIMARY, letterSpacing: 1.5, textTransform: 'uppercase' }}>Primary Focus</Text>
              </View>
            </View>

            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 28, fontWeight: '800', color: textPrimary, letterSpacing: -0.5, textAlign: 'center' }}>Daily Hydration</Text>
              <Text style={{ fontSize: 13, color: textMuted, textAlign: 'center', marginTop: 6, maxWidth: 220, lineHeight: 18 }}>
                Critical for focus and metabolic recovery today.
              </Text>

              {/* Progress Ring */}
              <View style={{ marginVertical: 24, alignItems: 'center', justifyContent: 'center' }}>
                <Svg width={192} height={192} viewBox="0 0 192 192">
                  <Circle cx={96} cy={96} r={88} fill="transparent" stroke="#e2e8f0" strokeWidth={12} />
                  <Circle cx={96} cy={96} r={88} fill="transparent" stroke="#06b6d4" strokeWidth={12} strokeDasharray={`${circumference}`} strokeDashoffset={dashOffset} strokeLinecap="round" transform="rotate(-90, 96, 96)" />
                </Svg>
                <View style={{ position: 'absolute', alignItems: 'center' }}>
                  <Text style={{ fontSize: 42, fontWeight: '900', color: textPrimary, lineHeight: 48 }}>{waterLiters}</Text>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: textMuted, letterSpacing: 0.5 }}>OF {waterGoalL} LITERS</Text>
                </View>
              </View>

              {/* Pro Tip */}
              <View style={{ width: '100%', backgroundColor: '#ecfeff', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: '#cffafe', marginBottom: 16 }}>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
                  <View style={{ marginTop: 2 }}>
                    <Lightbulb size={18} color="#155e75" />
                  </View>
                  <Text style={{ flex: 1, fontSize: 12, color: '#155e75', lineHeight: 17, fontWeight: '500' }}>
                    <Text style={{ fontWeight: '800' }}>Pro Tip: </Text>
                    {getProTip()}
                  </Text>
                </View>
              </View>
            </View>

            {/* CTA */}
            <TouchableOpacity
              onPress={() => addWater(250)}
              style={{ width: '100%', paddingVertical: 18, backgroundColor: '#0f172a', borderRadius: 18, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8, boxShadow: '0 4px 14px rgba(0,0,0,0.2)' as any }}
              activeOpacity={0.85}
            >
              <Plus size={20} color="#fff" />
              <Text style={{ fontSize: 15, fontWeight: '700', color: '#fff' }}>Log 250ml Water</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Mini Stats */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 14, paddingVertical: 4 }}>
          {miniStats.map((s, i) => (
            <View key={i} style={{ alignItems: 'center', gap: 6 }}>
              <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: CARD_LIGHT, borderWidth: 2, borderColor: s.borderColor, alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' as any }}>
                {s.icon}
                <Text style={{ fontSize: 10, fontWeight: '700', color: textPrimary, marginTop: 1 }}>{s.value}</Text>
              </View>
              <Text style={{ fontSize: 9, fontWeight: '700', color: textMuted, letterSpacing: 0.8, textTransform: 'uppercase' }}>{s.label}</Text>
            </View>
          ))}
        </ScrollView>

        {/* Recent Activity */}
        <View style={{ paddingHorizontal: 20, marginTop: 20 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text style={{ fontSize: 11, fontWeight: '700', color: textMuted, letterSpacing: 1.5, textTransform: 'uppercase' }}>Recent Activity</Text>
          </View>

          {recentItems.length === 0 ? (
            <View style={{ backgroundColor: CARD_LIGHT, borderRadius: 20, padding: 24, borderWidth: 1, borderColor, alignItems: 'center' }}>
              <Droplet size={32} color={textMuted} />
              <Text style={{ fontSize: 14, fontWeight: '600', color: textMuted, marginTop: 8 }}>No activity yet</Text>
              <Text style={{ fontSize: 12, color: textMuted, marginTop: 4 }}>Log water or a workout to see activity here</Text>
            </View>
          ) : (
            <View style={{ gap: 10 }}>
              {recentItems.map((item, i) => (
                <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16, backgroundColor: CARD_LIGHT, borderRadius: 20, borderWidth: 1, borderColor }}>
                  <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: item.iconBg, alignItems: 'center', justifyContent: 'center' }}>{item.icon}</View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: textPrimary }}>{item.title}</Text>
                    <Text style={{ fontSize: 11, color: textMuted, marginTop: 2 }}>{item.subtitle}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    {item.badge}
                    {item.unit ? <Text style={{ fontSize: 10, fontWeight: '700', color: textMuted }}>{item.unit}</Text> : null}
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
