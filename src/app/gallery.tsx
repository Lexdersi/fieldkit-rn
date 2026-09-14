import { useEffect, useState } from 'react';
import { FlatList, Image, StyleSheet, Text, View } from 'react-native';

interface PhotoItem {
  id: string;
  url: string;
  title: string;
}

const SAMPLE_PHOTOS: PhotoItem[] = [
  { id: '1', url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb', title: 'Mountain Vista' },
  { id: '2', url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05', title: 'Forest Trail' },
  { id: '3', url: 'https://images.unsplash.com/photo-1426604966848-d7adac902bff', title: 'Canyon River' },
  { id: '4', url: 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606', title: 'Snowy Peak' },
];

export default function GalleryScreen() {
  const [cacheStatuses, setCacheStatuses] = useState<Record<string, string>>({});
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function checkAndPrefetchImages() {
      const statuses: Record<string, string> = {};

      for (const photo of SAMPLE_PHOTOS) {
        // Check initial cache state
        const cacheState = await Image.queryCache(photo.url);
        statuses[photo.id] = cacheState ? JSON.stringify(cacheState) : 'uncached';

        // Prefetch uncached images
        if (!cacheState) {
          await Image.prefetch(photo.url);
          const postState = await Image.queryCache(photo.url);
          console.log(`[Image Prefetch]: Loaded and cached ${photo.title}`, postState);
        }
      }

      setCacheStatuses(statuses);
    }

    checkAndPrefetchImages();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>FieldKit Gallery</Text>
      <Text style={styles.subHeader}>Zero-Shift Image Grid & Cache Inspector</Text>

      <FlatList
        data={SAMPLE_PHOTOS}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.gridContainer}
        renderItem={({ item }) => {
          const hasFailed = failedImages[item.id];

          return (
            <View style={styles.card}>
              {/* Reserved aspect-ratio box prevents layout shift */}
              <View style={styles.imageWrapper}>
                <Image
                  source={
                    hasFailed
                      ? require('../../assets/images/cats/check.png') // Fallback bundled asset
                      : { uri: item.url, cache: 'force-cache' }
                  }
                  style={styles.image}
                  resizeMode="cover"
                  defaultSource={require('../../assets/images/cats/check.png')}
                  onError={() => setFailedImages((prev) => ({ ...prev, [item.id]: true }))}
                />
              </View>
              <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
              <Text style={styles.cacheText}>
                Cache: {cacheStatuses[item.id] || 'Checking...'}
              </Text>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', padding: 16, paddingTop: 60 },
  header: { color: '#fff', fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
  subHeader: { color: '#888', fontSize: 14, marginBottom: 16 },
  gridContainer: { paddingBottom: 20 },
  card: { flex: 1, backgroundColor: '#1E1E1E', margin: 6, borderRadius: 8, padding: 8, overflow: 'hidden' },
  imageWrapper: { width: '100%', height: 140, borderRadius: 6, overflow: 'hidden', backgroundColor: '#2a2a2a' },
  image: { width: '100%', height: '100%' },
  title: { color: '#fff', fontSize: 14, fontWeight: '600', marginTop: 8 },
  cacheText: { color: '#00F0FF', fontSize: 10, marginTop: 2 },
});