import { CameraView, useCameraPermissions } from 'expo-camera';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, AppState, Image, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { formatCoords } from '../notes/noteLogic';
import type { FieldPhoto } from '../notes/types';
import { getFieldLocation, type FieldLocation } from './fieldLocation';
import { permissionState } from './permissions';

type Step = 'explain' | 'camera' | 'locating' | 'review';

interface Shot {
  tempUri: string;
  location: FieldLocation;
}

interface Props {
  // The caller copies the file into Documents when the note is saved (savePhoto)
  onDone: (photo: FieldPhoto) => void;
  onCancel: () => void;
}

export function CaptureFlow({ onDone, onCancel }: Props) {
  const [permission, requestPermission, getPermission] = useCameraPermissions();
  const camera = permissionState(permission);
  const [step, setStep] = useState<Step>('explain');
  const [cameraReady, setCameraReady] = useState(false);
  const [shot, setShot] = useState<Shot | null>(null);
  const cameraRef = useRef<CameraView>(null);

  // Coming back from Settings: re-read the permission instead of trusting stale state
  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => {
      if (next === 'active') getPermission();
    });
    return () => sub.remove();
  }, [getPermission]);

  // Already allowed (an earlier capture): skip the explanation
  const showCamera = step === 'camera' || (step === 'explain' && camera === 'granted');

  const takePhoto = async () => {
    const photo = await cameraRef.current?.takePictureAsync({ quality: 0.7 });
    if (!photo) return;
    setStep('locating');
    // Location is asked for here, right after the shot: the prompt arrives with its reason
    setShot({ tempUri: photo.uri, location: await getFieldLocation() });
    setStep('review');
  };

  if (camera === 'loading') {
    return <ActivityIndicator style={styles.fill} accessibilityLabel="Checking camera access" />;
  }

  if (showCamera) {
    return (
      <View style={styles.fill}>
        <CameraView ref={cameraRef} style={styles.fill} facing="back" onCameraReady={() => setCameraReady(true)} />
        <SafeAreaView edges={['bottom']} style={styles.cameraBar}>
          <Pressable onPress={onCancel} accessibilityRole="button" style={styles.barButton}>
            <Text style={styles.barText}>Cancel</Text>
          </Pressable>
          <Pressable
            onPress={takePhoto}
            disabled={!cameraReady}
            accessibilityRole="button"
            accessibilityLabel="Take photo"
            accessibilityState={{ disabled: !cameraReady }}
            style={[styles.shutter, !cameraReady && styles.disabled]}
          />
          <View style={styles.barButton} />
        </SafeAreaView>
      </View>
    );
  }

  if (step === 'locating') {
    return (
      <View style={[styles.fill, styles.center]} accessibilityLiveRegion="polite">
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.body}>Getting your location…</Text>
      </View>
    );
  }

  if (step === 'review' && shot) {
    const { coords, locationNote, blocked } = shot.location;
    return (
      <SafeAreaView style={[styles.fill, styles.pad]}>
        <Image
          source={{ uri: shot.tempUri }}
          style={styles.preview}
          accessible
          accessibilityRole="image"
          accessibilityLabel="Photo you just took"
        />
        <Text style={styles.body} accessibilityLiveRegion="polite">
          {coords ? `Location: ${formatCoords(coords)}` : locationNote}
        </Text>
        {blocked ? <LinkButton label="Open Settings to allow location" onPress={() => Linking.openSettings()} /> : null}
        <PrimaryButton
          label="Use photo"
          onPress={() => onDone({ uri: shot.tempUri, coords, locationNote })}
        />
        <LinkButton
          label="Retake"
          onPress={() => {
            setShot(null);
            setStep('camera');
          }}
        />
      </SafeAreaView>
    );
  }

  // Explanation before any system prompt. On iOS the camera prompt is shown once
  // and never again; asking cold is the fastest way to a permanent "no".
  return (
    <SafeAreaView style={[styles.fill, styles.pad, styles.center]}>
      <Text style={styles.title} accessibilityRole="header">
        Add a field photo
      </Text>

      {camera === 'blocked' ? (
        <>
          <Text style={styles.body}>
            Camera access is turned off for FieldKit. The only way to turn it back on is in Settings.
          </Text>
          <Text style={styles.body}>You can still save the note without a photo.</Text>
          <PrimaryButton label="Open Settings" onPress={() => Linking.openSettings()} />
        </>
      ) : (
        <>
          <Text style={styles.body}>
            FieldKit uses the camera to photograph the site, then stamps the photo with your GPS position so
            the note shows where it was taken.
          </Text>
          {camera === 'denied' ? (
            <Text style={styles.body} accessibilityLiveRegion="polite">
              {"Camera access wasn't allowed. You can still save the note without a photo."}
            </Text>
          ) : null}
          <PrimaryButton
            label={camera === 'denied' ? 'Ask again' : 'Continue'}
            onPress={async () => {
              const res = await requestPermission();
              if (res.granted) setStep('camera');
            }}
          />
        </>
      )}
      <LinkButton label="Not now" onPress={onCancel} />
    </SafeAreaView>
  );
}

function PrimaryButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable style={styles.primary} onPress={onPress} accessibilityRole="button">
      <Text style={styles.primaryText}>{label}</Text>
    </Pressable>
  );
}

function LinkButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable style={styles.link} onPress={onPress} accessibilityRole="button">
      <Text style={styles.linkText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: '#121212' },
  center: { justifyContent: 'center' },
  pad: { padding: 24 },
  title: { color: '#fff', fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  body: { color: '#ccc', fontSize: 16, lineHeight: 22, marginBottom: 16 },
  preview: { width: '100%', aspectRatio: 3 / 4, borderRadius: 8, marginBottom: 16, backgroundColor: '#2a2a2a' },
  primary: { backgroundColor: '#007AFF', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  primaryText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  link: { padding: 14, alignItems: 'center' },
  linkText: { color: '#8ab4ff', fontWeight: '600', fontSize: 16 },
  cameraBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
  },
  barButton: { width: 72 },
  barText: { color: '#fff', fontSize: 16 },
  shutter: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#fff', borderWidth: 4, borderColor: '#bbb' },
  disabled: { opacity: 0.4 },
});
