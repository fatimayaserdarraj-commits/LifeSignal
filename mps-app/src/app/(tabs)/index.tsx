import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { Href, router } from 'expo-router';
import { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

import { LangToggle } from '@/components/lang-toggle';
import { ReminderRow } from '@/components/reminder-row';
import { AppText, Appear, GlassCard, GradientButton, IconBubble, PressableScale, Row, Screen, SectionTitle } from '@/components/ui';
import { PLANTS, plantById } from '@/data/plants';
import { currentSeason, TIPS } from '@/data/seasons';
import { useAuth } from '@/lib/auth';
import { daysUntil, useData } from '@/lib/data';
import { useI18n } from '@/lib/i18n';
import { TKey } from '@/lib/translations';
import { colors, GradientName, gradients, radius, space } from '@/theme';

const ACTIONS: { key: TKey; emoji: string; gradient: GradientName; href: Href }[] = [
  { key: 'identify', emoji: '📷', gradient: 'primary', href: '/scan' },
  { key: 'diagnose', emoji: '🩺', gradient: 'coral', href: { pathname: '/scan', params: { mode: 'diagnose' } } },
  { key: 'guides', emoji: '📚', gradient: 'violet', href: '/guides' },
  { key: 'shops', emoji: '🏪', gradient: 'sky', href: '/shops' },
  { key: 'seasons', emoji: '🗓️', gradient: 'sun', href: '/seasons' },
  { key: 'reminders', emoji: '⏰', gradient: 'mint', href: '/garden' },
];

function Spinner({ emoji, isRTL }: { emoji: string; isRTL: boolean }) {
  const r = useSharedValue(0);
  useEffect(() => {
    r.value = withRepeat(withTiming(1, { duration: 20000, easing: Easing.linear }), -1);
  }, [r]);
  const style = useAnimatedStyle(() => ({ transform: [{ rotate: `${r.value * 360}deg` }] }));
  return <Animated.Text style={[{ fontSize: 86, position: 'absolute', top: -8, [isRTL ? 'left' : 'right']: -6, opacity: 0.9 }, style]}>{emoji}</Animated.Text>;
}

export default function Home() {
  const { t, l, isRTL } = useI18n();
  const { user, isGuest } = useAuth();
  const { plants, reminders } = useData();
  const season = currentSeason();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? t('goodMorning') : hour < 18 ? t('goodAfternoon') : t('goodEvening');
  const due = reminders.filter((r) => daysUntil(r) <= 0);
  const tip = TIPS[new Date().getDate() % TIPS.length];
  const picks = PLANTS.filter((p) => p.plantIn.includes(season.id)).slice(0, 5);

  return (
    <Screen tabBar>
      <Appear>
        <Row justify="space-between">
          <View style={{ flex: 1 }}>
            <AppText variant="caption">{greeting} 👋</AppText>
            <AppText variant="title" numberOfLines={1}>
              {isGuest ? t('gardener') : user?.name.split(' ')[0]}
            </AppText>
          </View>
          <LangToggle />
          <PressableScale onPress={() => router.push('/settings')}>
            <LinearGradient colors={gradients.lime} style={styles.avatar}>
              <Text style={{ fontWeight: '900', color: '#05210F', fontSize: 18 }}>{isGuest ? '🌱' : (user?.name[0] ?? '?').toUpperCase()}</Text>
            </LinearGradient>
          </PressableScale>
        </Row>
      </Appear>

      {isGuest && (
        <Appear index={1}>
          <PressableScale onPress={() => router.push('/register')}>
            <GlassCard>
              <Row gap={space.md}>
                <IconBubble emoji="🔐" gradient="violet" size={42} />
                <View style={{ flex: 1 }}>
                  <AppText variant="h2">{t('guestBannerTitle')}</AppText>
                  <AppText variant="caption">{t('guestBannerBody')}</AppText>
                </View>
                <Ionicons name={isRTL ? 'chevron-back' : 'chevron-forward'} size={20} color={colors.textDim} />
              </Row>
            </GlassCard>
          </PressableScale>
        </Appear>
      )}

      <Appear index={2}>
        <PressableScale onPress={() => router.push('/seasons')} scaleTo={0.98}>
          <LinearGradient colors={gradients[season.gradient]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
            <Spinner emoji={season.emoji} isRTL={isRTL} />
            <AppText variant="label" color="rgba(5,33,15,0.7)">
              {t('seasonNow')} · {l(season.months)}
            </AppText>
            <AppText variant="title" color="#05210F" style={{ marginTop: 4 }}>
              {t(season.id)}
            </AppText>
            <AppText color="rgba(5,33,15,0.8)" style={{ marginTop: 4, maxWidth: '75%' }}>
              {l(season.climate)}
            </AppText>
            <AppText variant="label" color="rgba(5,33,15,0.7)" style={{ marginTop: space.md }}>
              {t('bestToPlant')}
            </AppText>
            <Row gap={6} wrap style={{ marginTop: 6 }}>
              {picks.map((p) => (
                <View key={p.id} style={styles.pick}>
                  <Text style={{ color: '#05210F', fontWeight: '700', fontSize: 12 }}>
                    {p.emoji} {l(p.name)}
                  </Text>
                </View>
              ))}
            </Row>
          </LinearGradient>
        </PressableScale>
      </Appear>

      <Appear index={3}>
        <SectionTitle title={t('quickActions')} />
      </Appear>
      <Row wrap gap={space.md} style={{ marginTop: -space.sm }}>
        {ACTIONS.map((a, i) => (
          <Appear key={a.key} index={4 + i} style={{ width: '30.5%', flexGrow: 1 }}>
            <PressableScale onPress={() => router.push(a.href)}>
              <GlassCard padding={space.md} style={{ alignItems: 'center' }}>
                <View style={{ alignItems: 'center', gap: 8 }}>
                  <IconBubble emoji={a.emoji} gradient={a.gradient} size={50} />
                  <AppText variant="caption" center color={colors.text} style={{ fontWeight: '700' }} numberOfLines={1}>
                    {t(a.key)}
                  </AppText>
                </View>
              </GlassCard>
            </PressableScale>
          </Appear>
        ))}
      </Row>

      <Appear index={10}>
        <SectionTitle title={t('todayTasks')} action={t('seeAll')} onAction={() => router.push('/garden')} />
      </Appear>
      <Appear index={11}>
        {due.length ? (
          <View style={{ gap: space.sm }}>
            {due.slice(0, 4).map((r) => (
              <ReminderRow key={r.id} reminder={r} showPlant />
            ))}
          </View>
        ) : (
          <GlassCard>
            <Row gap={space.md}>
              <Text style={{ fontSize: 30 }}>🌞</Text>
              <AppText variant="caption" style={{ flex: 1 }}>
                {t('noTasks')}
              </AppText>
            </Row>
          </GlassCard>
        )}
      </Appear>

      <Appear index={12}>
        <SectionTitle title={t('myPlants')} action={plants.length ? t('seeAll') : undefined} onAction={() => router.push('/garden')} />
      </Appear>
      <Appear index={13}>
        {plants.length ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: space.md, flexDirection: isRTL ? 'row-reverse' : 'row' }}>
            {plants.map((p) => {
              const s = plantById(p.speciesId);
              return (
                <PressableScale key={p.id} onPress={() => router.push({ pathname: '/plant/[id]', params: { id: p.id } })}>
                  <GlassCard style={{ width: 130 }} padding={space.md}>
                    <Text style={{ fontSize: 44, textAlign: 'center' }}>{s?.emoji ?? '🌿'}</Text>
                    <AppText variant="h2" center numberOfLines={1} style={{ marginTop: 6 }}>
                      {p.nickname || (s ? l(s.name) : '')}
                    </AppText>
                    <AppText variant="caption" center numberOfLines={1}>
                      {t(p.location)}
                    </AppText>
                  </GlassCard>
                </PressableScale>
              );
            })}
          </ScrollView>
        ) : (
          <GradientButton title={t('addPlant')} icon="add" gradient="lime" onPress={() => router.push('/add-plant')} />
        )}
      </Appear>

      <Appear index={14}>
        <GlassCard>
          <Row gap={space.md} align="flex-start">
            <IconBubble emoji="💡" gradient="sun" size={42} />
            <View style={{ flex: 1 }}>
              <AppText variant="label">{t('tipOfDay')}</AppText>
              <AppText style={{ marginTop: 4 }}>{l(tip)}</AppText>
            </View>
          </Row>
        </GlassCard>
      </Appear>
    </Screen>
  );
}

const styles = StyleSheet.create({
  avatar: { width: 44, height: 44, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  hero: { borderRadius: radius.xl, padding: space.xl, overflow: 'hidden', minHeight: 200 },
  pick: { backgroundColor: 'rgba(255,255,255,0.45)', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 },
});
