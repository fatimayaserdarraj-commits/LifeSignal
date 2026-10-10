import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { ReactNode } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useI18n } from '@/lib/i18n';
import { colors, space } from '@/theme';

import { GlowLogo } from './animated';
import { LangToggle } from './lang-toggle';
import { AppText, GlassCard, IconButton, IconName, PressableScale, Row, ScreenBackground } from './ui';

export function AuthShell({ title, subtitle, children, footer }: { title: string; subtitle: string; children: ReactNode; footer: ReactNode }) {
  const insets = useSafeAreaInsets();
  const { isRTL } = useI18n();
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScreenBackground />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingTop: insets.top + space.sm, paddingBottom: insets.bottom + space.xl, paddingHorizontal: space.xl, gap: space.lg }}>
          <Row justify="space-between">
            <IconButton icon={isRTL ? 'chevron-forward' : 'chevron-back'} onPress={() => (router.canGoBack() ? router.back() : router.replace('/welcome'))} />
            <LangToggle />
          </Row>
          <Animated.View entering={FadeInDown.duration(600)} style={{ alignItems: 'center' }}>
            <GlowLogo size={70} />
            <AppText variant="title" center>
              {title}
            </AppText>
            <AppText variant="caption" center style={{ marginTop: 6 }}>
              {subtitle}
            </AppText>
          </Animated.View>
          <Animated.View entering={FadeInDown.delay(150).duration(600)}>
            <GlassCard>
              <View style={{ gap: space.lg }}>{children}</View>
            </GlassCard>
          </Animated.View>
          <Animated.View entering={FadeInDown.delay(300).duration(600)}>
            <SocialButtons />
          </Animated.View>
          <Animated.View entering={FadeInDown.delay(400).duration(600)}>{footer}</Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const PROVIDERS: { name: string; icon: IconName; color: string }[] = [
  { name: 'Google', icon: 'logo-google', color: '#EA4335' },
  { name: 'Apple', icon: 'logo-apple', color: '#FFFFFF' },
  { name: 'Facebook', icon: 'logo-facebook', color: '#1877F2' },
];

function SocialButtons() {
  const { t } = useI18n();
  return (
    <View style={{ gap: space.md }}>
      <Row gap={space.md}>
        <View style={styles.line} />
        <AppText variant="caption">{t('orContinueWith')}</AppText>
        <View style={styles.line} />
      </Row>
      <Row gap={space.md} justify="center">
        {PROVIDERS.map((p) => (
          <PressableScale
            key={p.name}
            style={styles.social}
            accessibilityLabel={p.name}
            onPress={() => Alert.alert(t('socialTitle'), t('socialBody', { provider: p.name }))}>
            <Ionicons name={p.icon} size={24} color={p.color} />
          </PressableScale>
        ))}
      </Row>
    </View>
  );
}

const styles = StyleSheet.create({
  line: { flex: 1, height: 1, backgroundColor: colors.border },
  social: {
    width: 64,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
