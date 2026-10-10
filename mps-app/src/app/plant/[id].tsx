import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Text, View } from 'react-native';
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withDelay, withSpring } from 'react-native-reanimated';

import { ReminderRow } from '@/components/reminder-row';
import { AppText, Appear, Chip, EmptyState, GhostButton, GlassCard, GradientButton, Header, IconButton, Input, PressableScale, Row, Screen, SectionTitle, Segmented } from '@/components/ui';
import { plantById } from '@/data/plants';
import { CARE_TASKS, CareTask, JournalEntry, useData } from '@/lib/data';
import { useI18n } from '@/lib/i18n';
import { colors, radius, space } from '@/theme';

type Tab = 'care' | 'journal';

export default function PlantDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, l, lang } = useI18n();
  const { plants, reminders, journal, removePlant, addReminder, removeReminder } = useData();
  const plant = plants.find((p) => p.id === id);
  const [tab, setTab] = useState<Tab>('care');
  const [adding, setAdding] = useState(false);
  const [task, setTask] = useState<CareTask>('watering');
  const [interval, setIntervalDays] = useState(7);

  if (!plant) return <Screen header={<Header title="" />}>{null}</Screen>;
  const s = plantById(plant.speciesId);
  const name = plant.nickname || (s ? l(s.name) : '');
  const mine = reminders.filter((r) => r.plantId === plant.id);
  const entries = journal.filter((j) => j.plantId === plant.id);

  return (
    <Screen
      header={
        <Header
          title={name}
          subtitle={s?.scientific}
          right={
            <IconButton
              icon="trash-outline"
              color={colors.coral}
              onPress={() =>
                Alert.alert(t('delete'), name, [
                  { text: t('cancel'), style: 'cancel' },
                  {
                    text: t('delete'),
                    style: 'destructive',
                    onPress: () => {
                      removePlant(plant.id);
                      router.back();
                    },
                  },
                ])
              }
            />
          }
        />
      }>
      <Appear>
        <View style={{ height: 200, borderRadius: radius.xl, overflow: 'hidden', backgroundColor: 'rgba(61,220,132,0.12)', alignItems: 'center', justifyContent: 'center' }}>
          {plant.photoUri ? <Image source={{ uri: plant.photoUri }} style={{ width: '100%', height: '100%' }} contentFit="cover" /> : <Text style={{ fontSize: 110 }}>{s?.emoji}</Text>}
        </View>
      </Appear>

      <Segmented<Tab>
        value={tab}
        onChange={setTab}
        options={[
          { id: 'care', label: t('careGuide'), icon: 'water' },
          { id: 'journal', label: t('growthJournal'), icon: 'trending-up' },
        ]}
      />

      {tab === 'care' && (
        <View style={{ gap: space.lg }}>
          {s && (
            <Appear>
              <GlassCard>
                <AppText color={colors.textDim}>{l(s.description)}</AppText>
                <View style={{ gap: space.sm, marginTop: space.md }}>
                  {(['water', 'light', 'soil', 'temperature', 'fertilizer', 'humidity'] as const).map((k) => (
                    <Row key={k} gap={space.sm} align="flex-start">
                      <AppText variant="label" style={{ width: 112, marginTop: 3, letterSpacing: 0.6 }}>
                        {t(k)}
                      </AppText>
                      <AppText variant="caption" color={colors.text} style={{ flex: 1 }}>
                        {l(s.care[k])}
                      </AppText>
                    </Row>
                  ))}
                </View>
              </GlassCard>
            </Appear>
          )}

          <SectionTitle title={t('remindersTitle')} action={adding ? t('cancel') : `+ ${t('addReminder')}`} onAction={() => setAdding((a) => !a)} />
          {adding && (
            <Animated.View entering={FadeInDown.springify()}>
              <GlassCard>
                <Row wrap gap={space.sm}>
                  {CARE_TASKS.map((c) => (
                    <Chip key={c.id} emoji={c.emoji} label={t(c.id)} active={task === c.id} onPress={() => setTask(c.id)} />
                  ))}
                </Row>
                <Row justify="space-between" style={{ marginTop: space.lg }}>
                  <AppText>
                    {t('every')} <Text style={{ fontWeight: '900', color: colors.primary }}>{interval}</Text> {t('days')}
                  </AppText>
                  <Row gap={space.sm}>
                    <IconButton icon="remove" onPress={() => setIntervalDays((v) => Math.max(1, v - 1))} />
                    <IconButton icon="add" onPress={() => setIntervalDays((v) => Math.min(365, v + 1))} />
                  </Row>
                </Row>
                <GradientButton
                  style={{ marginTop: space.lg }}
                  title={t('save')}
                  icon="alarm"
                  small
                  onPress={async () => {
                    await addReminder(plant.id, task, interval, name);
                    setAdding(false);
                  }}
                />
              </GlassCard>
            </Animated.View>
          )}
          <View style={{ gap: space.sm }}>
            {mine.map((r) => (
              <ReminderRow
                key={r.id}
                reminder={r}
                onLongPress={() =>
                  Alert.alert(t('delete'), t(r.task), [
                    { text: t('cancel'), style: 'cancel' },
                    { text: t('delete'), style: 'destructive', onPress: () => removeReminder(r.id) },
                  ])
                }
              />
            ))}
          </View>
        </View>
      )}

      {tab === 'journal' && <Journal plantId={plant.id} entries={entries} lang={lang} />}
    </Screen>
  );
}

function Journal({ plantId, entries, lang }: { plantId: string; entries: JournalEntry[]; lang: string }) {
  const { t } = useI18n();
  const { addJournal, removeJournal } = useData();
  const [open, setOpen] = useState(false);
  const [height, setHeight] = useState('');
  const [note, setNote] = useState('');
  const [photo, setPhoto] = useState<string>();
  const measured = [...entries].filter((e) => e.heightCm != null).reverse();

  async function pick() {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.6 });
    if (!res.canceled && res.assets[0]) setPhoto(res.assets[0].uri);
  }

  return (
    <View style={{ gap: space.lg }}>
      {measured.length > 0 && (
        <Appear>
          <GlassCard>
            <AppText variant="h2">{t('growthChart')}</AppText>
            <GrowthChart entries={measured.slice(-8)} lang={lang} />
          </GlassCard>
        </Appear>
      )}

      {open ? (
        <Animated.View entering={FadeInDown.springify()}>
          <GlassCard>
            <View style={{ gap: space.md }}>
              <Input label={t('height')} icon="resize-outline" keyboardType="decimal-pad" value={height} onChangeText={setHeight} placeholder="24" />
              <Input label={t('note')} icon="create-outline" value={note} onChangeText={setNote} placeholder={t('notePlaceholder')} multiline />
              <PressableScale onPress={pick}>
                {photo ? (
                  <Image source={{ uri: photo }} style={{ height: 160, borderRadius: radius.md }} />
                ) : (
                  <View style={{ height: 70, borderRadius: radius.md, borderWidth: 1, borderStyle: 'dashed', borderColor: colors.border, alignItems: 'center', justifyContent: 'center' }}>
                    <AppText variant="caption">📷 {t('addPhoto')}</AppText>
                  </View>
                )}
              </PressableScale>
              <Row gap={space.sm}>
                <GhostButton title={t('cancel')} onPress={() => setOpen(false)} style={{ flex: 1 }} />
                <GradientButton
                  title={t('save')}
                  style={{ flex: 1 }}
                  disabled={!note.trim() && !height && !photo}
                  onPress={() => {
                    const h = parseFloat(height.replace(',', '.'));
                    addJournal({ plantId, note: note.trim(), heightCm: Number.isFinite(h) ? h : undefined, photoUri: photo });
                    setOpen(false);
                    setHeight('');
                    setNote('');
                    setPhoto(undefined);
                  }}
                />
              </Row>
            </View>
          </GlassCard>
        </Animated.View>
      ) : (
        <GradientButton title={t('addEntry')} icon="add" gradient="sky" onPress={() => setOpen(true)} />
      )}

      {entries.length === 0 ? (
        <EmptyState emoji="📔" text={t('noEntries')} />
      ) : (
        <View style={{ gap: space.md }}>
          {entries.map((e, i) => (
            <Appear key={e.id} index={i}>
              <Row gap={space.md} align="flex-start">
                <View style={{ alignItems: 'center' }}>
                  <View style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: colors.primary, marginTop: 18 }} />
                  {i < entries.length - 1 && <View style={{ width: 2, flex: 1, minHeight: 60, backgroundColor: 'rgba(61,220,132,0.3)' }} />}
                </View>
                <PressableScale
                  style={{ flex: 1 }}
                  scaleTo={0.98}
                  onLongPress={() =>
                    Alert.alert(t('delete'), undefined, [
                      { text: t('cancel'), style: 'cancel' },
                      { text: t('delete'), style: 'destructive', onPress: () => removeJournal(e.id) },
                    ])
                  }>
                  <GlassCard padding={space.md}>
                    <Row justify="space-between">
                      <AppText variant="label">{new Date(e.at).toLocaleDateString(lang === 'ar' ? 'ar-BH' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</AppText>
                      {e.heightCm != null && <AppText variant="caption" color={colors.lime}>📏 {e.heightCm} cm</AppText>}
                    </Row>
                    {e.note ? <AppText style={{ marginTop: 6 }}>{e.note}</AppText> : null}
                    {e.photoUri ? <Image source={{ uri: e.photoUri }} style={{ height: 160, borderRadius: radius.md, marginTop: space.sm }} contentFit="cover" /> : null}
                  </GlassCard>
                </PressableScale>
              </Row>
            </Appear>
          ))}
        </View>
      )}
    </View>
  );
}

function GrowthChart({ entries, lang }: { entries: JournalEntry[]; lang: string }) {
  const max = Math.max(...entries.map((e) => e.heightCm ?? 0), 1);
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 8, height: 150, marginTop: space.md }}>
      {entries.map((e, i) => (
        <Bar key={e.id} value={(e.heightCm ?? 0) / max} label={`${e.heightCm}`} date={new Date(e.at).toLocaleDateString(lang === 'ar' ? 'ar-BH' : 'en-GB', { day: 'numeric', month: 'numeric' })} index={i} />
      ))}
    </View>
  );
}

function Bar({ value, label, date, index }: { value: number; label: string; date: string; index: number }) {
  const h = useSharedValue(0);
  useEffect(() => {
    h.value = withDelay(index * 90, withSpring(value, { damping: 14 }));
  }, [value, index, h]);
  const style = useAnimatedStyle(() => ({ height: `${Math.max(h.value, 0.04) * 100}%` }));
  return (
    <View style={{ flex: 1, height: '100%', justifyContent: 'flex-end', alignItems: 'center' }}>
      <Text style={{ color: colors.text, fontSize: 10, fontWeight: '800', marginBottom: 4 }}>{label}</Text>
      <View style={{ flex: 1, width: '100%', justifyContent: 'flex-end' }}>
        <Animated.View style={[{ width: '100%', borderRadius: 8, backgroundColor: colors.primary }, style]} />
      </View>
      <Text style={{ color: colors.textFaint, fontSize: 9, marginTop: 4 }}>{date}</Text>
    </View>
  );
}
