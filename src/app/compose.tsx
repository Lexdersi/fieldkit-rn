import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Button, StyleSheet, TextInput, View } from 'react-native';

export default function ComposeScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const createNoteMutation = useMutation({
    mutationFn: async (newNote: { title: string; content: string }) => {
      const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
        method: 'POST',
        body: JSON.stringify(newNote),
        headers: { 'Content-Type': 'application/json' },
      });
      return response.json();
    },
    onMutate: async (newNote) => {
      await queryClient.cancelQueries({ queryKey: ['notes'] });
      const previousNotes = queryClient.getQueryData(['notes']);

      queryClient.setQueryData(['notes'], (old: any[] = []) => [
        { id: `temp-${Date.now()}`, ...newNote, pending: true },
        ...old,
      ]);

      return { previousNotes };
    },
    onError: (err, newNote, context: any) => {
      if (context?.previousNotes) {
        queryClient.setQueryData(['notes'], context.previousNotes);
      }
      Alert.alert('Offline Mode', 'Note saved locally and will sync when reconnected.');
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
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Note Title"
        placeholderTextColor="#888"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Write your note content here..."
        placeholderTextColor="#888"
        multiline
        value={content}
        onChangeText={setContent}
      />
      <Button title="Save Note" onPress={handleSubmit} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', padding: 16 },
  input: { backgroundColor: '#1E1E1E', color: '#fff', padding: 12, borderRadius: 8, marginBottom: 12 },
  textArea: { height: 120, textAlignVertical: 'top' },
});