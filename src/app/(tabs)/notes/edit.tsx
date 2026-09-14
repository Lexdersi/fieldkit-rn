import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function NoteEditScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Text style={styles.title}>Editing Note: {id}</Text>
      <Button 
        title="Save & Return" 
        onPress={() => router.back()} 
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', padding: 16, justifyContent: 'center' },
  title: { color: '#fff', fontSize: 18, marginBottom: 16, textAlign: 'center' },
});