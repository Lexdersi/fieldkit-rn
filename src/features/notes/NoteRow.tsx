import { Image, StyleSheet, Text, View } from 'react-native';
import { formatCoords, formatRelativeTime } from './noteLogic';
import type { Note } from './types';

// Visual content of a note row. Not focusable on its own: the swipe row wrapping it
// is the single accessibility element and carries noteA11yLabel.
export function NoteRow({ note, now }: { note: Note; now: number }) {
  return (
    <View style={styles.row}>
      {note.photo ? <Image source={{ uri: note.photo.uri }} style={styles.thumb} /> : null}
      <View style={styles.body}>
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={2}>
            {note.title}
          </Text>
          {note.syncFailed ? (
            <Text style={[styles.badge, styles.failed]}>Sync failed</Text>
          ) : note.pending ? (
            <Text style={[styles.badge, styles.pending]}>Pending sync</Text>
          ) : null}
        </View>
        {note.content ? (
          <Text style={styles.snippet} numberOfLines={1}>
            {note.content}
          </Text>
        ) : null}
        <Text style={styles.meta}>
          {[
            note.photo?.coords ? formatCoords(note.photo.coords) : note.photo?.locationNote,
            note.updatedAt > 0 ? formatRelativeTime(note.updatedAt, now) : null,
          ]
            .filter(Boolean)
            .join(' · ')}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', backgroundColor: '#1E1E1E', padding: 16, borderRadius: 8 },
  thumb: { width: 48, height: 48, borderRadius: 6, marginRight: 12, backgroundColor: '#2a2a2a' },
  body: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center' },
  title: { color: '#fff', fontSize: 16, fontWeight: '600', flex: 1, marginRight: 8 },
  badge: { fontSize: 12, fontWeight: '600', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  pending: { color: '#FF9500', backgroundColor: '#332200' },
  failed: { color: '#FF453A', backgroundColor: '#3a1210' },
  snippet: { color: '#888', fontSize: 14, marginTop: 4 },
  meta: { color: '#666', fontSize: 12, marginTop: 4 },
});
