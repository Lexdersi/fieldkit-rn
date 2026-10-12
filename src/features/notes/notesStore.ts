import { useQuery, type QueryClient } from '@tanstack/react-query';
import { File } from 'expo-file-system';
import { Alert } from 'react-native';
import { request } from '../../services/api';
import { mergeNotes, toLocalNote } from './noteLogic';
import type { NewNote, Note } from './types';

const API = 'https://jsonplaceholder.typicode.com/posts';

export const notesKeys = {
  server: ['notes', 'server'] as const,
  // Device-only state. Never refetched; it lives in the persisted query cache.
  local: ['notes', 'local'] as const,
  hidden: ['notes', 'hidden'] as const,
};

interface ApiPost {
  id: number;
  title: string;
  body: string;
}

async function fetchServerNotes(): Promise<Note[]> {
  const posts = await request<ApiPost[]>(API);
  // The API has no timestamps; 0 means "unknown" and the row hides the time
  return posts.map((p) => ({ id: String(p.id), title: p.title, content: p.body, updatedAt: 0 }));
}

function updateLocal(queryClient: QueryClient, fn: (notes: Note[]) => Note[]) {
  queryClient.setQueryData<Note[]>(notesKeys.local, (old = []) => fn(old));
}

export function registerNoteMutations(queryClient: QueryClient) {
  // Registered once at startup, not in a component: a paused mutation restored from
  // storage after an app restart needs these to resume and to finish the bookkeeping.
  queryClient.setMutationDefaults(['createNote'], {
    mutationFn: (note: NewNote) =>
      request(API, {
        method: 'POST',
        body: JSON.stringify({ title: note.title, body: note.content, photo: note.photo }),
        headers: { 'Content-Type': 'application/json', 'Idempotency-Key': note.clientId },
      }),
    // Runs before the request, and before the pause when offline: the note is on the
    // device the moment Save is pressed.
    onMutate: (note: NewNote) => {
      updateLocal(queryClient, (notes) => [toLocalNote(note), ...notes]);
    },
    onSuccess: (_data: unknown, note: NewNote) => {
      updateLocal(queryClient, (notes) =>
        notes.map((n) => (n.id === note.clientId ? { ...n, pending: false, syncFailed: false } : n))
      );
    },
    onError: (error: Error, note: NewNote) => {
      updateLocal(queryClient, (notes) =>
        notes.map((n) => (n.id === note.clientId ? { ...n, pending: false, syncFailed: true } : n))
      );
      // Can fire long after Compose has closed (a resumed mutation), so it lives here
      Alert.alert('Saved on this device only', `"${note.title}" was rejected by the server: ${error.message}`);
    },
  });
}

// Archive and delete are device-local: the demo API does not persist writes.
export function archiveNote(queryClient: QueryClient, id: string) {
  queryClient.setQueryData<string[]>(notesKeys.hidden, (old = []) => [...new Set([...old, id])]);
}

export function deleteNote(queryClient: QueryClient, id: string) {
  archiveNote(queryClient, id);
  const note = queryClient.getQueryData<Note[]>(notesKeys.local)?.find((n) => n.id === id);
  if (note?.photo) {
    try {
      new File(note.photo.uri).delete();
    } catch {
      // Already gone. Nothing to clean up.
    }
  }
  updateLocal(queryClient, (notes) => notes.filter((n) => n.id !== id));
}

export function useNotes() {
  const server = useQuery({ queryKey: notesKeys.server, queryFn: fetchServerNotes });

  // Device-only queries: queryFn just returns what is already cached, so a global
  // refetch (useNetworkSync on foreground) can never reset them to empty.
  const local = useQuery({
    queryKey: notesKeys.local,
    queryFn: ({ client }) => client.getQueryData<Note[]>(notesKeys.local) ?? [],
    staleTime: Infinity,
    gcTime: Infinity,
  });
  const hidden = useQuery({
    queryKey: notesKeys.hidden,
    queryFn: ({ client }) => client.getQueryData<string[]>(notesKeys.hidden) ?? [],
    staleTime: Infinity,
    gcTime: Infinity,
  });

  const notes = mergeNotes(local.data ?? [], server.data ?? [], new Set(hidden.data));

  return {
    notes,
    isLoading: server.isLoading && notes.length === 0,
    // Server failed but local notes still show; the screen decides how loud to be
    serverError: server.error,
    refetch: server.refetch,
    isRefetching: server.isRefetching,
  };
}
