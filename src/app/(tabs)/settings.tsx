import { getDeviceInfo, type DeviceInfo } from '@fieldkit/native-device-info';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SettingsScreen() {
  const router = useRouter();
  // Synchronous JSI calls: no await, no bridge round trip
  const [info, setInfo] = useState<DeviceInfo | null>(() => getDeviceInfo());

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.header} accessibilityRole="header">
        Settings
      </Text>

      <Text style={styles.section} accessibilityRole="header">
        Device (NativeDeviceInfo Turbo Module)
      </Text>
      {info ? (
        <View style={styles.card}>
          <Row label="Model" value={info.model} />
          <Row
            label="Battery"
            value={info.batteryLevel === null ? 'Unknown' : `${Math.round(info.batteryLevel * 100)}%`}
          />
          <Row label="Emulator" value={info.isEmulator ? 'Yes' : 'No'} />
          <Pressable
            style={styles.button}
            onPress={() => setInfo(getDeviceInfo())}
            accessibilityRole="button"
            accessibilityLabel="Refresh device info"
          >
            <Text style={styles.buttonText}>Refresh</Text>
          </Pressable>
        </View>
      ) : (
        <Text style={styles.muted}>
          {"Native module not linked. It needs a development or release build; Expo Go and web don't include it."}
        </Text>
      )}

      {__DEV__ ? (
        <Pressable style={styles.link} onPress={() => router.push('/swipe-lab')} accessibilityRole="button">
          <Text style={styles.linkText}>Swipe lab: PanResponder vs gesture-handler</Text>
        </Pressable>
      ) : null}
    </SafeAreaView>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  // One accessibility element per row, read as "Battery, 82%"
  return (
    <View style={styles.row} accessible accessibilityLabel={`${label}, ${value}`}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', paddingHorizontal: 16 },
  header: { color: '#fff', fontSize: 24, fontWeight: 'bold', marginVertical: 12 },
  section: { color: '#888', fontSize: 13, fontWeight: '600', textTransform: 'uppercase', marginBottom: 8 },
  card: { backgroundColor: '#1E1E1E', borderRadius: 8, padding: 16, marginBottom: 24 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  label: { color: '#aaa', fontSize: 16 },
  value: { color: '#fff', fontSize: 16, fontWeight: '600', flexShrink: 1, textAlign: 'right' },
  button: { marginTop: 8, alignSelf: 'flex-start', paddingVertical: 8 },
  buttonText: { color: '#8ab4ff', fontWeight: '600', fontSize: 16 },
  muted: { color: '#888', fontSize: 15, lineHeight: 21, marginBottom: 24 },
  link: { paddingVertical: 12 },
  linkText: { color: '#8ab4ff', fontSize: 16 },
});
