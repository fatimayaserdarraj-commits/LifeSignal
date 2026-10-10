import Ionicons from '@expo/vector-icons/Ionicons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { useEffect, useState } from 'react';
import { Keyboard, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useI18n } from '@/lib/i18n';
import { TKey } from '@/lib/translations';
import { colors, gradients } from '@/theme';

import { IconName } from './ui';

const TABS: Record<string, { icon: IconName; active: IconName; label: TKey }> = {
  index: { icon: 'home-outline', active: 'home', label: 'tabHome' },
  scan: { icon: 'scan-outline', active: 'scan', label: 'tabScan' },
  assistant: { icon: 'sparkles-outline', active: 'sparkles', label: 'tabAssistant' },
  garden: { icon: 'leaf-outline', active: 'leaf', label: 'tabGarden' },
  community: { icon: 'people-outline', active: 'people', label: 'tabCommunity' },
};

/** Floating glass tab bar with a springy sliding highlight. */
export function TabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { t, isRTL } = useI18n();
  const [width, setWidth] = useState(0);
  const count = state.routes.length;
  const slot = width / count;
  const x = useSharedValue(state.index);
  const [hidden, setHidden] = useState(false);

  // Get out of the way while typing.
  useEffect(() => {
    const show = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow', () => setHidden(true));
    const hide = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide', () => setHidden(false));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  useEffect(() => {
    x.value = withSpring(state.index, { damping: 16, stiffness: 160, mass: 0.8 });
  }, [state.index, x]);

  const pill = useAnimatedStyle(() => ({
    transform: [{ translateX: (isRTL ? -1 : 1) * x.value * slot }],
  }));

  if (hidden) return null;

  return (
    <View pointerEvents="box-none" style={[styles.wrap, { bottom: Math.max(insets.bottom, 12) }]}>
      <View style={styles.bar} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
        {Platform.OS === 'ios' ? (
          <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
        ) : (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: '#08180F' }]} />
        )}
        {width > 0 && (
          <Animated.View style={[styles.pillWrap, { width: slot, [isRTL ? 'right' : 'left']: 0 }, pill]}>
            <LinearGradient colors={gradients.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.pill} />
          </Animated.View>
        )}
        <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
          {state.routes.map((route, i) => {
            const cfg = TABS[route.name];
            if (!cfg) return null;
            const focused = state.index === i;
            return (
              <TabItem
                key={route.key}
                index={i}
                progress={x}
                focused={focused}
                icon={focused ? cfg.active : cfg.icon}
                label={t(cfg.label)}
                onPress={() => {
                  if (Platform.OS !== 'web') Haptics.selectionAsync();
                  const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
                  if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
                }}
              />
            );
          })}
        </View>
      </View>
    </View>
  );
}

function TabItem({
  index,
  progress,
  focused,
  icon,
  label,
  onPress,
}: {
  index: number;
  progress: { value: number };
  focused: boolean;
  icon: IconName;
  label: string;
  onPress: () => void;
}) {
  const style = useAnimatedStyle(() => {
    const d = Math.min(Math.abs(progress.value - index), 1);
    return { transform: [{ scale: interpolate(d, [0, 1], [1.06, 1]) }, { translateY: interpolate(d, [0, 1], [-2, 0]) }] };
  });
  return (
    <Pressable onPress={onPress} style={styles.item} accessibilityRole="tab" accessibilityState={{ selected: focused }} accessibilityLabel={label}>
      <Animated.View style={[{ alignItems: 'center' }, style]}>
        <Ionicons name={icon} size={22} color={focused ? '#05210F' : colors.textDim} />
        <Text numberOfLines={1} style={{ fontSize: 10, marginTop: 2, fontWeight: '800', color: focused ? '#05210F' : colors.textFaint }}>
          {label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 14, right: 14 },
  bar: {
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    paddingVertical: 6,
  },
  pillWrap: { position: 'absolute', top: 6, bottom: 6, paddingHorizontal: 6 },
  pill: { flex: 1, borderRadius: 22 },
  item: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 8 },
});
