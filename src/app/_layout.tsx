import { Stack } from 'expo-router';
import { NotesProvider } from '../context/NotesContext';

export default function RootLayout() {
  return (
    <NotesProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen 
          name="compose" 
          options={{ 
            presentation: 'modal',
            headerShown: true,
            title: 'New Note'
          }} 
        />
      </Stack>
    </NotesProvider>
  );
}