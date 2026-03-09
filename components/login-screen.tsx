import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Heart, Mail, Lock, User, Eye, EyeOff } from 'lucide-react-native';
import { HealthContext } from '../store/health-store';

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

  const handleSubmit = async () => {
    setError('');
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }
    if (isRegister && !name.trim()) {
      setError('Please enter your name');
      return;
    }
    if (password.length < 4) {
      setError('Password must be at least 4 characters');
      return;
    }

    setBusy(true);
    try {
      if (isRegister) {
        const ok = await register(name.trim(), email.trim().toLowerCase(), password);
        if (!ok) {
          setError('An account with this email already exists');
        }
      } else {
        const ok = await login(email.trim().toLowerCase(), password);
        if (!ok) {
          setError('Invalid email or password');
        }
      }
    } catch (e) {
      setError('Something went wrong. Please try again.');
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
          {/* Logo area */}
          <View style={{ alignItems: 'center', marginBottom: 40 }}>
            <View
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
            </View>
            <Text style={{ fontSize: 28, fontWeight: '800', color: '#0f172a', letterSpacing: -0.5 }}>
              HealthTracker
            </Text>
            <Text style={{ fontSize: 14, color: '#94a3b8', marginTop: 4 }}>
              {isRegister ? 'Create your account' : 'Welcome back'}
            </Text>
          </View>

          {/* Form */}
          <View style={{ gap: 14 }}>
            {isRegister && (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: '#fff',
                  borderRadius: 14,
                  paddingHorizontal: 16,
                  height: 54,
                  borderWidth: 1,
                  borderColor: '#e2e8f0',
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
              </View>
            )}

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#fff',
                borderRadius: 14,
                paddingHorizontal: 16,
                height: 54,
                borderWidth: 1,
                borderColor: '#e2e8f0',
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
            </View>

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#fff',
                borderRadius: 14,
                paddingHorizontal: 16,
                height: 54,
                borderWidth: 1,
                borderColor: '#e2e8f0',
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
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                {showPassword ?
                  <EyeOff size={18} color="#94a3b8" /> :
                  <Eye size={18} color="#94a3b8" />
                }
              </TouchableOpacity>
            </View>
          </View>

          {/* Error */}
          {error ? (
            <Text style={{ color: '#ef4444', fontSize: 13, fontWeight: '600', marginTop: 12, textAlign: 'center' }}>
              {error}
            </Text>
          ) : null}

          {/* Submit */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={busy}
            style={{
              backgroundColor: PRIMARY,
              height: 54,
              borderRadius: 14,
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: 20,
              boxShadow: '0 4px 14px rgba(0,123,255,0.35)' as any,
              opacity: busy ? 0.7 : 1,
            }}
            activeOpacity={0.85}
          >
            {busy ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#fff' }}>
                {isRegister ? 'Create Account' : 'Sign In'}
              </Text>
            )}
          </TouchableOpacity>

          {/* Toggle */}
          <TouchableOpacity
            onPress={() => {
              setIsRegister(!isRegister);
              setError('');
            }}
            style={{ marginTop: 20, alignItems: 'center' }}
          >
            <Text style={{ fontSize: 14, color: '#64748b' }}>
              {isRegister ? 'Already have an account? ' : "Don't have an account? "}
              <Text style={{ color: PRIMARY, fontWeight: '700' }}>
                {isRegister ? 'Sign In' : 'Register'}
              </Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
