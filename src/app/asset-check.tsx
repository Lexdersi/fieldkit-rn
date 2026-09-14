import { Image, StyleSheet, Text, View } from 'react-native';

export default function AssetCheckScreen() {
  // Resolve the bundled asset to see which file the runtime selected
  const resolved = Image.resolveAssetSource(require('../../assets/images/cats/check.png'));
  console.log('Resolved asset details:', resolved);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Asset Verification</Text>
      <Text style={styles.pathText}>Loaded path/URI:</Text>
      <Text style={styles.uriText}>{resolved.uri}</Text>
      <Text style={styles.dimText}>Dimensions: {resolved.width} x {resolved.height}</Text>

      {/* Render the density-checked asset */}
      <Image 
        source={require('../../assets/images/cats/check.png')} 
        style={{ width: resolved.width / 2, height: resolved.height / 2, marginTop: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', padding: 20, justifyContent: 'center', alignItems: 'center' },
  title: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 12 },
  pathText: { color: '#888', fontSize: 14 },
  uriText: { color: '#00F0FF', fontSize: 12, textAlign: 'center', marginVertical: 8 },
  dimText: { color: '#fff', fontSize: 14, marginBottom: 20 }
});