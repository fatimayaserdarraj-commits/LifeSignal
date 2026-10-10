import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ComponentProps, ReactNode, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  PressableProps,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import Animated, {
  Easing,
  FadeInDown,
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useI18n } from '@/lib/i18n';
import { colors, font, GradientName, gradients, radius, shadow, space } from '@/theme';

export type IconName = ComponentProps<typeof Ionicons>['name'];

/* ---------------------------------------------------------------- text */

type Variant = 'hero' | 'title' | 'h2' | 'body' | 'caption' | 'label';
const variantStyle: Record<Variant, TextStyle> = {
  hero: { fontSize: font.sizes.hero, fontWeight: '800', letterSpacing: -0.8, lineHeight: 40 },
  title: { fontSize: font.sizes.xxl, fontWeight: '800', letterSpacing: -0.5 },
  h2: { fontSize: font.sizes.lg, fontWeight: '700' },
  body: { fontSize: font.sizes.md, lineHeight: 22 },
  caption: { fontSize: font.sizes.sm, color: colors.textDim, lineHeight: 19 },
  label: { fontSize: font.sizes.xs, fontWeight: '700', letterSpacing: 1.2, textTransform: 'uppercase', color: colors.textFaint },
};

export function AppText({
  variant = 'body',
  color,
  center,
  style,
  children,
  numberOfLines,
}: {
  variant?: Variant;
  color?: string;
  center?: boolean;
  style?: StyleProp<TextStyle>;
  children: ReactNode;
  numberOfLines?: number;
}) {
  const { isRTL } = useI18n();
  return (
    <Text
      numberOfLines={numberOfLines}
      style={[
        { color: colors.text, fontFamily: font.display, writingDirection: isRTL ? 'rtl' : 'ltr', textAlign: center ? 'center' : isRTL ? 'right' : 'left' },
        variantStyle[variant],
        color ? { color } : null,
        style,
      ]}>
      {children}
    </Text>
  );
}

/* ---------------------------------------------------------------- layout */

/** A horizontal row that flips for right-to-left languages. */
export function Row({
  children,
  gap = space.sm,
  align = 'center',
  justify,
  wrap,
  style,
}: {
  children: ReactNode;
  gap?: number;
  align?: ViewStyle['alignItems'];
  justify?: ViewStyle['justifyContent'];
  wrap?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const { isRTL } = useI18n();
  return (
    <View style={[{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: align, justifyContent: justify, gap, flexWrap: wrap ? 'wrap' : 'nowrap' }, style]}>
      {children}
    </View>
  );
}

/** Animated glowing orbs that drift slowly behind content. */
function Orb({ size, color, x, y, delay }: { size: number; color: string; x: number; y: number; delay: number }) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withDelay(delay, withRepeat(withTiming(1, { duration: 9000, easing: Easing.inOut(Easing.sin) }), -1, true));
  }, [t, delay]);
  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(t.value, [0, 1], [-20, 30]) },
      { translateY: interpolate(t.value, [0, 1], [0, 40]) },
      { scale: interpolate(t.value, [0, 1], [1, 1.2]) },
    ],
    opacity: interpolate(t.value, [0, 1], [0.35, 0.6]),
  }));
  return (
    <Animated.View
      pointerEvents="none"
      style={[{ position: 'absolute', left: x, top: y, width: size, height: size, borderRadius: size / 2, backgroundColor: color }, style]}
    />
  );
}

export function ScreenBackground() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient colors={gradients.screen} style={StyleSheet.absoluteFill} />
      <Orb size={260} color="rgba(61,220,132,0.18)" x={-80} y={-60} delay={0} />
      <Orb size={200} color="rgba(198,244,50,0.10)" x={220} y={180} delay={1500} />
      <Orb size={240} color="rgba(91,192,255,0.10)" x={-40} y={520} delay={3000} />
    </View>
  );
}

export const TAB_BAR_SPACE = 110;

export function Screen({
  children,
  scroll = true,
  padded = true,
  tabBar = false,
  header,
}: {
  children: ReactNode;
  scroll?: boolean;
  padded?: boolean;
  tabBar?: boolean;
  header?: ReactNode;
}) {
  const insets = useSafeAreaInsets();
  const pad = padded ? space.lg : 0;
  const content = scroll ? (
    <ScrollView
      contentContainerStyle={{ padding: pad, paddingBottom: (tabBar ? TAB_BAR_SPACE : space.xxl) + insets.bottom, gap: space.lg }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled">
      {children}
    </ScrollView>
  ) : (
    <View style={{ flex: 1, padding: pad, paddingBottom: tabBar ? 0 : insets.bottom }}>{children}</View>
  );
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScreenBackground />
      <View style={{ height: insets.top }} />
      {header}
      {content}
    </View>
  );
}

export function Header({ title, subtitle, back = true, right }: { title: string; subtitle?: string; back?: boolean; right?: ReactNode }) {
  const { isRTL } = useI18n();
  return (
    <Animated.View entering={FadeInDown.duration(500)} style={{ paddingHorizontal: space.lg, paddingTop: space.sm, paddingBottom: space.xs }}>
      <Row gap={space.md}>
        {back && (
          <PressableScale onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} style={styles.iconBtn}>
            <Ionicons name={isRTL ? 'chevron-forward' : 'chevron-back'} size={22} color={colors.text} />
          </PressableScale>
        )}
        <View style={{ flex: 1 }}>
          <AppText variant="title" numberOfLines={1}>
            {title}
          </AppText>
          {subtitle ? <AppText variant="caption">{subtitle}</AppText> : null}
        </View>
        {right}
      </Row>
    </Animated.View>
  );
}

/* ---------------------------------------------------------------- interaction */

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function PressableScale({
  children,
  style,
  onPress,
  haptic = true,
  scaleTo = 0.95,
  disabled,
  ...rest
}: Omit<PressableProps, 'style'> & { style?: StyleProp<ViewStyle>; haptic?: boolean; scaleTo?: number; children: ReactNode }) {
  const s = useSharedValue(1);
  const anim = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));
  return (
    <AnimatedPressable
      {...rest}
      disabled={disabled}
      onPressIn={() => s.set(withSpring(scaleTo, { damping: 15, stiffness: 300 }))}
      onPressOut={() => s.set(withSpring(1, { damping: 12, stiffness: 250 }))}
      onPress={(e) => {
        if (haptic && Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress?.(e);
      }}
      style={[style, anim, disabled ? { opacity: 0.5 } : null]}>
      {children}
    </AnimatedPressable>
  );
}

export function GradientButton({
  title,
  onPress,
  icon,
  gradient = 'primary',
  loading,
  disabled,
  small,
  style,
}: {
  title: string;
  onPress?: () => void;
  icon?: IconName;
  gradient?: GradientName;
  loading?: boolean;
  disabled?: boolean;
  small?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  // A soft highlight sweeps across the button periodically.
  const shine = useSharedValue(0);
  useEffect(() => {
    shine.value = withRepeat(withSequence(withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.quad) }), withDelay(2200, withTiming(0, { duration: 0 }))), -1);
  }, [shine]);
  const shineStyle = useAnimatedStyle(() => ({ transform: [{ translateX: interpolate(shine.value, [0, 1], [-160, 420]) }, { rotate: '20deg' }] }));
  const dark = gradient === 'lime' || gradient === 'sun' || gradient === 'mint' || gradient === 'primary';
  const fg = dark ? '#05210F' : '#fff';
  return (
    <PressableScale onPress={onPress} disabled={disabled || loading} style={[{ borderRadius: radius.pill, ...shadow }, style]}>
      <LinearGradient
        colors={gradients[gradient]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.btn, small && { paddingVertical: 10, paddingHorizontal: 16 }]}>
        <Animated.View pointerEvents="none" style={[styles.shine, shineStyle]} />
        {loading ? (
          <ActivityIndicator color={fg} />
        ) : (
          <Row gap={space.sm} justify="center">
            {icon && <Ionicons name={icon} size={small ? 16 : 20} color={fg} />}
            <Text style={{ color: fg, fontWeight: '800', fontSize: small ? font.sizes.sm : font.sizes.md }}>{title}</Text>
          </Row>
        )}
      </LinearGradient>
    </PressableScale>
  );
}

export function GhostButton({ title, onPress, icon, style }: { title: string; onPress?: () => void; icon?: IconName; style?: StyleProp<ViewStyle> }) {
  return (
    <PressableScale onPress={onPress} style={[styles.ghost, style]}>
      <Row gap={space.sm} justify="center">
        {icon && <Ionicons name={icon} size={18} color={colors.text} />}
        <Text style={{ color: colors.text, fontWeight: '700', fontSize: font.sizes.md }}>{title}</Text>
      </Row>
    </PressableScale>
  );
}

export function IconButton({ icon, onPress, color = colors.text, style }: { icon: IconName; onPress?: () => void; color?: string; style?: StyleProp<ViewStyle> }) {
  return (
    <PressableScale onPress={onPress} style={[styles.iconBtn, style]}>
      <Ionicons name={icon} size={20} color={color} />
    </PressableScale>
  );
}

/* ---------------------------------------------------------------- surfaces */

export function GlassCard({ children, style, padding = space.lg }: { children: ReactNode; style?: StyleProp<ViewStyle>; padding?: number }) {
  return (
    <View style={[styles.card, style]}>
      <LinearGradient colors={gradients.glass} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
      <View style={{ padding }}>{children}</View>
    </View>
  );
}

/** Staggered entrance wrapper. */
export function Appear({ children, index = 0, style }: { children: ReactNode; index?: number; style?: StyleProp<ViewStyle> }) {
  return (
    <Animated.View entering={FadeInDown.delay(80 * index).duration(500).springify().damping(16)} style={style}>
      {children}
    </Animated.View>
  );
}

export function IconBubble({
  emoji,
  icon,
  gradient = 'primary',
  size = 48,
}: {
  emoji?: string;
  icon?: IconName;
  gradient?: GradientName;
  size?: number;
}) {
  return (
    <LinearGradient
      colors={gradients[gradient]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ width: size, height: size, borderRadius: size * 0.34, alignItems: 'center', justifyContent: 'center' }}>
      {emoji ? <Text style={{ fontSize: size * 0.5 }}>{emoji}</Text> : <Ionicons name={icon ?? 'leaf'} size={size * 0.5} color="#05210F" />}
    </LinearGradient>
  );
}

export function SectionTitle({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <Row justify="space-between">
      <AppText variant="h2">{title}</AppText>
      {action ? (
        <Pressable onPress={onAction} hitSlop={10}>
          <Text style={{ color: colors.primary, fontWeight: '700' }}>{action}</Text>
        </Pressable>
      ) : null}
    </Row>
  );
}

export function Badge({ text, color = colors.primary }: { text: string; color?: string }) {
  return (
    <View style={{ backgroundColor: `${color}22`, borderColor: `${color}55`, borderWidth: 1, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 3, alignSelf: 'flex-start' }}>
      <Text style={{ color, fontSize: font.sizes.xs, fontWeight: '800' }}>{text}</Text>
    </View>
  );
}

export function ProgressBar({ value, color = colors.primary, height = 8 }: { value: number; color?: string; height?: number }) {
  const w = useSharedValue(0);
  useEffect(() => {
    w.value = withTiming(Math.max(0, Math.min(1, value)), { duration: 900, easing: Easing.out(Easing.cubic) });
  }, [value, w]);
  const style = useAnimatedStyle(() => ({ width: `${w.value * 100}%` }));
  return (
    <View style={{ height, borderRadius: height, backgroundColor: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
      <Animated.View style={[{ height, borderRadius: height, backgroundColor: color }, style]} />
    </View>
  );
}

export function EmptyState({ emoji, text }: { emoji: string; text: string }) {
  const y = useSharedValue(0);
  useEffect(() => {
    y.value = withRepeat(withSequence(withTiming(-10, { duration: 900 }), withTiming(0, { duration: 900 })), -1);
  }, [y]);
  const style = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }));
  return (
    <GlassCard style={{ alignItems: 'center' }}>
      <Animated.Text style={[{ fontSize: 54, textAlign: 'center' }, style]}>{emoji}</Animated.Text>
      <AppText variant="caption" center style={{ marginTop: space.md }}>
        {text}
      </AppText>
    </GlassCard>
  );
}

/* ---------------------------------------------------------------- inputs */

export function Input({
  label,
  icon,
  error,
  secure,
  style,
  ...props
}: TextInputProps & { label?: string; icon?: IconName; error?: string; secure?: boolean }) {
  const { isRTL } = useI18n();
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(!!secure);
  const f = useSharedValue(0);
  useEffect(() => {
    f.value = withTiming(focused ? 1 : 0, { duration: 220 });
  }, [focused, f]);
  const box = useAnimatedStyle(() => ({
    borderColor: error ? colors.danger : interpolateColor(f.value, [0, 1], [colors.border, colors.primary]),
    backgroundColor: interpolateColor(f.value, [0, 1], ['rgba(255,255,255,0.05)', 'rgba(61,220,132,0.08)']),
  }));
  return (
    <View style={{ gap: 6 }}>
      {label ? <AppText variant="label">{label}</AppText> : null}
      <Animated.View style={[styles.input, box]}>
        <Row gap={space.sm}>
          {icon && <Ionicons name={icon} size={18} color={focused ? colors.primary : colors.textFaint} />}
          <TextInput
            placeholderTextColor={colors.textFaint}
            selectionColor={colors.primary}
            {...props}
            secureTextEntry={hidden}
            onFocus={(e) => {
              setFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setFocused(false);
              props.onBlur?.(e);
            }}
            style={[{ flex: 1, color: colors.text, fontSize: font.sizes.md, paddingVertical: 14, textAlign: isRTL ? 'right' : 'left' }, style]}
          />
          {secure && (
            <Pressable onPress={() => setHidden((h) => !h)} hitSlop={10}>
              <Ionicons name={hidden ? 'eye-off-outline' : 'eye-outline'} size={18} color={colors.textFaint} />
            </Pressable>
          )}
        </Row>
      </Animated.View>
      {error ? (
        <Animated.Text entering={FadeInDown.duration(250)} style={{ color: colors.danger, fontSize: font.sizes.sm, textAlign: isRTL ? 'right' : 'left' }}>
          {error}
        </Animated.Text>
      ) : null}
    </View>
  );
}

export function Chip({ label, active, onPress, emoji }: { label: string; active?: boolean; onPress?: () => void; emoji?: string }) {
  const a = useSharedValue(active ? 1 : 0);
  useEffect(() => {
    a.value = withTiming(active ? 1 : 0, { duration: 220 });
  }, [active, a]);
  const style = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(a.value, [0, 1], ['rgba(255,255,255,0.06)', colors.primary]),
    borderColor: interpolateColor(a.value, [0, 1], [colors.border, colors.primary]),
  }));
  return (
    <PressableScale onPress={onPress}>
      <Animated.View style={[styles.chip, style]}>
        <Text style={{ color: active ? '#05210F' : colors.text, fontWeight: '700', fontSize: font.sizes.sm }}>
          {emoji ? `${emoji}  ` : ''}
          {label}
        </Text>
      </Animated.View>
    </PressableScale>
  );
}

/** Segmented control with a sliding, springy thumb. */
export function Segmented<T extends string>({ options, value, onChange }: { options: { id: T; label: string; icon?: IconName }[]; value: T; onChange: (v: T) => void }) {
  const { isRTL } = useI18n();
  const [width, setWidth] = useState(0);
  const index = Math.max(0, options.findIndex((o) => o.id === value));
  const x = useSharedValue(index);
  useEffect(() => {
    x.value = withSpring(index, { damping: 18, stiffness: 180 });
  }, [index, x]);
  const seg = width / options.length;
  const thumb = useAnimatedStyle(() => ({ transform: [{ translateX: (isRTL ? -1 : 1) * x.value * seg }] }));
  return (
    <View style={styles.segment} onLayout={(e) => setWidth(e.nativeEvent.layout.width - 8)}>
      {width > 0 && (
        <Animated.View style={[{ position: 'absolute', top: 4, bottom: 4, width: seg, [isRTL ? 'right' : 'left']: 4, borderRadius: radius.pill, overflow: 'hidden' }, thumb]}>
          <LinearGradient colors={gradients.primary} style={StyleSheet.absoluteFill} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} />
        </Animated.View>
      )}
      <Row gap={0}>
        {options.map((o) => {
          const active = o.id === value;
          return (
            <Pressable key={o.id} onPress={() => onChange(o.id)} style={{ flex: 1, paddingVertical: 12, alignItems: 'center' }}>
              <Row gap={6}>
                {o.icon && <Ionicons name={o.icon} size={16} color={active ? '#05210F' : colors.textDim} />}
                <Text style={{ color: active ? '#05210F' : colors.textDim, fontWeight: '800' }}>{o.label}</Text>
              </Row>
            </Pressable>
          );
        })}
      </Row>
    </View>
  );
}

const styles = StyleSheet.create({
  btn: { paddingVertical: 16, paddingHorizontal: 22, borderRadius: radius.pill, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  shine: { position: 'absolute', top: -20, bottom: -20, width: 50, backgroundColor: 'rgba(255,255,255,0.35)' },
  ghost: { paddingVertical: 15, paddingHorizontal: 22, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  iconBtn: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  card: { borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, overflow: 'hidden', backgroundColor: 'rgba(10,30,20,0.55)' },
  input: { borderWidth: 1.5, borderRadius: radius.md, paddingHorizontal: space.md },
  chip: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: radius.pill, borderWidth: 1 },
  segment: { padding: 4, borderRadius: radius.pill, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
});
