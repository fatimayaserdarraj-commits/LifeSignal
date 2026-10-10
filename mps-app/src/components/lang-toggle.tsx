import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { useI18n } from '@/lib/i18n';
import { colors } from '@/theme';

/** Compact EN / ع switch with a sliding knob. */
export function LangToggle() {
  const { lang, setLang } = useI18n();
  const x = useSharedValue(lang === 'ar' ? 1 : 0);
  useEffect(() => {
    x.value = withSpring(lang === 'ar' ? 1 : 0, { damping: 15 });
  }, [lang, x]);
  const knob = useAnimatedStyle(() => ({ transform: [{ translateX: x.value * 44 }] }));
  return (
    <Pressable onPress={() => setLang(lang === 'ar' ? 'en' : 'ar')} style={styles.wrap} accessibilityLabel="Language">
      <Animated.View style={[styles.knob, knob]} />
      <View style={styles.row}>
        <Text style={[styles.txt, lang === 'en' && styles.active]}>EN</Text>
        <Text style={[styles.txt, lang === 'ar' && styles.active]}>ع</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { width: 96, height: 40, borderRadius: 20, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, padding: 4 },
  knob: { position: 'absolute', top: 4, left: 4, width: 44, height: 30, borderRadius: 15, backgroundColor: colors.primary },
  row: { flex: 1, flexDirection: 'row' },
  txt: { flex: 1, textAlign: 'center', lineHeight: 30, fontWeight: '800', color: colors.textDim },
  active: { color: '#05210F' },
});
