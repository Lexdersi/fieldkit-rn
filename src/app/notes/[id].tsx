import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function NoteDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const scrollY = useRef(new Animated.Value(0)).current;

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
        <Text style={styles.headerTitle}>Note #{id}</Text>
        <TouchableOpacity style={styles.blockButton} onPress={blockJsthread}>
          <Text style={styles.blockButtonText}>Block JS (2s)</Text>
        </TouchableOpacity>
      </Animated.View>

      <Animated.ScrollView
        contentContainerStyle={styles.scrollContent}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        <Text style={styles.bodyText}>
          Scroll up and down to see the native-driver collapsing header in action.
        </Text>
        {Array.from({ length: 20 }).map((_, index) => (
          <View key={index} style={styles.dummyCard}>
            <Text style={styles.dummyText}>Field Note Paragraph Item {index + 1}</Text>
            <Text style={styles.dummySubtext}>
              Testing 60fps smooth scrolling performance on the UI thread.
            </Text>
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
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  blockButton: { backgroundColor: '#FF3B30', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
  blockButtonText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  scrollContent: { paddingTop: 110, paddingHorizontal: 16, paddingBottom: 40 },
  bodyText: { color: '#aaa', fontSize: 16, marginBottom: 16 },
  dummyCard: { backgroundColor: '#1a1a1a', padding: 16, borderRadius: 8, marginBottom: 12 },
  dummyText: { color: '#fff', fontSize: 15, fontWeight: '600', marginBottom: 4 },
  dummySubtext: { color: '#888', fontSize: 13 },
});