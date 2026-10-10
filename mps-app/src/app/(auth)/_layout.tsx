import { Redirect, Stack } from 'expo-router';

import { useAuth } from '@/lib/auth';
import { colors } from '@/theme';

export default function AuthLayout() {
  const { user, isGuest } = useAuth();
  // Signed-in users skip the auth flow; guests may still open it to create an account.
  if (user && !isGuest) return <Redirect href="/(tabs)" />;
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg }, animation: 'slide_from_right' }} />;
}
