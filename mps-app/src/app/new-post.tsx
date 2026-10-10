import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { POST_TYPES } from '@/components/post-card';
import { AppText, Chip, GlassCard, GradientButton, Header, Input, PressableScale, Row, Screen } from '@/components/ui';
import { PostType, useData } from '@/lib/data';
import { useI18n } from '@/lib/i18n';
import { colors, radius, space } from '@/theme';

export default function NewPost() {
  const { t } = useI18n();
  const { addPost } = useData();
  const [type, setType] = useState<PostType>('question');
  const [text, setText] = useState('');
  const [image, setImage] = useState<string>();

  async function pick() {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.6 });
    if (!res.canceled && res.assets[0]) setImage(res.assets[0].uri);
  }

  return (
    <Screen header={<Header title={t('newPost')} />}>
      <Row gap={space.sm}>
        {(Object.keys(POST_TYPES) as PostType[]).map((k) => (
          <Chip key={k} emoji={POST_TYPES[k].emoji} label={t(k)} active={type === k} onPress={() => setType(k)} />
        ))}
      </Row>
      <GlassCard>
        <Input value={text} onChangeText={setText} placeholder={t('postPlaceholder')} multiline style={{ minHeight: 120, textAlignVertical: 'top' }} />
      </GlassCard>
      <PressableScale onPress={pick}>
        {image ? (
          <Image source={{ uri: image }} style={{ height: 240, borderRadius: radius.lg }} contentFit="cover" transition={300} />
        ) : (
          <View style={{ height: 110, borderRadius: radius.lg, borderWidth: 1.5, borderStyle: 'dashed', borderColor: colors.border, alignItems: 'center', justifyContent: 'center' }}>
            <AppText variant="caption">📷 {t('addPhoto')}</AppText>
          </View>
        )}
      </PressableScale>
      <GradientButton
        title={t('publish')}
        icon="paper-plane"
        disabled={!text.trim()}
        onPress={() => {
          addPost({ type, text: text.trim(), imageUri: image });
          router.back();
        }}
      />
    </Screen>
  );
}
