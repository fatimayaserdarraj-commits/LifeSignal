import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, TextInput, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { PostCard, useTimeAgo } from '@/components/post-card';
import { AppText, GlassCard, Header, PressableScale, Row, Screen } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { useData } from '@/lib/data';
import { useI18n } from '@/lib/i18n';
import { colors, font, space } from '@/theme';

export default function PostDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, isRTL } = useI18n();
  const { isGuest } = useAuth();
  const { posts, addComment } = useData();
  const ago = useTimeAgo();
  const [text, setText] = useState('');
  const post = posts.find((p) => p.id === id);
  if (!post) return <Screen header={<Header title="" />}>{null}</Screen>;

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Screen header={<Header title={t('comments')} />}>
        <PostCard post={post} full />
        <AppText variant="h2">
          {t('comments')} ({post.comments.length})
        </AppText>
        {post.comments.map((c, i) => (
          <Animated.View key={c.id} entering={FadeInDown.delay(i * 60)}>
            <GlassCard padding={space.md}>
              <Row justify="space-between">
                <AppText variant="h2" style={{ fontSize: 15 }}>
                  {c.authorName}
                </AppText>
                <AppText variant="caption">{ago(c.at)}</AppText>
              </Row>
              <AppText style={{ marginTop: 4 }}>{c.text}</AppText>
            </GlassCard>
          </Animated.View>
        ))}
        {isGuest ? (
          <AppText variant="caption" center>
            {t('loginRequired')}
          </AppText>
        ) : (
          <Row gap={space.sm} style={{ backgroundColor: colors.surface, borderRadius: 24, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 14 }}>
            <TextInput
              value={text}
              onChangeText={setText}
              placeholder={t('writeComment')}
              placeholderTextColor={colors.textFaint}
              style={{ flex: 1, color: colors.text, fontSize: font.sizes.md, paddingVertical: 12, textAlign: isRTL ? 'right' : 'left' }}
            />
            <PressableScale
              disabled={!text.trim()}
              onPress={() => {
                addComment(post.id, text.trim());
                setText('');
              }}>
              <View style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="send" size={16} color="#05210F" style={{ transform: [{ scaleX: isRTL ? -1 : 1 }] }} />
              </View>
            </PressableScale>
          </Row>
        )}
      </Screen>
    </KeyboardAvoidingView>
  );
}
