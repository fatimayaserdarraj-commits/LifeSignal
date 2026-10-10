import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';

import { ConfidenceRing, PulseRings, ScanFrame } from '@/components/animated';
import { AppText, Appear, Badge, GhostButton, GlassCard, GradientButton, Header, IconBubble, Input, PressableScale, ProgressBar, Row, Screen, Segmented } from '@/components/ui';
import { aiOnline, CareSheet, diagnosePlant, DiagnosisResult, identifyPlant, Identification } from '@/lib/ai';
import { useI18n } from '@/lib/i18n';
import { TKey } from '@/lib/translations';
import { colors, GradientName, space } from '@/theme';

type Mode = 'identify' | 'diagnose';
type Photo = { uri: string; base64?: string };

const CARE_ICONS: { key: keyof CareSheet; emoji: string; gradient: GradientName }[] = [
  { key: 'water', emoji: '💧', gradient: 'sky' },
  { key: 'light', emoji: '☀️', gradient: 'sun' },
  { key: 'soil', emoji: '🪨', gradient: 'coral' },
  { key: 'temperature', emoji: '🌡️', gradient: 'violet' },
  { key: 'fertilizer', emoji: '🧪', gradient: 'lime' },
  { key: 'humidity', emoji: '💦', gradient: 'mint' },
];

const CATEGORY: Record<DiagnosisResult['category'], { key: TKey; color: string }> = {
  pest: { key: 'pest', color: colors.coral },
  disease: { key: 'disease', color: colors.violet },
  nutrient: { key: 'nutrient', color: colors.sun },
  healthy: { key: 'healthy', color: colors.primary },
};

export default function Scan() {
  const { t, lang } = useI18n();
  const params = useLocalSearchParams<{ mode?: Mode }>();
  const [mode, setMode] = useState<Mode>(params.mode === 'diagnose' ? 'diagnose' : 'identify');
  const [photo, setPhoto] = useState<Photo | null>(null);
  const [symptoms, setSymptoms] = useState('');
  const [busy, setBusy] = useState(false);
  const [plant, setPlant] = useState<Identification | null>(null);
  const [diag, setDiag] = useState<DiagnosisResult | null>(null);

  // Follow mode changes requested by deep links (e.g. Home → Diagnose).
  const [paramMode, setParamMode] = useState(params.mode);
  if (params.mode !== paramMode) {
    setParamMode(params.mode);
    if (params.mode) setMode(params.mode === 'diagnose' ? 'diagnose' : 'identify');
  }

  function reset() {
    setPhoto(null);
    setPlant(null);
    setDiag(null);
    setSymptoms('');
  }

  async function pick(source: 'camera' | 'library') {
    const opts: ImagePicker.ImagePickerOptions = { mediaTypes: ['images'], quality: 0.5, base64: true, allowsEditing: true, aspect: [1, 1] };
    let res: ImagePicker.ImagePickerResult;
    if (source === 'camera') {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) return Alert.alert(t('permissionCamera'));
      res = await ImagePicker.launchCameraAsync(opts);
    } else {
      res = await ImagePicker.launchImageLibraryAsync(opts);
    }
    if (res.canceled || !res.assets[0]) return;
    const asset = res.assets[0];
    const p = { uri: asset.uri, base64: asset.base64 ?? undefined };
    setPhoto(p);
    setPlant(null);
    setDiag(null);
    if (mode === 'identify') run(p);
  }

  async function run(p: Photo | null = photo) {
    setBusy(true);
    try {
      if (mode === 'identify') {
        if (!p) return;
        setPlant(await identifyPlant(p.base64, p.uri, lang));
      } else {
        setDiag(await diagnosePlant(p?.base64, symptoms, lang));
      }
    } catch {
      Alert.alert(t('error'));
    } finally {
      setBusy(false);
    }
  }

  const hasResult = !!plant || !!diag;

  return (
    <Screen tabBar header={<Header back={false} title={t('scanTitle')} subtitle={t('scanSubtitle')} />}>
      <Segmented<Mode>
        value={mode}
        onChange={(m) => {
          setMode(m);
          setPlant(null);
          setDiag(null);
        }}
        options={[
          { id: 'identify', label: t('modeIdentify'), icon: 'leaf' },
          { id: 'diagnose', label: t('modeDiagnose'), icon: 'medkit' },
        ]}
      />

      {!aiOnline && (
        <Animated.View entering={FadeIn}>
          <Row gap={6} justify="center">
            <Ionicons name="cloud-offline-outline" size={14} color={colors.sun} />
            <AppText variant="caption" color={colors.sun}>
              {t('demoMode')}
            </AppText>
          </Row>
        </Animated.View>
      )}

      <ScanFrame active={busy}>
        {photo ? (
          <Image source={{ uri: photo.uri }} style={{ flex: 1 }} contentFit="cover" transition={400} />
        ) : (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: space.lg, padding: space.xl }}>
            <View style={{ width: 90, height: 90, alignItems: 'center', justifyContent: 'center' }}>
              <PulseRings size={90} color={mode === 'identify' ? colors.primary : colors.coral} />
              <IconBubble emoji={mode === 'identify' ? '🌿' : '🩺'} gradient={mode === 'identify' ? 'primary' : 'coral'} size={74} />
            </View>
            <AppText variant="caption" center>
              {t('scanHint')}
            </AppText>
          </View>
        )}
        {busy && (
          <Animated.View entering={FadeIn} style={{ position: 'absolute', bottom: 18, alignSelf: 'center', backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999 }}>
            <Text style={{ color: colors.lime, fontWeight: '800' }}>{t('analyzing')}</Text>
          </Animated.View>
        )}
      </ScanFrame>

      {!hasResult && (
        <Row gap={space.md}>
          <GradientButton title={t('takePhoto')} icon="camera" onPress={() => pick('camera')} style={{ flex: 1 }} disabled={busy} />
          <GhostButton title={t('pickPhoto')} icon="images-outline" onPress={() => pick('library')} style={{ flex: 1 }} />
        </Row>
      )}

      {mode === 'diagnose' && !diag && (
        <Animated.View entering={FadeInDown} style={{ gap: space.md }}>
          <Input label={t('symptoms')} icon="search" value={symptoms} onChangeText={setSymptoms} placeholder={t('symptomsPlaceholder')} multiline />
          <Row gap={6} wrap>
            {(lang === 'ar'
              ? ['أوراق صفراء', 'بقع بيضاء', 'مادة لزجة', 'خيوط شبكية', 'حواف بنية', 'عروق خضراء']
              : ['yellow leaves', 'white powder', 'sticky', 'webbing', 'brown edges', 'green veins']
            ).map((s) => (
              <PressableScale key={s} onPress={() => setSymptoms((cur) => (cur ? `${cur}, ${s}` : s))}>
                <Badge text={`+ ${s}`} color={colors.mint} />
              </PressableScale>
            ))}
          </Row>
          <GradientButton title={t('runDiagnosis')} icon="pulse" gradient="coral" onPress={() => run()} loading={busy} disabled={!photo && !symptoms.trim()} />
        </Animated.View>
      )}

      {plant && <PlantResult r={plant} photo={photo} onReset={reset} />}
      {diag && <DiagnosisCard r={diag} onReset={reset} />}
    </Screen>
  );
}

function PlantResult({ r, photo, onReset }: { r: Identification; photo: Photo | null; onReset: () => void }) {
  const { t } = useI18n();
  return (
    <View style={{ gap: space.lg }}>
      <Animated.View entering={FadeInUp.springify().damping(15)}>
        <GlassCard>
          <Row gap={space.lg}>
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={{ fontSize: 34 }}>{r.emoji}</Text>
              <AppText variant="title">{r.name}</AppText>
              <AppText variant="caption" style={{ fontStyle: 'italic' }}>
                {r.scientific}
              </AppText>
              <Badge text={`${t('family')}: ${r.family}`} color={colors.lime} />
            </View>
            <View style={{ alignItems: 'center', gap: 6 }}>
              <ConfidenceRing value={r.confidence} />
              <AppText variant="label">{t('confidence')}</AppText>
            </View>
          </Row>
          <AppText style={{ marginTop: space.md }} color={colors.textDim}>
            {r.description}
          </AppText>
        </GlassCard>
      </Animated.View>

      <AppText variant="h2">{t('careGuide')}</AppText>
      <Row wrap gap={space.md} align="stretch">
        {CARE_ICONS.map((c, i) => (
          <Appear key={c.key} index={i} style={{ width: '47%', flexGrow: 1 }}>
            <GlassCard padding={space.md} style={{ flex: 1 }}>
              <IconBubble emoji={c.emoji} gradient={c.gradient} size={36} />
              <AppText variant="label" style={{ marginTop: 8 }}>
                {t(c.key)}
              </AppText>
              <AppText variant="caption" color={colors.text} style={{ marginTop: 2 }}>
                {r.care[c.key]}
              </AppText>
            </GlassCard>
          </Appear>
        ))}
      </Row>

      <GradientButton
        title={t('addToGarden')}
        icon="add-circle"
        gradient="lime"
        onPress={() => router.push({ pathname: '/add-plant', params: { species: r.matchId ?? '', photo: photo?.uri ?? '', name: r.name } })}
      />
      <GhostButton title={t('scanAgain')} icon="refresh" onPress={onReset} />
    </View>
  );
}

function DiagnosisCard({ r, onReset }: { r: DiagnosisResult; onReset: () => void }) {
  const { t } = useI18n();
  const cat = CATEGORY[r.category] ?? CATEGORY.healthy;
  return (
    <View style={{ gap: space.lg }}>
      <Animated.View entering={FadeInUp.springify().damping(15)}>
        <GlassCard>
          <Row gap={space.lg}>
            <View style={{ flex: 1, gap: 6 }}>
              <Text style={{ fontSize: 34 }}>{r.emoji}</Text>
              <Badge text={t(cat.key)} color={cat.color} />
              <AppText variant="title">{r.name}</AppText>
            </View>
            <View style={{ alignItems: 'center', gap: 6 }}>
              <ConfidenceRing value={r.confidence} color={cat.color} />
              <AppText variant="label">{t('confidence')}</AppText>
            </View>
          </Row>
          <View style={{ marginTop: space.md, gap: 6 }}>
            <Row justify="space-between">
              <AppText variant="label">{t('severity')}</AppText>
              <AppText variant="caption">{r.severity < 0.4 ? t('low') : r.severity < 0.7 ? t('medium') : t('high')}</AppText>
            </Row>
            <ProgressBar value={r.severity} color={r.severity < 0.4 ? colors.primary : r.severity < 0.7 ? colors.sun : colors.coral} />
          </View>
          <AppText variant="label" style={{ marginTop: space.lg }}>
            {t('causes')}
          </AppText>
          <AppText color={colors.textDim} style={{ marginTop: 4 }}>
            {r.causes}
          </AppText>
        </GlassCard>
      </Animated.View>

      <Section title={t('treatment')} items={r.treatment} icon="medkit" color={colors.coral} />
      <Section title={t('prevention')} items={r.prevention} icon="shield-checkmark" color={colors.primary} />

      <GradientButton
        title={t('askAssistant')}
        icon="sparkles"
        gradient="violet"
        onPress={() => router.push({ pathname: '/assistant', params: { prefill: `${r.name}: ${r.causes}` } })}
      />
      <GhostButton title={t('scanAgain')} icon="refresh" onPress={onReset} />
    </View>
  );
}

function Section({ title, items, icon, color }: { title: string; items: string[]; icon: 'medkit' | 'shield-checkmark'; color: string }) {
  return (
    <GlassCard>
      <Row gap={space.sm}>
        <Ionicons name={icon} size={18} color={color} />
        <AppText variant="h2">{title}</AppText>
      </Row>
      <View style={{ gap: space.md, marginTop: space.md }}>
        {items.map((s, i) => (
          <Appear key={i} index={i}>
            <Row gap={space.md} align="flex-start">
              <View style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: `${color}33`, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color, fontWeight: '900', fontSize: 12 }}>{i + 1}</Text>
              </View>
              <AppText style={{ flex: 1 }}>{s}</AppText>
            </Row>
          </Appear>
        ))}
      </View>
    </GlassCard>
  );
}
