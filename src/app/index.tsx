import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Simulated fetch function for notes
const fetchNotes = async () => {
  const response = await fetch('https://jsonplaceholder.typicode.com/posts');
  if (!response.ok) throw new Error('Failed to fetch notes');
  return response.json();
};

export default function NotesListScreen() {
  const router = useRouter();
  const { data: notes, isLoading, isError, refetch } = useQuery({
    queryKey: ['notes'],
    queryFn: fetchNotes,
  });

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.subText}>Loading notes...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorTitle}>Connection Error</Text>
        <Text style={styles.errorText}>Could not load notes. Showing cached data if available.</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.header}>Field Notes</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => router.push('/compose')}>
          <Text style={styles.addButtonText}>+ New Note</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={notes}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.noteCard}
            onPress={() => router.push(`/notes/${item.id}`)}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.noteTitle} numberOfLines={1}>{item.title}</Text>
              {item.pending && <Text style={styles.pendingBadge}>Pending Sync</Text>}
            </View>
            {item.content ? <Text style={styles.noteSnippet} numberOfLines={1}>{item.content}</Text> : null}
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No field notes found.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', padding: 16, paddingTop: 60 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  header: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  addButton: { backgroundColor: '#007AFF', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6 },
  addButtonText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212', padding: 20 },
  subText: { color: '#888', marginTop: 10 },
  errorTitle: { color: '#FF3B30', fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  errorText: { color: '#aaa', textAlign: 'center', marginBottom: 16 },
  retryButton: { backgroundColor: '#333', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 6 },
  retryButtonText: { color: '#fff', fontWeight: '600' },
  listContainer: { paddingBottom: 20 },
  noteCard: { backgroundColor: '#1E1E1E', padding: 16, borderRadius: 8, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  noteTitle: { color: '#fff', fontSize: 16, fontWeight: '600', flex: 1, marginRight: 8 },
  noteSnippet: { color: '#888', fontSize: 14, marginTop: 4 },
  pendingBadge: { color: '#FF9500', fontSize: 12, fontWeight: '600', backgroundColor: '#332200', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  emptyText: { color: '#888', textAlign: 'center', marginTop: 40 }
});