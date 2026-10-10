import Ionicons from '@expo/vector-icons/Ionicons';
import * as Location from 'expo-location';
import { useState } from 'react';
import { Alert, Linking, Text, View } from 'react-native';
import Animated, { FadeIn, LinearTransition } from 'react-native-reanimated';

import { AppText, Badge, Chip, GhostButton, GlassCard, Header, IconBubble, Input, PressableScale, Row, Screen } from '@/components/ui';
import { distanceKm, Shop, SHOPS, ShopType } from '@/data/shops';
import { useI18n } from '@/lib/i18n';
import { TKey } from '@/lib/translations';
import { colors, GradientName, space } from '@/theme';

const TYPES: { id: ShopType | 'all'; key: TKey; emoji: string }[] = [
  { id: 'all', key: 'all', emoji: '✨' },
  { id: 'nursery', key: 'nursery', emoji: '🌳' },
  { id: 'market', key: 'market', emoji: '🧺' },
  { id: 'equipment', key: 'equipment', emoji: '🧰' },
  { id: 'expert', key: 'expert', emoji: '👩‍🌾' },
];

const TYPE_GRADIENT: Record<ShopType, GradientName> = { nursery: 'primary', market: 'sun', equipment: 'sky', expert: 'violet' };

export default function Shops() {
  const { t, l } = useI18n();
  const [type, setType] = useState<ShopType | 'all'>('all');
  const [q, setQ] = useState('');
  const [pos, setPos] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);

  async function locate() {
    setLocating(true);
    try {
      const perm = await Location.requestForegroundPermissionsAsync();
      if (!perm.granted) return;
      const p = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setPos({ lat: p.coords.latitude, lng: p.coords.longitude });
    } catch {
      Alert.alert(t('error'));
    } finally {
      setLocating(false);
    }
  }

  const query = q.trim().toLowerCase();
  const list = SHOPS.filter((s) => type === 'all' || s.type === type)
    .filter((s) => !query || [s.name.en, s.name.ar, s.area.en, s.area.ar, s.description.en, s.description.ar].some((x) => x.toLowerCase().includes(query)))
    .map((s) => ({ s, km: pos ? distanceKm(pos.lat, pos.lng, s.lat, s.lng) : null }))
    .sort((a, b) => (a.km ?? 0) - (b.km ?? 0) || b.s.rating - a.s.rating);

  return (
    <Screen header={<Header title={t('shopsTitle')} subtitle={t('shopsSubtitle')} />}>
      <Input icon="search" value={q} onChangeText={setQ} placeholder={t('search')} />
      <Row gap={space.sm} wrap>
        {TYPES.map((x) => (
          <Chip key={x.id} emoji={x.emoji} label={t(x.key)} active={type === x.id} onPress={() => setType(x.id)} />
        ))}
      </Row>
      <GhostButton title={pos ? `📍 ${t('useLocation')} ✓` : t('useLocation')} icon={locating ? 'hourglass-outline' : 'navigate-outline'} onPress={locate} />
      <Row gap={6} align="flex-start">
        <Ionicons name="information-circle-outline" size={14} color={colors.sun} style={{ marginTop: 2 }} />
        <AppText variant="caption" color={colors.sun} style={{ flex: 1 }}>
          {t('sampleData')}
        </AppText>
      </Row>
      <View style={{ gap: space.md }}>
        {list.map(({ s, km }, i) => (
          <Animated.View key={s.id} layout={LinearTransition.springify()} entering={FadeIn.delay(i * 60)}>
            <ShopCard shop={s} km={km} name={l(s.name)} area={l(s.area)} description={l(s.description)} />
          </Animated.View>
        ))}
      </View>
    </Screen>
  );
}

function ShopCard({ shop, km, name, area, description }: { shop: Shop; km: number | null; name: string; area: string; description: string }) {
  const { t } = useI18n();
  const maps = `https://www.google.com/maps/search/?api=1&query=${shop.lat},${shop.lng}`;
  const wa = `https://wa.me/${shop.phone.replace(/\D/g, '')}`;
  return (
    <GlassCard>
      <Row gap={space.md} align="flex-start">
        <IconBubble emoji={shop.emoji} gradient={TYPE_GRADIENT[shop.type]} size={52} />
        <View style={{ flex: 1, gap: 4 }}>
          <AppText variant="h2">{name}</AppText>
          <Row gap={6} wrap>
            <AppText variant="caption">📍 {area}</AppText>
            <AppText variant="caption">· ⭐ {shop.rating.toFixed(1)}</AppText>
            {km != null && <Badge text={t('kmAway', { n: km.toFixed(1) })} color={colors.sky} />}
          </Row>
          <AppText variant="caption" color={colors.text}>
            {description}
          </AppText>
          <AppText variant="caption">🕒 {shop.hours}</AppText>
        </View>
      </Row>
      <Row gap={space.sm} style={{ marginTop: space.md }}>
        <Action icon="call" label={t('call')} color={colors.primary} onPress={() => Linking.openURL(`tel:${shop.phone}`)} />
        <Action icon="logo-whatsapp" label={t('whatsapp')} color="#25D366" onPress={() => Linking.openURL(wa)} />
        <Action icon="navigate" label={t('directions')} color={colors.sky} onPress={() => Linking.openURL(maps)} />
      </Row>
    </GlassCard>
  );
}

function Action({ icon, label, color, onPress }: { icon: 'call' | 'logo-whatsapp' | 'navigate'; label: string; color: string; onPress: () => void }) {
  return (
    <PressableScale onPress={onPress} style={{ flex: 1, paddingVertical: 10, borderRadius: 14, backgroundColor: `${color}1F`, borderWidth: 1, borderColor: `${color}55`, alignItems: 'center' }}>
      <Ionicons name={icon} size={18} color={color} />
      <Text style={{ color, fontSize: 11, fontWeight: '800', marginTop: 2 }}>{label}</Text>
    </PressableScale>
  );
}
