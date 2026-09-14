import { useRouter } from 'expo-router';
import { Button, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function NotesListScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.header}>Field Notes</Text>
      
      {/* Tap to view note detail */}
      <Button 
        title="Open Note #7" 
        onPress={() => router.push('/notes/7')} 
      />

      {/* Tap to open global modal */}
      <Button 
        title="Compose New Note" 
        onPress={() => router.push('/compose')} 
        color="#007AFF"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', padding: 16 },
  header: { color: '#fff', fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
});