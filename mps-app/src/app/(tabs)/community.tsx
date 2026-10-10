import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, View } from 'react-native';

import { POST_TYPES, PostCard } from '@/components/post-card';
import { Appear, Chip, GradientButton, Header, Row, Screen } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { PostType, useData } from '@/lib/data';
import { useI18n } from '@/lib/i18n';
import { space } from '@/theme';

export default function Community() {
  const { t } = useI18n();
  const { isGuest } = useAuth();
  const { posts } = useData();
  const [filter, setFilter] = useState<PostType | 'all'>('all');
  const visible = filter === 'all' ? posts : posts.filter((p) => p.type === filter);

  return (
    <Screen tabBar header={<Header back={false} title={t('communityTitle')} subtitle={t('communitySubtitle')} />}>
      <GradientButton
        title={t('newPost')}
        icon="create-outline"
        gradient="lime"
        onPress={() => (isGuest ? Alert.alert(t('loginRequired'), undefined, [{ text: t('cancel') }, { text: t('signUp'), onPress: () => router.push('/register') }]) : router.push('/new-post'))}
      />
      <Row gap={space.sm} wrap>
        <Chip label={t('all')} active={filter === 'all'} onPress={() => setFilter('all')} />
        {(Object.keys(POST_TYPES) as PostType[]).map((k) => (
          <Chip key={k} emoji={POST_TYPES[k].emoji} label={t(k)} active={filter === k} onPress={() => setFilter(k)} />
        ))}
      </Row>
      <View style={{ gap: space.md }}>
        {visible.map((p, i) => (
          <Appear key={p.id} index={i}>
            <PostCard post={p} />
          </Appear>
        ))}
      </View>
    </Screen>
  );
}
