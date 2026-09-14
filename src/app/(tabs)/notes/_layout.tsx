import { Stack } from 'expo-router';

export default function NotesStackLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Notes List' }} />
      <Stack.Screen name="[id]" options={{ title: 'Note Detail' }} />
      <Stack.Screen name="edit" options={{ title: 'Edit Note' }} />
    </Stack>
  );
}