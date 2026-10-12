import { Stack } from 'expo-router';
import { useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { PanSwipeRow } from '../features/notes/swipe/PanSwipeRow';
import { SwipeRow } from '../features/notes/swipe/SwipeRow';

// Day 12: the same row twice, inside the same vertical FlatList, for a side-by-side
// feel test. Dev only (linked from Settings when __DEV__).
const ITEMS = Array.from({ length: 30 }, (_, i) => ({
  id: String(i),
  kind: i % 2 === 0 ? 'PanResponder' : 'gesture-handler',
}));

export default function SwipeLabScreen() {
  const [log, setLog] = useState('Swipe a row left. Short springs back, long archives.');

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: true, title: 'Swipe lab' }} />
      <Text style={styles.log} accessibilityLiveRegion="polite">
        {log}
      </Text>
      <FlatList
        data={ITEMS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const Row = item.kind === 'PanResponder' ? PanSwipeRow : SwipeRow;
          const name = `${item.kind} row ${item.id}`;
          return (
            <Row
              label={name}
              onPress={() => setLog(`Pressed ${name}`)}
              onArchive={() => setLog(`Archived ${name}`)}
              onDelete={() => setLog(`Delete ${name}`)}
            >
              <View style={styles.row}>
                <Text style={styles.rowText}>{name}</Text>
              </View>
            </Row>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', padding: 16 },
  log: { color: '#00F0FF', marginBottom: 12 },
  row: { backgroundColor: '#1E1E1E', padding: 20, borderRadius: 8 },
  rowText: { color: '#fff', fontSize: 16 },
});
