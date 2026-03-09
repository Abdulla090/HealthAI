import React from 'react';
import { Tabs } from 'expo-router';
import { Platform, ActivityIndicator, View } from 'react-native';

if (__DEV__ && Platform.OS === 'web') {
  require('react-grab');
}

import { LayoutDashboard, Activity, Target, Utensils, UserCircle } from 'lucide-react-native';
import { HealthProvider, HealthContext } from '../store/health-store';
import LoginScreen from '../components/login-screen';

const PRIMARY = '#007bff';
const INACTIVE = '#94a3b8';

function AppContent() {
  const { isAuthenticated, loading } = React.use(HealthContext);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc' }}>
        <ActivityIndicator size="large" color={PRIMARY} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: PRIMARY,
        tabBarInactiveTintColor: INACTIVE,
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor: '#e2e8f0',
          ...(Platform.OS === 'web' ? { height: 60 } : {}),
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          marginBottom: Platform.OS === 'ios' ? 0 : 4,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <LayoutDashboard size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="activity"
        options={{
          title: 'Activity',
          tabBarIcon: ({ color }) => <Activity size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="nutrition"
        options={{
          title: 'Nutrition',
          tabBarIcon: ({ color }) => <Utensils size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="mission"
        options={{
          title: 'Focus',
          tabBarIcon: ({ color }) => <Target size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <UserCircle size={22} color={color} />,
        }}
      />
    </Tabs>
  );
}

export default function RootLayout() {
  return (
    <HealthProvider>
      <AppContent />
    </HealthProvider>
  );
}
