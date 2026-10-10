import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring } from 'react-native-reanimated';

import { useAuth } from '@/lib/auth';
import { Post, PostType, useData } from '@/lib/data';
import { useI18n } from '@/lib/i18n';
import { colors, gradients, space } from '@/theme';

import { AppText, Badge, GlassCard, PressableScale, Row } from './ui';

export const POST_TYPES: Record<PostType, { emoji: string; color: string }> = {
  question: { emoji: '❓', color: colors.sky },
  showcase: { emoji: '📸', color: colors.violet },
  tip: { emoji: '💡', color: colors.sun },
};

export function useTimeAgo() {
  const { t } = useI18n();
  return (at: number) => {
    const m = Math.floor((Date.now() - at) / 60000);
    if (m < 1) return t('justNow');
    if (m < 60) return t('minAgo', { n: m });
    if (m < 1440) return t('hourAgo', { n: Math.floor(m / 60) });
    return t('dayAgo', { n: Math.floor(m / 1440) });
  };
}

export function LikeButton({ post }: { post: Post }) {
  const { user, isGuest } = useAuth();
  const { toggleLike } = useData();
  const liked = !!user && post.likes.includes(user.id);
  const s = useSharedValue(1);
  useEffect(() => {
    if (liked) s.value = withSequence(withSpring(1.45, { damping: 4 }), withSpring(1));
  }, [liked, s]);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));
  return (
    <PressableScale onPress={() => !isGuest && toggleLike(post.id)} disabled={isGuest}>
      <Row gap={6}>
        <Animated.View style={style}>
          <Ionicons name={liked ? 'heart' : 'heart-outline'} size={22} color={liked ? colors.coral : colors.textDim} />
        </Animated.View>
        <Text style={{ color: colors.textDim, fontWeight: '700' }}>{post.likes.length}</Text>
      </Row>
    </PressableScale>
  );
}

export function PostCard({ post, full }: { post: Post; full?: boolean }) {
  const { t } = useI18n();
  const ago = useTimeAgo();
  const type = POST_TYPES[post.type];
  return (
    <PressableScale scaleTo={0.98} haptic={false} disabled={full} onPress={() => router.push({ pathname: '/post/[id]', params: { id: post.id } })}>
      <GlassCard>
        <Row gap={space.md}>
          <LinearGradient colors={gradients.mint} style={{ width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontWeight: '900', color: '#05210F' }}>{post.authorName[0]?.toUpperCase()}</Text>
          </LinearGradient>
          <View style={{ flex: 1 }}>
            <AppText variant="h2">{post.authorName}</AppText>
            <AppText variant="caption">{ago(post.at)}</AppText>
          </View>
          <Badge text={`${type.emoji} ${t(post.type)}`} color={type.color} />
        </Row>
        <AppText style={{ marginTop: space.md }} numberOfLines={full ? undefined : 5}>
          {post.text}
        </AppText>
        {post.imageUri ? <Image source={{ uri: post.imageUri }} style={{ height: 220, borderRadius: 16, marginTop: space.md }} contentFit="cover" transition={300} /> : null}
        <Row gap={space.xl} style={{ marginTop: space.md }}>
          <LikeButton post={post} />
          <Row gap={6}>
            <Ionicons name="chatbubble-outline" size={20} color={colors.textDim} />
            <Text style={{ color: colors.textDim, fontWeight: '700' }}>{post.comments.length}</Text>
          </Row>
        </Row>
      </GlassCard>
    </PressableScale>
  );
}
