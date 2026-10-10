import { Link, router } from 'expo-router';
import { useState } from 'react';
import { Text } from 'react-native';

import { AuthShell } from '@/components/auth-shell';
import { AppText, GradientButton, Input, Row } from '@/components/ui';
import { useAuth, validEmail } from '@/lib/auth';
import { useI18n } from '@/lib/i18n';
import { TKey } from '@/lib/translations';
import { colors } from '@/theme';

export default function Login() {
  const { t } = useI18n();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<TKey | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!validEmail(email)) return setError('errEmail');
    if (!password) return setError('errCredentials');
    setLoading(true);
    const err = await login(email, password);
    setLoading(false);
    if (err) return setError(err);
    router.replace('/(tabs)');
  }

  return (
    <AuthShell
      title={t('loginTitle')}
      subtitle={t('loginSubtitle')}
      footer={
        <Row justify="center" gap={6}>
          <AppText variant="caption">{t('noAccount')}</AppText>
          <Link href="/register" replace>
            <Text style={{ color: colors.primary, fontWeight: '800' }}>{t('signUp')}</Text>
          </Link>
        </Row>
      }>
      <Input
        label={t('email')}
        icon="mail-outline"
        value={email}
        onChangeText={(v) => {
          setEmail(v);
          setError(null);
        }}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        placeholder="name@example.com"
      />
      <Input
        label={t('password')}
        icon="lock-closed-outline"
        value={password}
        onChangeText={(v) => {
          setPassword(v);
          setError(null);
        }}
        secure
        autoComplete="password"
        placeholder="••••••••"
        error={error ? t(error) : undefined}
        onSubmitEditing={submit}
      />
      <GradientButton title={t('signIn')} icon="log-in-outline" onPress={submit} loading={loading} />
    </AuthShell>
  );
}
