import { onlineManager, useMutation } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { AccessibilityInfo, Alert, Button, Image, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { CaptureFlow } from '../features/capture/CaptureFlow';
import { savePhoto } from '../features/capture/savePhoto';
import { formatCoords } from '../features/notes/noteLogic';
import type { FieldPhoto, NewNote } from '../features/notes/types';

export default function ComposeScreen() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [photo, setPhoto] = useState<FieldPhoto | null>(null);
  const [capturing, setCapturing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Everything else (mutationFn, save on device, sync state, error alert) comes from
  // registerNoteMutations. Don't add callbacks here: useMutation options replace the
  // registered defaults rather than merging with them.
  const createNote = useMutation<unknown, Error, NewNote>({ mutationKey: ['createNote'] });

  const handleSubmit = async () => {
    if (!title.trim()) return;
    setSaving(true);
    const clientId = `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    try {
      const saved = photo ? { ...photo, uri: await savePhoto(photo.uri, clientId) } : null;
      createNote.mutate({ clientId, title: title.trim(), content, createdAt: Date.now(), photo: saved });
    } catch {
      setSaving(false);
      Alert.alert('Photo not saved', 'The photo could not be stored. Remove it or try again.');
      return;
    }

    // The note is on the device now, online or not. The list shows its sync state.
    AccessibilityInfo.announceForAccessibility(
      onlineManager.isOnline() ? 'Note saved' : 'Note saved on this device. It will sync when you reconnect.'
    );
    router.back();
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

      {photo ? (
        <View style={styles.photoRow}>
          <Image
            source={{ uri: photo.uri }}
            style={styles.thumb}
            accessible
            accessibilityRole="image"
            accessibilityLabel="Attached field photo"
          />
          <Text style={styles.photoMeta}>{photo.coords ? formatCoords(photo.coords) : photo.locationNote}</Text>
          <Pressable onPress={() => setPhoto(null)} accessibilityRole="button" accessibilityLabel="Remove photo">
            <Text style={styles.remove}>Remove</Text>
          </Pressable>
        </View>
      ) : (
        <Pressable style={styles.photoButton} onPress={() => setCapturing(true)} accessibilityRole="button">
          <Text style={styles.photoButtonText}>Add field photo</Text>
        </Pressable>
      )}

      <Button
        title="Save Note"
        onPress={handleSubmit}
        // Announced as dimmed/disabled by VoiceOver and TalkBack until there is a title
        disabled={!title.trim() || saving}
      />

      <Modal visible={capturing} animationType="slide" onRequestClose={() => setCapturing(false)}>
        <CaptureFlow
          onDone={(p) => {
            setPhoto(p);
            setCapturing(false);
          }}
          onCancel={() => setCapturing(false)}
        />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', padding: 16, paddingTop: 60 },
  input: { backgroundColor: '#1E1E1E', color: '#fff', padding: 12, borderRadius: 8, marginBottom: 12 },
  textArea: { height: 120, textAlignVertical: 'top' },
  photoButton: { borderWidth: 1, borderColor: '#333', borderRadius: 8, padding: 14, alignItems: 'center', marginBottom: 16 },
  photoButtonText: { color: '#8ab4ff', fontWeight: '600' },
  photoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  thumb: { width: 56, height: 56, borderRadius: 6, marginRight: 12 },
  photoMeta: { color: '#aaa', flex: 1, fontSize: 13 },
  remove: { color: '#FF453A', fontWeight: '600', padding: 8 },
});
