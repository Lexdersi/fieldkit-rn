import { Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Animated, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { formatCoords } from '../../../features/notes/noteLogic';
import { useNotes } from '../../../features/notes/notesStore';

export default function NoteDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const note = useNotes().notes.find((n) => n.id === id);

  // Created once, without reading a ref during render
  const [scrollY] = useState(() => new Animated.Value(0));

  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, -50],
    extrapolate: 'clamp',
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const blockJsthread = () => {
    const start = Date.now();
    while (Date.now() - start < 2000) {
      // Synchronous heavy computation blocking the JS thread
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <Animated.View
        style={[
          styles.headerContainer,
          {
            transform: [{ translateY: headerTranslateY }],
            opacity: headerOpacity,
          },
        ]}
      >
        <Text style={styles.headerTitle} accessibilityRole="header" numberOfLines={1}>
          {note?.title ?? 'Note not found'}
        </Text>
        {/* Perf drill control for the Q2 measurement; never in a release build */}
        {__DEV__ && (
          <TouchableOpacity
            style={styles.blockButton}
            onPress={blockJsthread}
            accessibilityRole="button"
            accessibilityLabel="Block JavaScript thread for 2 seconds"
          >
            <Text style={styles.blockButtonText}>Block JS (2s)</Text>
          </TouchableOpacity>
        )}
      </Animated.View>

      <Animated.ScrollView
        contentContainerStyle={styles.scrollContent}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        {note?.photo ? (
          <Image
            source={{ uri: note.photo.uri }}
            style={styles.photo}
            accessible
            accessibilityRole="image"
            accessibilityLabel={
              note.photo.coords ? `Field photo taken at ${formatCoords(note.photo.coords)}` : 'Field photo, no location'
            }
          />
        ) : null}
        {note?.photo ? (
          <Text style={styles.metaText}>
            {note.photo.coords ? formatCoords(note.photo.coords) : note.photo.locationNote}
          </Text>
        ) : null}
        <Text style={styles.bodyText}>{note?.content || 'No content.'}</Text>

        {/* Day 11/Q2 scroll test: enough content to drive the collapsing header. Dev only */}
        {__DEV__ &&
          Array.from({ length: 20 }).map((_, index) => (
            <View key={index} style={styles.dummyCard}>
              <Text style={styles.dummyText}>Scroll test item {index + 1}</Text>
            </View>
          ))}
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
    backgroundColor: '#1E1E1E',
    paddingHorizontal: 16,
    paddingTop: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold', flex: 1, marginRight: 8 },
  blockButton: { backgroundColor: '#FF3B30', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
  blockButtonText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  scrollContent: { paddingTop: 110, paddingHorizontal: 16, paddingBottom: 40 },
  bodyText: { color: '#ddd', fontSize: 16, lineHeight: 24, marginBottom: 16 },
  photo: { width: '100%', aspectRatio: 4 / 3, borderRadius: 8, marginBottom: 8, backgroundColor: '#2a2a2a' },
  metaText: { color: '#888', fontSize: 13, marginBottom: 16 },
  dummyCard: { backgroundColor: '#1a1a1a', padding: 16, borderRadius: 8, marginBottom: 12 },
  dummyText: { color: '#fff', fontSize: 15, fontWeight: '600', marginBottom: 4 },
});