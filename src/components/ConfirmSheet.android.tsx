import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

interface ConfirmSheetProps {
  visible: boolean;
  title: string;
  message?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmSheet({ visible, title, message, onConfirm, onCancel }: ConfirmSheetProps) {
  if (!visible) return null;

  return (
    <Modal transparent animationType="slide" visible={visible}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <Text style={styles.title}>{title}</Text>
          {message && <Text style={styles.message}>{message}</Text>}
          <Pressable style={styles.confirmButton} onPress={onConfirm}>
            <Text style={styles.confirmText}>Confirm</Text>
          </Pressable>
          <Pressable style={styles.cancelButton} onPress={onCancel}>
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  sheet: { backgroundColor: '#1E1E1E', padding: 20, borderTopLeftRadius: 16, borderTopRightRadius: 16 },
  title: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  message: { color: '#888', fontSize: 14, marginBottom: 20 },
  confirmButton: { backgroundColor: '#FF3B30', padding: 14, borderRadius: 8, alignItems: 'center', marginBottom: 10 },
  confirmText: { color: '#fff', fontWeight: '600' },
  cancelButton: { padding: 14, alignItems: 'center' },
  cancelText: { color: '#888', fontWeight: '600' },
});