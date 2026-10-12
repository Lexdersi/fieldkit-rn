import { onlineManager, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Button, StyleSheet, TextInput, View } from 'react-native';
import type { NewNote } from '../services/queryClient';

export default function ComposeScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  // mutationFn comes from setMutationDefaults(['createNote']) in services/queryClient
  const createNoteMutation = useMutation({
    mutationKey: ['createNote'],
    onMutate: async (newNote: NewNote) => {
      await queryClient.cancelQueries({ queryKey: ['notes'] });
      const previousNotes = queryClient.getQueryData(['notes']);

      queryClient.setQueryData(['notes'], (old: any[] = []) => [
        { id: `temp-${Date.now()}`, ...newNote, pending: true },
        ...old,
      ]);

      return { previousNotes };
    },
    onError: (err, newNote, context) => {
      if (context?.previousNotes) {
        queryClient.setQueryData(['notes'], context.previousNotes);
      }
      // The text stays in the inputs so the user can retry
      Alert.alert('Note not saved', 'The server rejected the note. Your text is still here, try again.');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });

  const handleSubmit = () => {
    if (!title.trim()) return;
    createNoteMutation.mutate(
      { title, content },
      {
        onSuccess: () => {
          router.back(); // Return to list view after submission
        },
      }
    );

    // Offline the mutation pauses rather than failing, and it is persisted with
    // the query cache, so it survives an app restart and resumes on reconnect.
    if (!onlineManager.isOnline()) {
      Alert.alert('Saved on this device', 'You are offline. The note will sync when you reconnect.');
      router.back();
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Note Title"
        placeholderTextColor="#888"
        accessibilityLabel="Note title"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Write your note content here..."
        placeholderTextColor="#888"
        accessibilityLabel="Note content"
        multiline
        value={content}
        onChangeText={setContent}
      />
      <Button
        title="Save Note"
        onPress={handleSubmit}
        // Announced as dimmed/disabled by VoiceOver and TalkBack until there is a title
        disabled={!title.trim() || createNoteMutation.isPending}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', padding: 16 },
  input: { backgroundColor: '#1E1E1E', color: '#fff', padding: 12, borderRadius: 8, marginBottom: 12 },
  textArea: { height: 120, textAlignVertical: 'top' },
});