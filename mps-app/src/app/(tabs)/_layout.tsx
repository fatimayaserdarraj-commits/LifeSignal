import { Redirect } from 'expo-router';
import { Tabs } from 'expo-router/js-tabs';

import { TabBar } from '@/components/tab-bar';
import { useAuth } from '@/lib/auth';
import { colors } from '@/theme';

export default function TabsLayout() {
  const { user } = useAuth();
  if (!user) return <Redirect href="/welcome" />;
  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: colors.bg }, animation: 'shift' }}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="scan" />
      <Tabs.Screen name="assistant" />
      <Tabs.Screen name="garden" />
      <Tabs.Screen name="community" />
    </Tabs>
  );
}
