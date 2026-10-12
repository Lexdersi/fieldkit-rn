import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { onlineManager, QueryClient } from '@tanstack/react-query';
import { request } from './api';

export interface NewNote {
  title: string;
  content: string;
}

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

// Registered at module level so a paused mutation restored from storage after
// an app restart still has a mutationFn to resume with.
queryClient.setMutationDefaults(['createNote'], {
  mutationFn: (newNote: NewNote) =>
    request('https://jsonplaceholder.typicode.com/posts', {
      method: 'POST',
      body: JSON.stringify(newNote),
      headers: { 'Content-Type': 'application/json' },
    }),
});

export const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
});
