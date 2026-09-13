import React, { useState } from 'react';
import {
  FlatList,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// Generate 5,000 mock data items
const GENERATED_DATA = Array.from({ length: 5000 }, (_, index) => ({
  id: `item-${index}`,
  name: `Item #${index + 1} - Sample Note Record`,
}));

export default function Day5Screen() {
  const [mode, setMode] = useState<'flatlist' | 'scrollview'>('flatlist');
  const [refreshing, setRefreshing] = useState(false);
  const [mountTime, setMountTime] = useState<number | null>(null);

  const handleModeSwitch = (newMode: 'flatlist' | 'scrollview') => {
    const start = performance.now();
    setMode(newMode);
    // Measure render cycle completion
    setTimeout(() => {
      const end = performance.now();
      setMountTime(Math.round(end - start));
    }, 0);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Day 5 — Lists & Virtualization</Text>

      {/* Switcher Controls */}
      <View style={styles.toggleRow}>
        <TouchableOpacity
          style={[styles.toggleBtn, mode === 'flatlist' && styles.activeBtn]}
          onPress={() => handleModeSwitch('flatlist')}
        >
          <Text style={styles.btnText}>Use FlatList</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleBtn, mode === 'scrollview' && styles.activeBtn]}
          onPress={() => handleModeSwitch('scrollview')}
        >
          <Text style={styles.btnText}>Use ScrollView</Text>
        </TouchableOpacity>
      </View>

      {/* Metric Display */}
      <View style={styles.metricBox}>
        <Text style={styles.metricText}>
          Current Mode: <Text style={styles.highlight}>{mode.toUpperCase()}</Text>
        </Text>
        <Text style={styles.metricText}>
          Estimated Mount Time: <Text style={styles.highlight}>{mountTime !== null ? `${mountTime} ms` : 'N/A'}</Text>
        </Text>
      </View>

      {/* Conditional List Rendering */}
      {mode === 'flatlist' ? (
        <FlatList
          data={GENERATED_DATA}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <Text style={styles.rowText}>{item.name}</Text>
            </View>
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#0a84ff"
            />
          }
          ListEmptyComponent={<Text style={styles.emptyText}>No Items Found</Text>}
        />
      ) : (
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#0a84ff"
            />
          }
        >
          {GENERATED_DATA.map((item) => (
            <React.Fragment key={item.id}>
              <View style={styles.row}>
                <Text style={styles.rowText}>{item.name}</Text>
              </View>
              <View style={styles.separator} />
            </React.Fragment>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', paddingHorizontal: 16, paddingTop: 40 },
  header: { fontSize: 22, fontWeight: 'bold', color: '#fff', marginBottom: 16 },
  toggleRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  toggleBtn: { flex: 1, paddingVertical: 12, backgroundColor: '#1e1e1e', borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#333' },
  activeBtn: { backgroundColor: '#0a84ff', borderColor: '#0a84ff' },
  btnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  metricBox: { backgroundColor: '#1e1e1e', padding: 12, borderRadius: 8, marginBottom: 16, borderWidth: 1, borderColor: '#333' },
  metricText: { color: '#a1a1a1', fontSize: 14, marginBottom: 4 },
  highlight: { color: '#fff', fontWeight: 'bold' },
  row: { paddingVertical: 14, paddingHorizontal: 12 },
  rowText: { color: '#ffffff', fontSize: 15 },
  separator: { height: 1, backgroundColor: '#2c2c2e' },
  emptyText: { color: '#8e8e93', textAlign: 'center', marginTop: 20 },
});