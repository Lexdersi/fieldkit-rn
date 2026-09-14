import { router, useLocalSearchParams } from 'expo-router';
import { Button, StyleSheet, Text, View } from 'react-native';

type NoteParams = { id: string };

export default function NoteDetail() {
  const { id } = useLocalSearchParams<NoteParams>();

  return (
    <View style={styles.container}>
      <Text>Note ID: {id}</Text>
      <Button 
  title="Edit Note" 
  onPress={() => router.push(`/notes/edit?id=${id}`)} 
/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 10 },
});