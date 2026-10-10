import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';
import Animated, { FadeInDown, LinearTransition } from 'react-native-reanimated';

import { ReminderRow } from '@/components/reminder-row';
import { AppText, Appear, Badge, EmptyState, GlassCard, Header, IconButton, PressableScale, Row, Screen, Segmented } from '@/components/ui';
import { plantById } from '@/data/plants';
import { daysUntil, useData } from '@/lib/data';
import { useI18n } from '@/lib/i18n';
import { colors, space } from '@/theme';

type View_ = 'plants' | 'reminders';

export default function Garden() {
  const { t, l, isRTL } = useI18n();
  const { plants, reminders, journal } = useData();
  const [tab, setTab] = useState<View_>('plants');
  const sorted = [...reminders].sort((a, b) => daysUntil(a) - daysUntil(b));

  return (
    <Screen
      tabBar
      header={<Header back={false} title={t('gardenTitle')} subtitle={t('gardenSubtitle')} right={<IconButton icon="add" color={colors.primary} onPress={() => router.push('/add-plant')} />} />}>
      <Segmented<View_>
        value={tab}
        onChange={setTab}
        options={[
          { id: 'plants', label: `${t('myPlants')} (${plants.length})`, icon: 'leaf' },
          { id: 'reminders', label: `${t('reminders')} (${reminders.length})`, icon: 'alarm' },
        ]}
      />

      {tab === 'plants' &&
        (plants.length === 0 ? (
          <EmptyState emoji="🪴" text={t('noPlants')} />
        ) : (
          <View style={{ gap: space.md }}>
            {plants.map((p, i) => {
              const s = plantById(p.speciesId);
              const due = reminders.filter((r) => r.plantId === p.id && daysUntil(r) <= 0).length;
              const entries = journal.filter((j) => j.plantId === p.id);
              const latest = entries.find((e) => e.heightCm != null);
              return (
                <Appear key={p.id} index={i}>
                  <PressableScale scaleTo={0.97} onPress={() => router.push({ pathname: '/plant/[id]', params: { id: p.id } })}>
                    <GlassCard padding={space.md}>
                      <Row gap={space.md}>
                        {p.photoUri ? (
                          <Image source={{ uri: p.photoUri }} style={{ width: 64, height: 64, borderRadius: 18 }} />
                        ) : (
                          <View style={{ width: 64, height: 64, borderRadius: 18, backgroundColor: 'rgba(61,220,132,0.14)', alignItems: 'center', justifyContent: 'center' }}>
                            <Text style={{ fontSize: 34 }}>{s?.emoji ?? '🌿'}</Text>
                          </View>
                        )}
                        <View style={{ flex: 1, gap: 4 }}>
                          <AppText variant="h2" numberOfLines={1}>
                            {p.nickname || (s ? l(s.name) : '')}
                          </AppText>
                          <AppText variant="caption" numberOfLines={1}>
                            {s ? l(s.name) : ''} · {t(p.location)}
                          </AppText>
                          <Row gap={6}>
                            {due > 0 && <Badge text={`⏰ ${due}`} color={colors.sun} />}
                            <Badge text={`📔 ${entries.length}`} color={colors.sky} />
                            {latest && <Badge text={`📏 ${latest.heightCm} cm`} color={colors.lime} />}
                          </Row>
                        </View>
                        <Ionicons name={isRTL ? 'chevron-back' : 'chevron-forward'} size={20} color={colors.textFaint} />
                      </Row>
                    </GlassCard>
                  </PressableScale>
                </Appear>
              );
            })}
          </View>
        ))}

      {tab === 'reminders' &&
        (sorted.length === 0 ? (
          <EmptyState emoji="⏰" text={t('noTasks')} />
        ) : (
          <Animated.View layout={LinearTransition} entering={FadeInDown} style={{ gap: space.sm }}>
            {sorted.map((r) => (
              <ReminderRow key={r.id} reminder={r} showPlant />
            ))}
          </Animated.View>
        ))}
    </Screen>
  );
}
