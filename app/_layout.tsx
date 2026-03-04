import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="dark" backgroundColor="#f0eaf8" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="picDetail" options={{ headerShown: false, presentation: 'card' }} />
          <Stack.Screen name="musicDetail" options={{ headerShown: false, presentation: 'card' }} />
          <Stack.Screen name="videoDetail" options={{ headerShown: false, presentation: 'card' }} />
          <Stack.Screen name="activityDetail" options={{ headerShown: false, presentation: 'card' }} />
          <Stack.Screen name="museumDetail" options={{ headerShown: false, presentation: 'card' }} />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
