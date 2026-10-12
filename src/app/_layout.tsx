import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useNetworkSync } from '../hooks/useNetworkSync';
import { persistOptions, queryClient } from '../services/queryClient';

function MainNavigator() {
  useNetworkSync(); // Initializes AppState and NetInfo monitors
  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  return (
    // Swipe rows use gesture-handler, which needs this root above every gesture
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={persistOptions}
        // Paused mutations are persisted by default; resume them once the cache is restored
        onSuccess={() => queryClient.resumePausedMutations()}
      >
        <MainNavigator />
      </PersistQueryClientProvider>
    </GestureHandlerRootView>
  );
}
