import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useNotes } from '../context/NotesContext';

export default function ComposeScreen() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const { addNote } = useNotes();
  const router = useRouter();

  const handleSave = () => {
    if (!title.trim()) return;
    addNote(title, content);
    router.back();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Note Title</Text>
      <TextInput 
        style={styles.input} 
        placeholder="Enter title..." 
        placeholderTextColor="#666"
        value={title}
        onChangeText={setTitle}
      />

      <Text style={styles.label}>Content</Text>
      <TextInput 
        style={[styles.input, styles.textArea]} 
        placeholder="Write details..." 
        placeholderTextColor="#666"
        multiline
        value={content}
        onChangeText={setContent}
      />

      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>Save Note</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#121212' },
  label: { color: '#fff', fontSize: 14, marginBottom: 8, fontWeight: '600' },
  input: { backgroundColor: '#1e1e1e', color: '#fff', padding: 12, borderRadius: 8, marginBottom: 16, fontSize: 16 },
  textArea: { height: 120, textAlignVertical: 'top' },
  button: { backgroundColor: '#007AFF', padding: 16, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});