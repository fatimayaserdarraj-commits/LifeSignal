import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';

import { AppText, Chip, GhostButton, GlassCard, GradientButton, Header, Input, PressableScale, Row, Screen } from '@/components/ui';
import { PLANTS, plantById } from '@/data/plants';
import { CareTask, GardenPlant, useData } from '@/lib/data';
import { useI18n } from '@/lib/i18n';
import { colors, radius, space } from '@/theme';

const LOCATIONS: GardenPlant['location'][] = ['indoor', 'outdoor', 'balcony'];

export default function AddPlant() {
  const { t, l } = useI18n();
  const params = useLocalSearchParams<{ species?: string; photo?: string; name?: string }>();
  const { addPlant, addReminder } = useData();
  const [species, setSpecies] = useState(params.species && plantById(params.species) ? params.species : PLANTS[0].id);
  const [nickname, setNickname] = useState(params.species ? '' : params.name ?? '');
  const [location, setLocation] = useState<GardenPlant['location']>('indoor');
  const [photo, setPhoto] = useState(params.photo || undefined);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    const plant = addPlant({ speciesId: species, nickname: nickname.trim(), location, photoUri: photo });
    // Seed reminders from the species' recommended schedule.
    const sched = plantById(species)?.schedule ?? { watering: 7, fertilizing: 30 };
    const tasks = Object.entries(sched).filter(([, v]) => v != null && v < 120) as [CareTask, number][];
    for (const [task, days] of tasks) {
      if (task === 'watering' || task === 'fertilizing' || task === 'misting' || task === 'pruning') await addReminder(plant.id, task, days, plant.nickname || l(plantById(species)!.name));
    }
    setSaving(false);
    router.replace({ pathname: '/plant/[id]', params: { id: plant.id } });
  }

  async function pickPhoto() {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.6, allowsEditing: true, aspect: [1, 1] });
    if (!res.canceled && res.assets[0]) setPhoto(res.assets[0].uri);
  }

  return (
    <Screen header={<Header title={t('addPlant')} />}>
      <PressableScale onPress={pickPhoto} style={{ alignSelf: 'center' }}>
        <View style={{ width: 130, height: 130, borderRadius: 40, overflow: 'hidden', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' }}>
          {photo ? (
            <Image source={{ uri: photo }} style={{ width: '100%', height: '100%' }} />
          ) : (
            <Animated.Text key={species} entering={ZoomIn.springify()} style={{ fontSize: 64 }}>
              {plantById(species)?.emoji}
            </Animated.Text>
          )}
        </View>
        <AppText variant="caption" center style={{ marginTop: 6 }}>
          📷 {t('addPhoto')}
        </AppText>
      </PressableScale>

      <AppText variant="label">{t('choosePlant')}</AppText>
      <Row wrap gap={space.sm}>
        {PLANTS.map((p) => {
          const active = p.id === species;
          return (
            <PressableScale
              key={p.id}
              onPress={() => setSpecies(p.id)}
              style={{
                width: '31%',
                flexGrow: 1,
                paddingVertical: 12,
                borderRadius: radius.md,
                alignItems: 'center',
                borderWidth: 1.5,
                borderColor: active ? colors.primary : colors.border,
                backgroundColor: active ? 'rgba(61,220,132,0.15)' : colors.surface,
              }}>
              <Text style={{ fontSize: 28 }}>{p.emoji}</Text>
              <AppText variant="caption" center numberOfLines={1} color={active ? colors.text : colors.textDim} style={{ fontWeight: '700', marginTop: 4 }}>
                {l(p.name)}
              </AppText>
            </PressableScale>
          );
        })}
      </Row>

      <Input label={t('nickname')} icon="pricetag-outline" value={nickname} onChangeText={setNickname} placeholder={l(plantById(species)!.name)} />

      <AppText variant="label">{t('location')}</AppText>
      <Row gap={space.sm}>
        {LOCATIONS.map((loc) => (
          <Chip key={loc} label={t(loc)} active={location === loc} onPress={() => setLocation(loc)} emoji={loc === 'indoor' ? '🏠' : loc === 'outdoor' ? '🌳' : '🌇'} />
        ))}
      </Row>

      <GlassCard>
        <AppText variant="label">{t('remindersTitle')}</AppText>
        <AppText variant="caption" style={{ marginTop: 4 }}>
          💧 {t('watering')}: {t('every')} {plantById(species)?.schedule.watering} {t('days')} · 🧪 {t('fertilizing')}: {t('every')}{' '}
          {plantById(species)?.schedule.fertilizing} {t('days')}
        </AppText>
      </GlassCard>

      <GradientButton title={t('save')} icon="checkmark" onPress={save} loading={saving} />
      <GhostButton title={t('cancel')} onPress={() => router.back()} />
    </Screen>
  );
}
