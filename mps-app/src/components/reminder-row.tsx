import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { Text, View } from 'react-native';
import Animated, { FadeOut, LinearTransition, ZoomIn } from 'react-native-reanimated';

import { plantById } from '@/data/plants';
import { CARE_TASKS, daysUntil, Reminder, useData } from '@/lib/data';
import { useI18n } from '@/lib/i18n';
import { colors, space } from '@/theme';

import { AppText, GlassCard, PressableScale, ProgressBar, Row } from './ui';

export function ReminderRow({ reminder, showPlant, onLongPress }: { reminder: Reminder; showPlant?: boolean; onLongPress?: () => void }) {
  const { t, l } = useI18n();
  const { plants, completeReminder } = useData();
  const [justDone, setJustDone] = useState(false);
  const plant = plants.find((p) => p.id === reminder.plantId);
  const species = plant && plantById(plant.speciesId);
  const task = CARE_TASKS.find((c) => c.id === reminder.task);
  const days = daysUntil(reminder);
  const status = days < 0 ? t('overdue') : days === 0 ? t('dueToday') : t('dueIn', { n: days });
  const statusColor = days < 0 ? colors.coral : days === 0 ? colors.sun : colors.textDim;
  const elapsed = 1 - Math.max(0, days) / reminder.intervalDays;

  return (
    <Animated.View layout={LinearTransition.springify()} exiting={FadeOut}>
      <PressableScale onLongPress={onLongPress} scaleTo={0.98} haptic={false}>
        <GlassCard padding={space.md}>
          <Row gap={space.md}>
            <Text style={{ fontSize: 28 }}>{task?.emoji}</Text>
            <View style={{ flex: 1, gap: 4 }}>
              <AppText variant="h2" numberOfLines={1}>
                {t(reminder.task)}
                {showPlant && plant ? ` · ${plant.nickname || (species ? l(species.name) : '')}` : ''}
              </AppText>
              <Row gap={6}>
                <AppText variant="caption" color={statusColor}>
                  {status}
                </AppText>
                <AppText variant="caption">
                  · {t('every')} {reminder.intervalDays} {t('days')}
                </AppText>
              </Row>
              <ProgressBar value={elapsed} color={statusColor === colors.textDim ? colors.primary : statusColor} height={5} />
            </View>
            <PressableScale
              onPress={async () => {
                setJustDone(true);
                await completeReminder(reminder.id);
                setTimeout(() => setJustDone(false), 1400);
              }}
              style={{
                width: 46,
                height: 46,
                borderRadius: 23,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: justDone ? colors.primary : 'rgba(61,220,132,0.12)',
                borderWidth: 1,
                borderColor: colors.primary,
              }}>
              {justDone ? (
                <Animated.View entering={ZoomIn.springify()}>
                  <Ionicons name="checkmark" size={24} color="#05210F" />
                </Animated.View>
              ) : (
                <Ionicons name="checkmark" size={22} color={colors.primary} />
              )}
            </PressableScale>
          </Row>
        </GlassCard>
      </PressableScale>
    </Animated.View>
  );
}
