import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { AppText, Appear, Badge, Chip, GlassCard, Header, PressableScale, Row, Screen } from '@/components/ui';
import { PLANTS, SeasonId, SeasonType } from '@/data/plants';
import { currentSeason, SEASONS } from '@/data/seasons';
import { useI18n } from '@/lib/i18n';
import { TKey } from '@/lib/translations';
import { colors, gradients, radius, space } from '@/theme';

const TYPE_LABEL: Record<SeasonType, { key: TKey; color: string; emoji: string }> = {
  cool: { key: 'coolSeason', color: colors.sky, emoji: '❄️' },
  warm: { key: 'warmSeason', color: colors.sun, emoji: '🔥' },
  perennial: { key: 'perennial', color: colors.primary, emoji: '♾️' },
};

export default function Seasons() {
  const { t, l, isRTL } = useI18n();
  const now = currentSeason();
  const [sel, setSel] = useState<SeasonId>(now.id);
  const [type, setType] = useState<SeasonType | 'all'>('all');
  const season = SEASONS.find((s) => s.id === sel)!;
  const plants = PLANTS.filter((p) => p.plantIn.includes(sel)).filter((p) => type === 'all' || p.seasonType === type);

  return (
    <Screen header={<Header title={t('seasonsTitle')} subtitle={t('seasonsSubtitle')} />}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: space.md, flexDirection: isRTL ? 'row-reverse' : 'row' }}>
        {SEASONS.map((s) => {
          const active = s.id === sel;
          return (
            <PressableScale key={s.id} onPress={() => setSel(s.id)}>
              <LinearGradient
                colors={active ? gradients[s.gradient] : gradients.glass}
                style={{ width: 96, paddingVertical: 14, borderRadius: radius.lg, alignItems: 'center', borderWidth: 1, borderColor: active ? 'transparent' : colors.border }}>
                <Text style={{ fontSize: 30 }}>{s.emoji}</Text>
                <Text style={{ color: active ? '#05140A' : colors.text, fontWeight: '800', marginTop: 4 }}>{t(s.id)}</Text>
                {s.id === now.id && <Text style={{ color: active ? '#05140A' : colors.lime, fontSize: 10, fontWeight: '800' }}>● {t('nowLabel')}</Text>}
              </LinearGradient>
            </PressableScale>
          );
        })}
      </ScrollView>

      <Animated.View key={sel} entering={FadeInDown.springify().damping(16)}>
        <LinearGradient colors={gradients[season.gradient]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ borderRadius: radius.xl, padding: space.xl }}>
          <AppText variant="label" color="rgba(5,20,10,0.7)">
            {l(season.months)}
          </AppText>
          <AppText variant="title" color="#05140A">
            {season.emoji} {t(season.id)}
          </AppText>
          <AppText color="rgba(5,20,10,0.8)" style={{ marginTop: 4 }}>
            {l(season.climate)}
          </AppText>
        </LinearGradient>
      </Animated.View>

      <GlassCard>
        <AppText variant="h2">{t('seasonCare')}</AppText>
        <View style={{ gap: space.sm, marginTop: space.md }}>
          {season.tips.map((tip, i) => (
            <Animated.View key={`${sel}${i}`} entering={FadeIn.delay(i * 120)}>
              <Row gap={space.sm} align="flex-start">
                <Text style={{ color: colors.lime }}>✦</Text>
                <AppText style={{ flex: 1 }}>{l(tip)}</AppText>
              </Row>
            </Animated.View>
          ))}
        </View>
      </GlassCard>

      <AppText variant="h2">{t('bestToPlant')}</AppText>
      <Row gap={space.sm} wrap>
        <Chip label={t('all')} active={type === 'all'} onPress={() => setType('all')} />
        {(Object.keys(TYPE_LABEL) as SeasonType[]).map((k) => (
          <Chip key={k} emoji={TYPE_LABEL[k].emoji} label={t(TYPE_LABEL[k].key)} active={type === k} onPress={() => setType(k)} />
        ))}
      </Row>
      <Row wrap gap={space.md}>
        {plants.map((p, i) => (
          <Appear key={`${sel}-${p.id}`} index={i} style={{ width: '47%', flexGrow: 1 }}>
            <PressableScale onPress={() => router.push({ pathname: '/add-plant', params: { species: p.id } })}>
              <GlassCard padding={space.md}>
                <Text style={{ fontSize: 40 }}>{p.emoji}</Text>
                <AppText variant="h2" style={{ marginTop: 6 }}>
                  {l(p.name)}
                </AppText>
                <AppText variant="caption" numberOfLines={2} style={{ marginVertical: 6 }}>
                  {l(p.care.water)}
                </AppText>
                <Badge text={`${TYPE_LABEL[p.seasonType].emoji} ${t(TYPE_LABEL[p.seasonType].key)}`} color={TYPE_LABEL[p.seasonType].color} />
              </GlassCard>
            </PressableScale>
          </Appear>
        ))}
      </Row>
    </Screen>
  );
}
