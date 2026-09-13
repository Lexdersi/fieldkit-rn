import { useRef, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

export default function NoteComposer() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [tag, setTag] = useState('');

  // Ref for focus management from Title -> Body
  const bodyRef = useRef<TextInput>(null);

  // Validation: Title required & max 60 chars
  const isTitleInvalid = title.trim().length === 0 || title.length > 60;

  const handleSave = () => {
    if (isTitleInvalid) return;
    alert(`Note Saved!\nTitle: ${title}\nTag: ${tag}`);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.header}>Note Composer</Text>

          {/* Title Input */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Title *</Text>
            <TextInput
              style={[styles.input, isTitleInvalid && styles.inputError]}
              value={title}
              onChangeText={setTitle}
              placeholder="Enter title..."
              placeholderTextColor="#8e8e93"
              returnKeyType="next"
              onSubmitEditing={() => bodyRef.current?.focus()}
              blurOnSubmit={false}
              maxLength={60}
            />
            {/* Accessibility Character Counter */}
            <Text
              style={styles.charCounter}
              accessibilityLiveRegion="polite"
            >
              {60 - title.length} characters remaining
            </Text>
          </View>

          {/* Body Input */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Body</Text>
            <TextInput
              ref={bodyRef}
              style={[styles.input, styles.multilineInput]}
              value={body}
              onChangeText={setBody}
              placeholder="Write your note here..."
              placeholderTextColor="#8e8e93"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Tag Input */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Tag</Text>
            <TextInput
              style={styles.input}
              value={tag}
              onChangeText={setTag}
              placeholder="e.g. Work, Ideas"
              placeholderTextColor="#8e8e93"
              autoCapitalize="words"
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={Keyboard.dismiss}
            />
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={[styles.button, isTitleInvalid && styles.buttonDisabled]}
            onPress={handleSave}
            disabled={isTitleInvalid}
          >
            <Text style={styles.buttonText}>Save Note</Text>
          </TouchableOpacity>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  scrollContent: {
    padding: 20,
    paddingTop: 60,
    flexGrow: 1,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 20,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#a1a1a1',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#1e1e1e',
    color: '#ffffff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#333333',
  },
  inputError: {
    borderColor: '#ff453a',
  },
  multilineInput: {
    minHeight: 100,
  },
  charCounter: {
    fontSize: 12,
    color: '#8e8e93',
    textAlign: 'right',
    marginTop: 4,
  },
  button: {
    backgroundColor: '#0a84ff',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#3a3a3c',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});