import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Animated, {
  FadeInDown,
  FadeInUp,
  FadeIn,
  FadeOut,
  ZoomIn,
  LinearTransition,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Heart, Mail, Lock, User, Eye, EyeOff } from 'lucide-react-native';
import { HealthContext } from '../store/health-store';
import { AnimatedPressable } from './animated-utils';
import * as Haptics from 'expo-haptics';

const PRIMARY = '#007bff';

export default function LoginScreen() {
  const { login, register } = React.use(HealthContext);
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  // Shake animation for errors
  const errorShake = useSharedValue(0);
  const errorShakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: errorShake.value }],
  }));

  const triggerShake = () => {
    errorShake.value = withSequence(
      withTiming(-8, { duration: 50 }),
      withTiming(8, { duration: 50 }),
      withTiming(-6, { duration: 50 }),
      withTiming(6, { duration: 50 }),
      withTiming(-3, { duration: 50 }),
      withTiming(0, { duration: 50 })
    );
    if (Platform.OS === 'ios') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const handleSubmit = async () => {
    setError('');
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields');
      triggerShake();
      return;
    }
    if (isRegister && !name.trim()) {
      setError('Please enter your name');
      triggerShake();
      return;
    }
    if (password.length < 4) {
      setError('Password must be at least 4 characters');
      triggerShake();
      return;
    }

    setBusy(true);
    try {
      if (isRegister) {
        const ok = await register(name.trim(), email.trim().toLowerCase(), password);
        if (!ok) {
          setError('An account with this email already exists');
          triggerShake();
        } else if (Platform.OS === 'ios') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      } else {
        const ok = await login(email.trim().toLowerCase(), password);
        if (!ok) {
          setError('Invalid email or password');
          triggerShake();
        } else if (Platform.OS === 'ios') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      }
    } catch (e) {
      setError('Something went wrong. Please try again.');
      triggerShake();
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',
            paddingHorizontal: 28,
            paddingVertical: 40,
          }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo area — bouncy entrance */}
          <View style={{ alignItems: 'center', marginBottom: 40 }}>
            <Animated.View
              entering={ZoomIn.duration(500).springify().damping(10).stiffness(150)}
              style={{
                width: 72,
                height: 72,
                borderRadius: 22,
                backgroundColor: `${PRIMARY}15`,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16,
                borderCurve: 'continuous',
              }}
            >
              <Heart size={36} color={PRIMARY} />
            </Animated.View>
            <Animated.Text
              entering={FadeInDown.delay(200).duration(450).springify().damping(18)}
              style={{ fontSize: 28, fontWeight: '800', color: '#0f172a', letterSpacing: -0.5 }}
            >
              HealthTracker
            </Animated.Text>
            <Animated.Text
              entering={FadeIn.delay(350).duration(400)}
              key={isRegister ? 'register-subtitle' : 'login-subtitle'}
              style={{ fontSize: 14, color: '#94a3b8', marginTop: 4 }}
            >
              {isRegister ? 'Create your account' : 'Welcome back'}
            </Animated.Text>
          </View>

          {/* Form — staggered appearance */}
          <Animated.View layout={LinearTransition.springify().damping(18)} style={{ gap: 14 }}>
            {isRegister && (
              <Animated.View
                entering={FadeInDown.duration(350).springify().damping(18)}
                exiting={FadeOut.duration(200)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: '#fff',
                  borderRadius: 14,
                  paddingHorizontal: 16,
                  height: 54,
                  borderWidth: 1,
                  borderColor: '#e2e8f0',
                  borderCurve: 'continuous',
                }}
              >
                <User size={18} color="#94a3b8" />
                <TextInput
                  style={{ flex: 1, marginLeft: 12, fontSize: 15, color: '#0f172a' }}
                  placeholder="Full name"
                  placeholderTextColor="#94a3b8"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />
              </Animated.View>
            )}

            <Animated.View
              entering={FadeInDown.delay(isRegister ? 80 : 400).duration(400).springify().damping(18)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#fff',
                borderRadius: 14,
                paddingHorizontal: 16,
                height: 54,
                borderWidth: 1,
                borderColor: '#e2e8f0',
                borderCurve: 'continuous',
              }}
            >
              <Mail size={18} color="#94a3b8" />
              <TextInput
                style={{ flex: 1, marginLeft: 12, fontSize: 15, color: '#0f172a' }}
                placeholder="Email"
                placeholderTextColor="#94a3b8"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </Animated.View>

            <Animated.View
              entering={FadeInDown.delay(isRegister ? 160 : 480).duration(400).springify().damping(18)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#fff',
                borderRadius: 14,
                paddingHorizontal: 16,
                height: 54,
                borderWidth: 1,
                borderColor: '#e2e8f0',
                borderCurve: 'continuous',
              }}
            >
              <Lock size={18} color="#94a3b8" />
              <TextInput
                style={{ flex: 1, marginLeft: 12, fontSize: 15, color: '#0f172a' }}
                placeholder="Password"
                placeholderTextColor="#94a3b8"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <AnimatedPressable
                onPress={() => setShowPassword(!showPassword)}
                scaleDown={0.85}
                haptic={false}
              >
                {showPassword ?
                  <EyeOff size={18} color="#94a3b8" /> :
                  <Eye size={18} color="#94a3b8" />
                }
              </AnimatedPressable>
            </Animated.View>
          </Animated.View>

          {/* Error — animated shake */}
          {error ? (
            <Animated.View entering={FadeInDown.duration(250)} exiting={FadeOut.duration(200)} style={errorShakeStyle}>
              <Text style={{ color: '#ef4444', fontSize: 13, fontWeight: '600', marginTop: 12, textAlign: 'center' }}>
                {error}
              </Text>
            </Animated.View>
          ) : null}

          {/* Submit — spring scale on press */}
          <Animated.View entering={FadeInUp.delay(550).duration(450)}>
            <AnimatedPressable
              onPress={handleSubmit}
              disabled={busy}
              scaleDown={0.97}
              style={{
                backgroundColor: PRIMARY,
                height: 54,
                borderRadius: 14,
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: 20,
                boxShadow: '0 4px 14px rgba(0,123,255,0.35)' as any,
                opacity: busy ? 0.7 : 1,
                borderCurve: 'continuous',
              }}
            >
              {busy ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={{ fontSize: 16, fontWeight: '700', color: '#fff' }}>
                  {isRegister ? 'Create Account' : 'Sign In'}
                </Text>
              )}
            </AnimatedPressable>
          </Animated.View>

          {/* Toggle */}
          <Animated.View entering={FadeIn.delay(650).duration(400)}>
            <AnimatedPressable
              onPress={() => {
                if (Platform.OS === 'ios') Haptics.selectionAsync();
                setIsRegister(!isRegister);
                setError('');
              }}
              scaleDown={0.98}
              haptic={false}
              style={{ marginTop: 20, alignItems: 'center' }}
            >
              <Text style={{ fontSize: 14, color: '#64748b' }}>
                {isRegister ? 'Already have an account? ' : "Don't have an account? "}
                <Text style={{ color: PRIMARY, fontWeight: '700' }}>
                  {isRegister ? 'Sign In' : 'Register'}
                </Text>
              </Text>
            </AnimatedPressable>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
