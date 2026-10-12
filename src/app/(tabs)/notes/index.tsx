import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { AccessibilityInfo, ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ConfirmSheet from '../../../components/ConfirmSheet';
import { noteA11yLabel } from '../../../features/notes/noteLogic';
import { NoteRow } from '../../../features/notes/NoteRow';
import { archiveNote, deleteNote, useNotes } from '../../../features/notes/notesStore';
import { useNow } from '../../../hooks/useNow';
import { SwipeRow } from '../../../features/notes/swipe/SwipeRow';
import type { Note } from '../../../features/notes/types';

export default function NotesListScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { notes, isLoading, serverError, refetch, isRefetching } = useNotes();
  const [pendingDelete, setPendingDelete] = useState<Note | null>(null);
  const now = useNow();

  const archive = (note: Note) => {
    archiveNote(queryClient, note.id);
    AccessibilityInfo.announceForAccessibility(`Archived ${note.title}`);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.headerRow}>
        <Text style={styles.header} accessibilityRole="header">
          Field Notes
        </Text>
        <Pressable
          style={styles.addButton}
          onPress={() => router.push('/compose')}
          accessibilityRole="button"
          accessibilityLabel="New note"
        >
          <Text style={styles.addButtonText}>+ New Note</Text>
        </Pressable>
      </View>

      {/* Server failed but notes on the device still show: a banner, not a dead end */}
      {serverError ? (
        <View style={styles.banner} accessibilityLiveRegion="polite">
          <Text style={styles.bannerText}>
            {"Can't reach the server. Showing notes saved on this device."}
          </Text>
          <Pressable onPress={() => refetch()} accessibilityRole="button" accessibilityLabel="Retry loading notes">
            <Text style={styles.bannerAction}>Retry</Text>
          </Pressable>
        </View>
      ) : null}

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#007AFF" accessibilityLabel="Loading field notes" />
        </View>
      ) : (
        <FlatList
          data={notes}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          onRefresh={refetch}
          refreshing={isRefetching}
          renderItem={({ item }) => (
            <SwipeRow
              label={noteA11yLabel(item, now)}
              onPress={() => router.push(`/notes/${item.id}`)}
              onArchive={() => archive(item)}
              onDelete={() => setPendingDelete(item)}
            >
              <NoteRow note={item} now={now} />
            </SwipeRow>
          )}
          ListEmptyComponent={<Text style={styles.empty}>No field notes yet.</Text>}
        />
      )}

      <ConfirmSheet
        visible={pendingDelete !== null}
        title="Delete note?"
        message={pendingDelete ? `"${pendingDelete.title}" will be removed from this device.` : undefined}
        onConfirm={() => {
          if (pendingDelete) {
            deleteNote(queryClient, pendingDelete.id);
            AccessibilityInfo.announceForAccessibility(`Deleted ${pendingDelete.title}`);
          }
          setPendingDelete(null);
        }}
        onCancel={() => setPendingDelete(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', paddingHorizontal: 16 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 12 },
  header: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  addButton: { backgroundColor: '#007AFF', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 6 },
  addButtonText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a1f00',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  bannerText: { color: '#FFCC66', flex: 1, marginRight: 12 },
  bannerAction: { color: '#fff', fontWeight: '700', padding: 4 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { paddingBottom: 20 },
  empty: { color: '#888', textAlign: 'center', marginTop: 40 },
});
