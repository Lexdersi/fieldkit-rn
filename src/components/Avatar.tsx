import { Image, StyleSheet, View } from 'react-native';

interface AvatarProps {
  uri: string;
  size?: number;
}

export function Avatar({ uri, size = 60 }: AvatarProps) {
  return (
    <View style={[styles.container, { width: size, height: size, borderRadius: size / 2 }]}>
      <Image
        source={{ uri, cache: 'force-cache' }}
        style={styles.image}
        resizeMode="cover"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#007AFF',
    backgroundColor: '#333',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});