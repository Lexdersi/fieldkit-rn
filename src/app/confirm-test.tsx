import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import ConfirmSheet from '../components/ConfirmSheet';

export default function ConfirmTestScreen() {
  const [visible, setVisible] = useState(false);
  const [status, setStatus] = useState('Idle');

  const handlePress = () => {
    if (Platform.OS === 'ios') {
      // iOS ActionSheetIOS is invoked directly via function call
      ConfirmSheet({
        title: 'Delete Note?',
        onConfirm: () => setStatus('Deleted!'),
        onCancel: () => setStatus('Cancelled'),
      });
    } else {
      // Android uses the modal component state
      setVisible(true);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Platform Confirm Sheet Drill</Text>
      <Text style={styles.status}>Status: {status}</Text>
      
<Pressable style={styles.button} onPress={handlePress}>
        <Text style={styles.buttonText}>Trigger Confirm Sheet</Text>
      </Pressable>

      {/* Android Modal Component Render */}
      <ConfirmSheet
        visible={visible}
        title="Delete Note?"
        message="This action cannot be undone."
        onConfirm={() => {
          setVisible(false);
          setStatus('Deleted!');
        }}
        onCancel={() => {
          setVisible(false);
          setStatus('Cancelled');
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 12 },
  status: { color: '#888', fontSize: 16, marginBottom: 24 },
  button: { backgroundColor: '#00F0FF', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8 },
  buttonText: { color: '#121212', fontWeight: 'bold', fontSize: 16 },
});