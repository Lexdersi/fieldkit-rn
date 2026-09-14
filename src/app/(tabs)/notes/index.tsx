import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Button, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HttpError, request } from '../../../services/api';
import { ReconnectingWebSocket } from '../../../services/websocket';

interface Note {
  id: string;
  title: string;
  content?: string;
}

export default function NotesListScreen() {
  const router = useRouter();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await request<Note[]>('https://jsonplaceholder.typicode.com/posts');
      setNotes(data);
    } catch (err: any) {
      if (err instanceof HttpError) {
        setError(`Server Error (${err.status}): ${err.body}`);
      } else {
        setError(err.message || 'An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  // WebSocket Live Updates Integration
  useEffect(() => {
    const ws = new ReconnectingWebSocket('ws://localhost:8080');

    const unsubscribe = ws.subscribe((data) => {
      console.log('[Live Update Received]:', data);
      // Optional: Handle incoming real-time notes updates here
    });

    return () => {
      unsubscribe();
      ws.close();
    };
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.header}>Field Notes</Text>
      
      {/* Action Buttons */}
      <View style={styles.actionRow}>
        <Button 
          title="Open Note #7" 
          onPress={() => router.push('/notes/7')} 
        />
        <Button 
          title="Compose New" 
          onPress={() => router.push('/compose')} 
          color="#007AFF"
        />
      </View>

      {/* 1. Loading State */}
      {loading && (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.subText}>Loading field notes...</Text>
        </View>
      )}

      {/* 2. Error-with-Retry State */}
      {!loading && error && (
        <View style={styles.centerContainer}>
          <Text style={styles.errorTitle}>Failed to load notes</Text>
          <Text style={styles.errorText}>{error}</Text>
          <Button title="Retry Request" onPress={fetchNotes} color="#FF3B30" />
        </View>
      )}

      {/* 3. Success State */}
      {!loading && !error && (
        <FlatList
          data={notes}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.noteCard}
              onPress={() => router.push(`/notes/${item.id}`)}
            >
              <Text style={styles.noteTitle}>{item.title}</Text>
              {item.content ? <Text style={styles.noteSnippet} numberOfLines={1}>{item.content}</Text> : null}
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No field notes found.</Text>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', padding: 16 },
  header: { color: '#fff', fontSize: 24, fontWeight: 'bold', marginBottom: 12 },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  subText: { color: '#888', marginTop: 10 },
  errorTitle: { color: '#FF3B30', fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  errorText: { color: '#aaa', textAlign: 'center', marginBottom: 16 },
  listContainer: { paddingBottom: 20 },
  noteCard: { backgroundColor: '#1E1E1E', padding: 16, borderRadius: 8, marginBottom: 12 },
  noteTitle: { color: '#fff', fontSize: 16, fontWeight: '600' },
  noteSnippet: { color: '#888', fontSize: 14, marginTop: 4 },
  emptyText: { color: '#888', textAlign: 'center', marginTop: 40 }
});