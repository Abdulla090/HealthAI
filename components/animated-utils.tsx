/**
 * Premium iOS-style animation utilities
 * Uses Reanimated v4 for butter-smooth 60fps native animations
 */
import React, { useEffect } from 'react';
import { Pressable, ViewStyle, StyleProp } from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  FadeInLeft,
  FadeInRight,
  FadeOut,
  FadeOutDown,
  FadeOutUp,
  SlideInDown,
  SlideInUp,
  SlideOutDown,
  SlideOutUp,
  ZoomIn,
  ZoomOut,
  LinearTransition,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  withSequence,
  withRepeat,
  interpolate,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

// ──────────────────────────────────────────
// iOS-STYLE SPRING CONFIGS
// ──────────────────────────────────────────

/** Apple's default spring (UISpringAnimation) */
export const SPRING_CONFIGS = {
  /** Snappy — buttons, toggles, small interactions */
  snappy: { damping: 15, stiffness: 200, mass: 0.6 },
  /** Default — cards, panels, general movement */
  default: { damping: 18, stiffness: 120, mass: 0.8 },
  /** Gentle — large panels, modals, page transitions */
  gentle: { damping: 20, stiffness: 80, mass: 1 },
  /** Bouncy — playful, attention-grabbing */
  bouncy: { damping: 10, stiffness: 150, mass: 0.5 },
} as const;

// ──────────────────────────────────────────
// ENTERING / EXITING ANIMATION PRESETS
// ──────────────────────────────────────────

/** Stagger delay between list items (ms) */
export const STAGGER_DELAY = 60;

/** Card entering — fade in from below with spring */
export const cardEntering = (index: number = 0) =>
  FadeInDown
    .delay(index * STAGGER_DELAY)
    .duration(450)
    .springify()
    .damping(18)
    .stiffness(120);

/** Card exiting — fade out downward */
export const cardExiting = () =>
  FadeOutDown
    .duration(250);

/** Slide-in from bottom (modals, sheets) */
export const sheetEntering = () =>
  SlideInDown
    .duration(500)
    .springify()
    .damping(20)
    .stiffness(90);

/** Slide-out to bottom */
export const sheetExiting = () =>
  SlideOutDown
    .duration(350);

/** Fade+zoom in (status badges, icons) */
export const popIn = (delay: number = 0) =>
  ZoomIn
    .delay(delay)
    .duration(350)
    .springify()
    .damping(14)
    .stiffness(180);

/** Gentle fade in (text, labels) */
export const fadeIn = (delay: number = 0) =>
  FadeIn
    .delay(delay)
    .duration(400);

/** Fade in from left (headers) */
export const slideFromLeft = (delay: number = 0) =>
  FadeInLeft
    .delay(delay)
    .duration(400)
    .springify()
    .damping(18);

/** Fade in from right */
export const slideFromRight = (delay: number = 0) =>
  FadeInRight
    .delay(delay)
    .duration(400)
    .springify()
    .damping(18);

/** Layout transition for state changes */
export const smoothLayout = LinearTransition
  .springify()
  .damping(18)
  .stiffness(120);

// ──────────────────────────────────────────
// ANIMATED PRESSABLE (iOS-style scale bounce)
// ──────────────────────────────────────────

interface AnimatedPressableProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  scaleDown?: number;
  disabled?: boolean;
  haptic?: boolean;
}

/**
 * iOS-style pressable that scales down on press with spring physics.
 * Includes optional haptic feedback on iOS.
 */
export function AnimatedPressable({
  children,
  onPress,
  style,
  scaleDown = 0.97,
  disabled = false,
  haptic = true,
}: AnimatedPressableProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(scaleDown, SPRING_CONFIGS.snappy);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, SPRING_CONFIGS.snappy);
  };

  const handlePress = () => {
    if (haptic && Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress?.();
  };

  return (
    <Animated.View style={[animatedStyle, style]}>
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        style={{ flex: 1 }}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}

// ──────────────────────────────────────────
// ANIMATED COUNTER (number ticks up/down)
// ──────────────────────────────────────────

interface AnimatedNumberProps {
  value: number;
  style?: any;
}

/**
 * Wraps text so each value change triggers a subtle scale pulse.
 */
export function AnimatedNumber({ value, style }: AnimatedNumberProps) {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withSequence(
      withSpring(1.1, { damping: 12, stiffness: 200 }),
      withSpring(1, { damping: 14, stiffness: 160 })
    );
  }, [value]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.Text style={[style, animStyle]}>
      {typeof value === 'number' ? value.toLocaleString() : value}
    </Animated.Text>
  );
}

// ──────────────────────────────────────────
// ANIMATED PROGRESS BAR
// ──────────────────────────────────────────

interface AnimatedProgressBarProps {
  progress: number; // 0–100
  color: string;
  height?: number;
  delay?: number;
  bgColor?: string;
}

/**
 * Progress bar that animates smoothly to new widths with spring physics.
 */
export function AnimatedProgressBar({
  progress,
  color,
  height = 6,
  delay = 200,
  bgColor = '#f1f5f9',
}: AnimatedProgressBarProps) {
  const width = useSharedValue(0);

  useEffect(() => {
    width.value = withDelay(
      delay,
      withSpring(Math.min(100, progress), {
        damping: 20,
        stiffness: 80,
        mass: 1,
      })
    );
  }, [progress]);

  const barStyle = useAnimatedStyle(() => ({
    width: `${width.value}%`,
    height: '100%',
    backgroundColor: color,
    borderRadius: 99,
  }));

  return (
    <Animated.View style={{ height, backgroundColor: bgColor, borderRadius: 99, overflow: 'hidden' }}>
      <Animated.View style={barStyle} />
    </Animated.View>
  );
}

// ──────────────────────────────────────────
// PULSING DOT (attention indicator)
// ──────────────────────────────────────────

interface PulsingDotProps {
  color: string;
  size?: number;
}

export function PulsingDot({ color, size = 8 }: PulsingDotProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.5, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.4, { duration: 800 }),
        withTiming(1, { duration: 800 })
      ),
      -1,
      true
    );
  }, []);

  const dotStyle = useAnimatedStyle(() => ({
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor: color,
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return <Animated.View style={dotStyle} />;
}

// ──────────────────────────────────────────
// ANIMATED FAB (Floating Action Button)
// ──────────────────────────────────────────

interface AnimatedFABProps {
  children: React.ReactNode;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}

export function AnimatedFAB({ children, onPress, style }: AnimatedFABProps) {
  const scale = useSharedValue(0);
  const rotation = useSharedValue(0);

  useEffect(() => {
    scale.value = withDelay(400, withSpring(1, SPRING_CONFIGS.bouncy));
  }, []);

  const handlePressIn = () => {
    scale.value = withSpring(0.85, SPRING_CONFIGS.snappy);
    rotation.value = withSpring(-15, SPRING_CONFIGS.snappy);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, SPRING_CONFIGS.snappy);
    rotation.value = withSpring(0, SPRING_CONFIGS.snappy);
  };

  const animStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
    ],
  }));

  return (
    <Animated.View style={[animStyle, style]}>
      <Pressable
        onPress={() => {
          if (Platform.OS === 'ios') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          }
          onPress();
        }}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}

// ──────────────────────────────────────────
// SHAKE ANIMATION (error feedback)
// ──────────────────────────────────────────

export function useShakeAnimation() {
  const translateX = useSharedValue(0);

  const shake = () => {
    translateX.value = withSequence(
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

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return { shake, style };
}

// Re-export Animated for convenience
export { default as Animated } from 'react-native-reanimated';
