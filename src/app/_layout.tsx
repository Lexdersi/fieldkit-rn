import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { Stack } from 'expo-router';
import { useNetworkSync } from '../hooks/useNetworkSync';
import { asyncStoragePersister, queryClient } from '../services/queryClient';

function MainNavigator() {
  useNetworkSync(); // Initializes AppState and NetInfo monitors
  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister: asyncStoragePersister }}
      // Paused mutations are persisted by default; resume them once the cache is restored
      onSuccess={() => queryClient.resumePausedMutations()}
    >
      <MainNavigator />
    </PersistQueryClientProvider>
  );
}