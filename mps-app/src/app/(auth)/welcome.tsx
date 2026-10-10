import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeInUp, FadeOut } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FloatingLeaves, GlowLogo } from '@/components/animated';
import { LangToggle } from '@/components/lang-toggle';
import { AppText, GhostButton, GradientButton, Row, ScreenBackground } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { useI18n } from '@/lib/i18n';
import { TKey } from '@/lib/translations';
import { colors, space } from '@/theme';

const FEATURES: { emoji: string; key: TKey }[] = [
  { emoji: '📷', key: 'identify' },
  { emoji: '🩺', key: 'diagnose' },
  { emoji: '📚', key: 'guides' },
  { emoji: '⏰', key: 'reminders' },
  { emoji: '🗓️', key: 'seasons' },
  { emoji: '🏪', key: 'shops' },
];

export default function Welcome() {
  const { t } = useI18n();
  const { continueAsGuest, user } = useAuth();
  const insets = useSafeAreaInsets();
  const [feature, setFeature] = useState(0);

  // Cycle through feature highlights.
  useEffect(() => {
    const id = setInterval(() => setFeature((f) => (f + 1) % FEATURES.length), 2200);
    return () => clearInterval(id);
  }, []);

  const f = FEATURES[feature];

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScreenBackground />
      <FloatingLeaves />
      <View style={{ flex: 1, paddingTop: insets.top + space.md, paddingBottom: insets.bottom + space.lg, paddingHorizontal: space.xl }}>
        <Row justify="flex-end">
          <LangToggle />
        </Row>

        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Animated.View entering={FadeIn.duration(900)}>
            <GlowLogo size={110} />
          </Animated.View>
          <Animated.View entering={FadeInDown.delay(250).duration(700)} style={{ marginTop: space.lg, alignSelf: 'stretch' }}>
            <AppText variant="label" center color={colors.lime}>
              {t('appName')}
            </AppText>
            <AppText variant="hero" center style={{ marginTop: space.sm }}>
              {t('welcomeTitle')}
            </AppText>
            <AppText variant="caption" center style={{ marginTop: space.md, fontSize: 15 }}>
              {t('welcomeBody')}
            </AppText>
          </Animated.View>

          <View style={styles.featureSlot}>
            <Animated.View key={feature} entering={FadeInUp.springify().damping(14)} exiting={FadeOut.duration(200)} style={styles.feature}>
              <AppText style={{ fontSize: 22 }}>{f.emoji}</AppText>
              <AppText variant="h2">{t(f.key)}</AppText>
            </Animated.View>
          </View>
          <Row gap={6} justify="center">
            {FEATURES.map((_, i) => (
              <View key={i} style={[styles.dot, i === feature && styles.dotActive]} />
            ))}
          </Row>
        </View>

        <Animated.View entering={FadeInUp.delay(450).duration(700)} style={{ gap: space.md }}>
          <GradientButton title={t('getStarted')} icon="sparkles" onPress={() => router.push('/register')} />
          <GhostButton title={t('haveAccount')} onPress={() => router.push('/login')} />
          {!user && (
            <GhostButton
              title={t('exploreGuest')}
              icon="compass-outline"
              style={{ borderWidth: 0, backgroundColor: 'transparent' }}
              onPress={async () => {
                await continueAsGuest();
                router.replace('/(tabs)');
              }}
            />
          )}
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  featureSlot: { height: 64, marginTop: space.xl, justifyContent: 'center' },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: 'rgba(61,220,132,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(61,220,132,0.35)',
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.2)' },
  dotActive: { width: 20, backgroundColor: colors.primary },
});
