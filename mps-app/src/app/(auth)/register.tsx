import { Link, router } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { AuthShell } from '@/components/auth-shell';
import { AppText, GradientButton, Input, ProgressBar, Row } from '@/components/ui';
import { passwordScore, useAuth, validEmail, validPassword } from '@/lib/auth';
import { useI18n } from '@/lib/i18n';
import { TKey } from '@/lib/translations';
import { colors } from '@/theme';

type Field = 'name' | 'email' | 'password' | 'confirm';

export default function Register() {
  const { t } = useI18n();
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState<Partial<Record<Field, TKey>>>({});
  const [loading, setLoading] = useState(false);

  const set = (k: Field) => (v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const score = passwordScore(form.password);
  const strength = score < 0.5 ? { label: t('weak'), color: colors.coral } : score < 0.85 ? { label: t('medium'), color: colors.sun } : { label: t('strong'), color: colors.primary };

  async function submit() {
    const e: Partial<Record<Field, TKey>> = {};
    if (!form.name.trim()) e.name = 'errName';
    if (!validEmail(form.email)) e.email = 'errEmail';
    if (!validPassword(form.password)) e.password = 'errPassword';
    if (form.password !== form.confirm) e.confirm = 'errMatch';
    setErrors(e);
    if (Object.keys(e).length) return;
    setLoading(true);
    const err = await register(form.name, form.email, form.password);
    setLoading(false);
    if (err) return setErrors({ email: err });
    router.replace('/(tabs)');
  }

  const err = (k: Field) => (errors[k] ? t(errors[k]!) : undefined);

  return (
    <AuthShell
      title={t('registerTitle')}
      subtitle={t('registerSubtitle')}
      footer={
        <Row justify="center" gap={6}>
          <AppText variant="caption">{t('alreadyAccount')}</AppText>
          <Link href="/login" replace>
            <Text style={{ color: colors.primary, fontWeight: '800' }}>{t('signIn')}</Text>
          </Link>
        </Row>
      }>
      <Input label={t('name')} icon="person-outline" value={form.name} onChangeText={set('name')} autoComplete="name" error={err('name')} />
      <Input
        label={t('email')}
        icon="mail-outline"
        value={form.email}
        onChangeText={set('email')}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        placeholder="name@example.com"
        error={err('email')}
      />
      <View style={{ gap: 8 }}>
        <Input label={t('password')} icon="lock-closed-outline" value={form.password} onChangeText={set('password')} secure autoComplete="new-password" error={err('password')} />
        {form.password.length > 0 && (
          <View style={{ gap: 6 }}>
            <ProgressBar value={score} color={strength.color} height={6} />
            <AppText variant="caption" color={strength.color}>
              {t('passwordStrength')}: {strength.label}
            </AppText>
          </View>
        )}
      </View>
      <Input label={t('confirmPassword')} icon="shield-checkmark-outline" value={form.confirm} onChangeText={set('confirm')} secure error={err('confirm')} onSubmitEditing={submit} />
      <GradientButton title={t('signUp')} icon="sparkles" onPress={submit} loading={loading} />
    </AuthShell>
  );
}
