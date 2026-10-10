import { LinearGradient } from 'expo-linear-gradient';
import { ReactNode, useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { colors, radius } from '@/theme';

/** A single emoji leaf that floats, sways and spins. */
function Leaf({ emoji, x, y, size, delay, duration }: { emoji: string; x: `${number}%`; y: `${number}%`; size: number; delay: number; duration: number }) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withDelay(delay, withRepeat(withTiming(1, { duration, easing: Easing.inOut(Easing.sin) }), -1, true));
  }, [t, delay, duration]);
  const style = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(t.value, [0, 1], [0, -26]) },
      { translateX: interpolate(t.value, [0, 0.5, 1], [0, 12, 0]) },
      { rotate: `${interpolate(t.value, [0, 1], [-14, 18])}deg` },
    ],
    opacity: interpolate(t.value, [0, 0.5, 1], [0.55, 1, 0.55]),
  }));
  return <Animated.Text style={[{ position: 'absolute', left: x, top: y, fontSize: size }, style]}>{emoji}</Animated.Text>;
}

export function FloatingLeaves() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Leaf emoji="🍃" x="8%" y="10%" size={30} delay={0} duration={3200} />
      <Leaf emoji="🌿" x="78%" y="7%" size={36} delay={400} duration={3800} />
      <Leaf emoji="🌱" x="62%" y="30%" size={24} delay={900} duration={3000} />
      <Leaf emoji="🌸" x="14%" y="38%" size={22} delay={1300} duration={4200} />
      <Leaf emoji="🍀" x="85%" y="46%" size={26} delay={700} duration={3500} />
    </View>
  );
}

/** Logo mark: a glowing orb with a breathing halo. */
export function GlowLogo({ size = 120 }: { size?: number }) {
  const p = useSharedValue(0);
  const spin = useSharedValue(0);
  useEffect(() => {
    p.value = withRepeat(withTiming(1, { duration: 2200, easing: Easing.inOut(Easing.quad) }), -1, true);
    spin.value = withRepeat(withTiming(1, { duration: 14000, easing: Easing.linear }), -1);
  }, [p, spin]);
  const halo = useAnimatedStyle(() => ({ transform: [{ scale: interpolate(p.value, [0, 1], [1, 1.25]) }], opacity: interpolate(p.value, [0, 1], [0.6, 0.15]) }));
  const ring = useAnimatedStyle(() => ({ transform: [{ rotate: `${spin.value * 360}deg` }] }));
  return (
    <View style={{ width: size * 1.5, height: size * 1.5, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View style={[{ position: 'absolute', width: size * 1.3, height: size * 1.3, borderRadius: size, backgroundColor: colors.primary }, halo]} />
      <Animated.View
        style={[
          { position: 'absolute', width: size * 1.18, height: size * 1.18, borderRadius: size, borderWidth: 2, borderColor: colors.lime, borderStyle: 'dashed' },
          ring,
        ]}
      />
      <LinearGradient colors={['#C6F432', '#3DDC84', '#14A55B']} style={{ width: size, height: size, borderRadius: size / 2, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: size * 0.5 }}>🌿</Text>
      </LinearGradient>
    </View>
  );
}

/** Three bouncing dots, shown while the assistant is "typing". */
export function TypingDots() {
  return (
    <View style={{ flexDirection: 'row', gap: 5, paddingVertical: 6 }}>
      {[0, 1, 2].map((i) => (
        <Dot key={i} delay={i * 160} />
      ))}
    </View>
  );
}

function Dot({ delay }: { delay: number }) {
  const y = useSharedValue(0);
  useEffect(() => {
    y.value = withDelay(delay, withRepeat(withSequence(withTiming(-6, { duration: 280 }), withTiming(0, { duration: 280 })), -1));
  }, [y, delay]);
  const style = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }], opacity: interpolate(y.value, [-6, 0], [1, 0.4]) }));
  return <Animated.View style={[{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary }, style]} />;
}

/** Viewfinder with animated corners and a sweeping laser line. */
export function ScanFrame({ children, active, height = 300 }: { children?: ReactNode; active: boolean; height?: number }) {
  const line = useSharedValue(0);
  const pulse = useSharedValue(0);
  useEffect(() => {
    line.value = active ? withRepeat(withTiming(1, { duration: 1600, easing: Easing.inOut(Easing.quad) }), -1, true) : withTiming(0);
    pulse.value = withRepeat(withTiming(1, { duration: 1400 }), -1, true);
  }, [active, line, pulse]);
  const lineStyle = useAnimatedStyle(() => ({ transform: [{ translateY: line.value * (height - 6) }], opacity: active ? 1 : 0 }));
  const corner = useAnimatedStyle(() => ({ opacity: interpolate(pulse.value, [0, 1], [0.5, 1]) }));
  const c = { position: 'absolute' as const, width: 34, height: 34, borderColor: colors.lime };
  return (
    <View style={{ height, borderRadius: radius.xl, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: colors.border }}>
      {children}
      <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, corner]}>
        <View style={[c, { top: 14, left: 14, borderTopWidth: 4, borderLeftWidth: 4, borderTopLeftRadius: 14 }]} />
        <View style={[c, { top: 14, right: 14, borderTopWidth: 4, borderRightWidth: 4, borderTopRightRadius: 14 }]} />
        <View style={[c, { bottom: 14, left: 14, borderBottomWidth: 4, borderLeftWidth: 4, borderBottomLeftRadius: 14 }]} />
        <View style={[c, { bottom: 14, right: 14, borderBottomWidth: 4, borderRightWidth: 4, borderBottomRightRadius: 14 }]} />
      </Animated.View>
      <Animated.View pointerEvents="none" style={[{ position: 'absolute', left: 0, right: 0, top: 0, height: 6 }, lineStyle]}>
        <LinearGradient colors={['transparent', colors.lime, 'transparent']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ flex: 1 }} />
      </Animated.View>
    </View>
  );
}

/** Concentric pulsing rings behind a call-to-action. */
export function PulseRings({ size = 90, color = colors.primary }: { size?: number; color?: string }) {
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center' }]}>
      {[0, 1, 2].map((i) => (
        <Ring key={i} size={size} color={color} delay={i * 600} />
      ))}
    </View>
  );
}

function Ring({ size, color, delay }: { size: number; color: string; delay: number }) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withDelay(delay, withRepeat(withTiming(1, { duration: 1800, easing: Easing.out(Easing.quad) }), -1));
  }, [t, delay]);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: interpolate(t.value, [0, 1], [0.8, 2]) }], opacity: interpolate(t.value, [0, 1], [0.5, 0]) }));
  return <Animated.View style={[{ position: 'absolute', width: size, height: size, borderRadius: size / 2, borderWidth: 2, borderColor: color }, style]} />;
}

/** Animated circular-ish confidence meter (arc approximated by a filling ring). */
export function ConfidenceRing({ value, size = 76, color = colors.primary }: { value: number; size?: number; color?: string }) {
  const v = useSharedValue(0);
  useEffect(() => {
    v.value = withTiming(value, { duration: 1200, easing: Easing.out(Easing.cubic) });
  }, [value, v]);
  const fill = useAnimatedStyle(() => ({ height: `${v.value * 100}%` }));
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, borderWidth: 3, borderColor: color, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'flex-end' }}>
      <Animated.View style={[{ backgroundColor: `${color}55` }, fill]} />
      <View style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center' }]}>
        <Text style={{ color: colors.text, fontWeight: '900', fontSize: size * 0.24 }}>{Math.round(value * 100)}%</Text>
      </View>
    </View>
  );
}
