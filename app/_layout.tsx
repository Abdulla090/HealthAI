import React from 'react';
import { Tabs, useRouter, usePathname } from 'expo-router';
import { Platform, ActivityIndicator, View, Text, Pressable } from 'react-native';
import Animated, {
  FadeIn,
  ZoomIn,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

if (__DEV__ && Platform.OS === 'web') {
  try { require('react-grab'); } catch (e) { /* optional */ }
}

import { LayoutDashboard, Activity, Target, Utensils, UserCircle } from 'lucide-react-native';
import { HealthProvider, HealthContext } from '../store/health-store';
import LoginScreen from '../components/login-screen';

const PRIMARY = '#007bff';
const INACTIVE = '#94a3b8';

const TAB_ITEMS = [
  { name: 'index', title: 'Home', icon: LayoutDashboard, href: '/' },
  { name: 'activity', title: 'Activity', icon: Activity, href: '/activity' },
  { name: 'nutrition', title: 'Nutrition', icon: Utensils, href: '/nutrition' },
  { name: 'mission', title: 'Focus', icon: Target, href: '/mission' },
  { name: 'profile', title: 'Profile', icon: UserCircle, href: '/profile' },
];

/* ── Animated tab icon ────────────────────────────── */
function AnimatedTabIcon({ icon: Icon, color, focused }: { icon: any; color: string; focused: boolean }) {
  const scale = useSharedValue(1);
  React.useEffect(() => {
    scale.value = withSpring(focused ? 1.15 : 1, { damping: 12, stiffness: 200, mass: 0.5 });
  }, [focused]);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  return (
    <Animated.View style={animStyle} pointerEvents="none">
      <Icon size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
    </Animated.View>
  );
}

/* ── Custom Tab Bar (web & native) ────────────────── */
function CustomTabBar() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  const getIsActive = (href: string) => {
    if (href === '/') return pathname === '/' || pathname === '/index';
    return pathname === href;
  };

  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
        paddingBottom: Platform.OS === 'ios' ? insets.bottom : 6,
        paddingTop: 8,
        height: Platform.OS === 'ios' ? 56 + insets.bottom : 62,
      }}
    >
      {TAB_ITEMS.map((tab) => {
        const isActive = getIsActive(tab.href);
        const color = isActive ? PRIMARY : INACTIVE;
        return (
          <Pressable
            key={tab.name}
            onPress={() => {
              router.push(tab.href as any);
            }}
            style={({ pressed }) => ({
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: pressed ? 0.65 : 1,
              gap: 3,
            })}
            accessibilityRole="tab"
            accessibilityLabel={tab.title}
          >
            <AnimatedTabIcon icon={tab.icon} color={color} focused={isActive} />
            <Text
              style={{
                fontSize: 10,
                fontWeight: isActive ? '700' : '600',
                color,
                textAlign: 'center',
              }}
              numberOfLines={1}
            >
              {tab.title}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/* ── App Content ──────────────────────────────────── */
function AppContent() {
  const { isAuthenticated, loading } = React.use(HealthContext);

  if (loading) {
    return (
      <Animated.View
        entering={FadeIn.duration(300)}
        style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc' }}
      >
        <Animated.View entering={ZoomIn.duration(500).springify().damping(14)}>
          <ActivityIndicator size="large" color={PRIMARY} />
        </Animated.View>
      </Animated.View>
    );
  }

  if (!isAuthenticated) {
    return (
      <Animated.View entering={FadeIn.duration(450)} style={{ flex: 1 }}>
        <LoginScreen />
      </Animated.View>
    );
  }

  return (
    <Tabs
      tabBar={() => <CustomTabBar />}
      screenOptions={{
        headerShown: false,
        ...(Platform.OS !== 'web' ? { animation: 'shift' } : {}),
      }}
    >
      {TAB_ITEMS.map((tab) => (
        <Tabs.Screen key={tab.name} name={tab.name} options={{ title: tab.title }} />
      ))}
    </Tabs>
  );
}

/* ── Root Layout ──────────────────────────────────── */
export default function RootLayout() {
  return (
    <HealthProvider>
      <AppContent />
    </HealthProvider>
  );
}
