import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { FlatList, Keyboard, KeyboardAvoidingView, Platform, StyleSheet, TextInput, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TypingDots } from '@/components/animated';
import { AppText, Badge, Header, IconButton, PressableScale, Row, ScreenBackground, TAB_BAR_SPACE } from '@/components/ui';
import { plantById } from '@/data/plants';
import { aiOnline, chatReply } from '@/lib/ai';
import { ChatMessage, useData } from '@/lib/data';
import { useI18n } from '@/lib/i18n';
import { uid } from '@/lib/storage';
import { colors, font, gradients, radius, space } from '@/theme';

const message = (role: ChatMessage['role'], text: string): ChatMessage => ({ id: uid(), role, text, at: Date.now() });

export default function Assistant() {
  const { t, lang, isRTL, l } = useI18n();
  const insets = useSafeAreaInsets();
  const { chat, setChat, plants } = useData();
  const params = useLocalSearchParams<{ prefill?: string }>();
  const [text, setText] = useState('');
  const [typing, setTyping] = useState(false);
  const [kbOpen, setKbOpen] = useState(false);
  const list = useRef<FlatList<ChatMessage>>(null);

  // Pre-fill the composer when another screen hands over a question.
  const [prefill, setPrefill] = useState<string | undefined>();
  if (params.prefill !== prefill) {
    setPrefill(params.prefill);
    if (params.prefill) setText(params.prefill);
  }

  useEffect(() => {
    const a = Keyboard.addListener('keyboardDidShow', () => setKbOpen(true));
    const b = Keyboard.addListener('keyboardDidHide', () => setKbOpen(false));
    return () => {
      a.remove();
      b.remove();
    };
  }, []);

  const welcome: ChatMessage = { id: 'welcome', role: 'assistant', text: t('chatWelcome'), at: 0 };
  const messages = [welcome, ...chat];

  async function send(body = text) {
    const q = body.trim();
    if (!q || typing) return;
    setText('');
    const userMsg = message('user', q);
    const history = [...chat, userMsg];
    setChat(history);
    setTyping(true);
    const garden = plants
      .map((p) => {
        const s = plantById(p.speciesId);
        return `${p.nickname || (s ? l(s.name) : 'plant')} (${s?.scientific ?? 'unknown'}, ${p.location})`;
      })
      .join('; ');
    try {
      const reply = await chatReply(history, garden, lang);
      setChat([...history, message('assistant', reply)]);
    } catch {
      setChat([...history, message('assistant', `⚠️ ${t('error')}`)]);
    } finally {
      setTyping(false);
    }
  }

  const suggestions = [t('suggestion1'), t('suggestion2'), t('suggestion3'), t('suggestion4')];

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScreenBackground />
      <View style={{ height: insets.top }} />
      <Header
        back={false}
        title={t('assistantTitle')}
        subtitle={t('assistantSubtitle')}
        right={chat.length ? <IconButton icon="trash-outline" onPress={() => setChat([])} /> : undefined}
      />
      <Row justify="center" style={{ marginBottom: space.sm }}>
        <Badge text={aiOnline ? `● ${t('aiOnline')}` : `○ ${t('aiOffline')}`} color={aiOnline ? colors.primary : colors.sun} />
      </Row>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <FlatList
          ref={list}
          data={messages}
          keyExtractor={(m) => m.id}
          contentContainerStyle={{ padding: space.lg, gap: space.md }}
          onContentSizeChange={() => list.current?.scrollToEnd({ animated: true })}
          renderItem={({ item }) => <Bubble m={item} isRTL={isRTL} />}
          ListFooterComponent={
            <View style={{ gap: space.md }}>
              {typing && (
                <Animated.View entering={FadeIn} style={[styles.bubble, styles.bot, { alignSelf: isRTL ? 'flex-end' : 'flex-start' }]}>
                  <TypingDots />
                </Animated.View>
              )}
              {chat.length === 0 && (
                <View style={{ gap: space.sm, marginTop: space.sm }}>
                  {suggestions.map((s, i) => (
                    <Animated.View key={s} entering={FadeInDown.delay(150 + i * 90)}>
                      <PressableScale onPress={() => send(s)} style={styles.suggestion}>
                        <Row gap={space.sm}>
                          <Ionicons name="sparkles" size={14} color={colors.lime} />
                          <AppText variant="caption" color={colors.text} style={{ flex: 1 }}>
                            {s}
                          </AppText>
                        </Row>
                      </PressableScale>
                    </Animated.View>
                  ))}
                </View>
              )}
            </View>
          }
        />
        <View style={{ paddingHorizontal: space.lg, paddingTop: space.sm, paddingBottom: kbOpen ? space.sm : TAB_BAR_SPACE + insets.bottom - 20 }}>
          <Row gap={space.sm} style={styles.composer}>
            <TextInput
              value={text}
              onChangeText={setText}
              placeholder={t('chatPlaceholder')}
              placeholderTextColor={colors.textFaint}
              selectionColor={colors.primary}
              multiline
              style={{ flex: 1, color: colors.text, fontSize: font.sizes.md, maxHeight: 110, paddingVertical: 10, textAlign: isRTL ? 'right' : 'left' }}
            />
            <PressableScale onPress={() => send()} disabled={!text.trim() || typing}>
              <LinearGradient colors={gradients.primary} style={styles.send}>
                <Ionicons name="arrow-up" size={22} color="#05210F" />
              </LinearGradient>
            </PressableScale>
          </Row>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

function Bubble({ m, isRTL }: { m: ChatMessage; isRTL: boolean }) {
  const mine = m.role === 'user';
  const start = isRTL ? 'flex-end' : 'flex-start';
  const end = isRTL ? 'flex-start' : 'flex-end';
  return (
    <Animated.View entering={(mine ? FadeInUp : FadeInDown).springify().damping(16)} style={{ alignSelf: mine ? end : start, maxWidth: '86%' }}>
      {mine ? (
        <LinearGradient colors={gradients.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.bubble, styles.mine]}>
          <AppText color="#05210F">{m.text}</AppText>
        </LinearGradient>
      ) : (
        <Row gap={space.sm} align="flex-end">
          <View style={styles.botAvatar}>
            <AppText style={{ fontSize: 16 }}>🌿</AppText>
          </View>
          <View style={[styles.bubble, styles.bot, { flexShrink: 1 }]}>
            <AppText>{m.text}</AppText>
          </View>
        </Row>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  bubble: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: radius.lg },
  mine: { borderBottomRightRadius: 6 },
  bot: { backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: colors.border, borderBottomLeftRadius: 6 },
  botAvatar: { width: 30, height: 30, borderRadius: 15, backgroundColor: 'rgba(61,220,132,0.2)', alignItems: 'center', justifyContent: 'center' },
  suggestion: { padding: 14, borderRadius: radius.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  composer: { backgroundColor: 'rgba(10,30,20,0.9)', borderWidth: 1, borderColor: colors.border, borderRadius: 26, paddingHorizontal: 14, paddingVertical: 6 },
  send: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
});

