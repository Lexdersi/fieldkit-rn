import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { onlineManager, QueryClient } from '@tanstack/react-query';
import { registerNoteMutations } from '../features/notes/notesStore';

// React Query assumes "online" on native unless told otherwise. Without this,
// offline mutations fail instead of pausing, and the note is lost.
onlineManager.setEventListener((setOnline) =>
  NetInfo.addEventListener((state) => {
    setOnline(Boolean(state.isConnected));
  })
);

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 60 * 24, // 24 hours (formerly cacheTime)
      retry: 2,
    },
  },
});

registerNoteMutations(queryClient);

export const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
});

export const persistOptions = {
  persister: asyncStoragePersister,
  // The default maxAge is 24 h, after which the whole restored cache is discarded.
  // Device-only notes live in this cache, so it must never expire on its own.
  maxAge: Infinity,
  // Bump when the cached shape changes; a mismatch drops the old cache instead of
  // feeding stale shapes to new code.
  buster: 'notes-v2',
};
