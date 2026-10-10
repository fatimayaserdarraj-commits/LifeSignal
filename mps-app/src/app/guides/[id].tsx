import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Platform, Text, View } from 'react-native';
import Animated, {
  BounceIn,
  Easing,
  FadeIn,
  SlideInLeft,
  SlideInRight,
  SlideOutLeft,
  SlideOutRight,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { AppText, GhostButton, GlassCard, GradientButton, Header, PressableScale, ProgressBar, Row, Screen } from '@/components/ui';
import { guideById } from '@/data/guides';
import { useData } from '@/lib/data';
import { useI18n } from '@/lib/i18n';
import { colors, gradients, radius, space } from '@/theme';

export default function Lesson() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, l, isRTL } = useI18n();
  const { setGuideProgress } = useData();
  const guide = guideById(id);
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState<1 | -1>(1);
  const [answer, setAnswer] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const shake = useSharedValue(0);
  const shakeStyle = useAnimatedStyle(() => ({ transform: [{ translateX: shake.value }] }));

  if (!guide) return <Screen header={<Header title="" />}>{null}</Screen>;
  const s = guide.steps[step];
  const quizOk = !s.quiz || answer === s.quiz.answer;
  const last = step === guide.steps.length - 1;

  // Forward motion enters from the reading direction's end.
  const forward = (dir === 1) !== isRTL;
  const entering = (forward ? SlideInRight : SlideInLeft).duration(380).easing(Easing.out(Easing.cubic));
  const exiting = (forward ? SlideOutLeft : SlideOutRight).duration(280);

  function go(delta: 1 | -1) {
    setDir(delta);
    setAnswer(null);
    if (delta === 1) setGuideProgress(guide!.id, step + 1);
    if (delta === 1 && last) return setDone(true);
    setStep((v) => v + delta);
  }

  function choose(i: number) {
    setAnswer(i);
    if (Platform.OS !== 'web') Haptics.notificationAsync(i === s.quiz!.answer ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error);
    if (i !== s.quiz!.answer) shake.set(withSequence(withTiming(-10, { duration: 50 }), withRepeat(withTiming(10, { duration: 80 }), 4, true), withTiming(0, { duration: 50 })));
  }

  if (done) return <Complete title={l(guide.title)} emoji={guide.emoji} />;

  return (
    <Screen header={<Header title={l(guide.title)} subtitle={`${t('step')} ${step + 1} / ${guide.steps.length}`} />}>
      <ProgressBar value={(step + 1) / guide.steps.length} color={colors.lime} />
      <View style={{ overflow: 'hidden', minHeight: 380 }}>
        <Animated.View key={step} entering={entering} exiting={exiting} style={{ gap: space.lg }}>
          <LinearGradient colors={gradients[guide.gradient]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ height: 180, borderRadius: radius.xl, alignItems: 'center', justifyContent: 'center' }}>
            <Animated.Text entering={BounceIn.delay(200)} style={{ fontSize: 90 }}>
              {s.emoji}
            </Animated.Text>
          </LinearGradient>
          <AppText variant="label" color={colors.lime}>
            {t('step')} {step + 1}
          </AppText>
          <AppText variant="title">{l(s.title)}</AppText>
          <AppText color={colors.textDim} style={{ fontSize: 16, lineHeight: 25 }}>
            {l(s.body)}
          </AppText>

          {s.quiz && (
            <Animated.View style={shakeStyle}>
              <GlassCard>
                <Row gap={space.sm}>
                  <Ionicons name="help-circle" size={20} color={colors.sun} />
                  <AppText variant="h2">{t('quickCheck')}</AppText>
                </Row>
                <AppText style={{ marginTop: space.sm }}>{l(s.quiz.question)}</AppText>
                <View style={{ gap: space.sm, marginTop: space.md }}>
                  {s.quiz.options.map((o, i) => {
                    const picked = answer === i;
                    const right = picked && i === s.quiz!.answer;
                    const wrong = picked && !right;
                    return (
                      <PressableScale
                        key={i}
                        onPress={() => choose(i)}
                        style={{
                          padding: 14,
                          borderRadius: radius.md,
                          borderWidth: 1.5,
                          borderColor: right ? colors.primary : wrong ? colors.coral : colors.border,
                          backgroundColor: right ? 'rgba(61,220,132,0.18)' : wrong ? 'rgba(255,122,107,0.15)' : colors.surface,
                        }}>
                        <Row justify="space-between">
                          <AppText>{l(o)}</AppText>
                          {right && <Ionicons name="checkmark-circle" size={20} color={colors.primary} />}
                          {wrong && <Ionicons name="close-circle" size={20} color={colors.coral} />}
                        </Row>
                      </PressableScale>
                    );
                  })}
                </View>
                {answer != null && (
                  <Animated.Text entering={FadeIn} style={{ marginTop: space.md, fontWeight: '800', color: quizOk ? colors.primary : colors.coral, textAlign: 'center' }}>
                    {quizOk ? t('correct') : t('tryAgain')}
                  </Animated.Text>
                )}
              </GlassCard>
            </Animated.View>
          )}
        </Animated.View>
      </View>

      <Row gap={space.md}>
        {step > 0 && <GhostButton title={t('back')} onPress={() => go(-1)} style={{ flex: 1 }} />}
        <GradientButton
          title={last ? t('finish') : t('next')}
          icon={last ? 'trophy' : isRTL ? 'arrow-back' : 'arrow-forward'}
          onPress={() => go(1)}
          disabled={!quizOk}
          style={{ flex: 2 }}
        />
      </Row>
    </Screen>
  );
}

function Burst({ emoji, angle, delay }: { emoji: string; angle: number; delay: number }) {
  const p = useSharedValue(0);
  useEffect(() => {
    p.value = withTiming(1, { duration: 1100 + delay, easing: Easing.out(Easing.cubic) });
  }, [p, delay]);
  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: Math.cos(angle) * 150 * p.value }, { translateY: Math.sin(angle) * 150 * p.value - 40 * p.value }, { rotate: `${p.value * 360}deg` }],
    opacity: 1 - p.value * 0.7,
  }));
  return <Animated.Text style={[{ position: 'absolute', fontSize: 26 }, style]}>{emoji}</Animated.Text>;
}

function Complete({ title, emoji }: { title: string; emoji: string }) {
  const { t } = useI18n();
  const pieces = ['🌿', '🌸', '✨', '🍃', '🌼', '⭐', '🌱', '💚'];
  return (
    <Screen scroll={false}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: space.lg }}>
        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
          {Array.from({ length: 16 }, (_, i) => (
            <Burst key={i} emoji={pieces[i % pieces.length]} angle={(i / 16) * Math.PI * 2} delay={(i % 4) * 120} />
          ))}
          <Animated.View entering={BounceIn.duration(900)}>
            <LinearGradient colors={gradients.lime} style={{ width: 150, height: 150, borderRadius: 75, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 72 }}>🏆</Text>
            </LinearGradient>
          </Animated.View>
        </View>
        <Animated.View entering={FadeIn.delay(500)} style={{ alignItems: 'center', gap: 6 }}>
          <AppText variant="title" center>
            {t('lessonComplete')}
          </AppText>
          <AppText variant="caption" center>
            {emoji} {title}
          </AppText>
        </Animated.View>
        <Animated.View entering={FadeIn.delay(800)} style={{ alignSelf: 'stretch' }}>
          <GradientButton title={t('guides')} icon="library" onPress={() => router.back()} />
        </Animated.View>
      </View>
    </Screen>
  );
}
