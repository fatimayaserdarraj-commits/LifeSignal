import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { AppText, Appear, Chip, Header, PressableScale, ProgressBar, Row, Screen } from '@/components/ui';
import { Guide, GUIDES } from '@/data/guides';
import { useData } from '@/lib/data';
import { useI18n } from '@/lib/i18n';
import { gradients, radius, space } from '@/theme';

type Level = Guide['level'] | 'all';

export default function Guides() {
  const { t, l, isRTL } = useI18n();
  const { guideProgress } = useData();
  const [level, setLevel] = useState<Level>('all');
  const list = level === 'all' ? GUIDES : GUIDES.filter((g) => g.level === level);

  return (
    <Screen header={<Header title={t('guidesTitle')} subtitle={t('guidesSubtitle')} />}>
      <Row gap={space.sm} wrap>
        {(['all', 'beginner', 'intermediate', 'advanced'] as Level[]).map((lv) => (
          <Chip key={lv} label={t(lv)} active={level === lv} onPress={() => setLevel(lv)} />
        ))}
      </Row>
      {list.map((g, i) => {
        const done = guideProgress[g.id] ?? 0;
        const pct = done / g.steps.length;
        return (
          <Appear key={g.id} index={i}>
            <PressableScale scaleTo={0.97} onPress={() => router.push({ pathname: '/guides/[id]', params: { id: g.id } })}>
              <LinearGradient colors={gradients[g.gradient]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ borderRadius: radius.xl, padding: space.xl, overflow: 'hidden' }}>
                <Text style={{ position: 'absolute', fontSize: 120, opacity: 0.25, top: -10, [isRTL ? 'left' : 'right']: -10 }}>{g.emoji}</Text>
                <AppText variant="label" color="rgba(5,20,10,0.7)">
                  {l(g.topic)} · {t(g.level)}
                </AppText>
                <AppText variant="title" color="#05140A" style={{ marginTop: 4, maxWidth: '85%' }}>
                  {l(g.title)}
                </AppText>
                <AppText color="rgba(5,20,10,0.75)" style={{ marginTop: 6, maxWidth: '85%' }}>
                  {l(g.summary)}
                </AppText>
                <Row gap={space.md} style={{ marginTop: space.lg }}>
                  <Row gap={4}>
                    <Ionicons name="time-outline" size={14} color="#05140A" />
                    <Text style={{ color: '#05140A', fontWeight: '700' }}>
                      {g.minutes} {t('minutes')}
                    </Text>
                  </Row>
                  <Row gap={4}>
                    <Ionicons name="list-outline" size={14} color="#05140A" />
                    <Text style={{ color: '#05140A', fontWeight: '700' }}>
                      {g.steps.length} {t('steps')}
                    </Text>
                  </Row>
                  <View style={{ flex: 1 }}>
                    <ProgressBar value={pct} color="#05140A" height={6} />
                  </View>
                  <Text style={{ color: '#05140A', fontWeight: '900' }}>{pct >= 1 ? '✅' : `${Math.round(pct * 100)}%`}</Text>
                </Row>
              </LinearGradient>
            </PressableScale>
          </Appear>
        );
      })}
    </Screen>
  );
}
