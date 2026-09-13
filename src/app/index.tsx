import { useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

// 1. Reusable AppButton Component
type AppButtonProps = {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  loading?: boolean;
};

export function AppButton({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
}: AppButtonProps) {
  const isInteractive = !disabled && !loading;

  return (
    <Pressable
      onPress={isInteractive ? onPress : undefined}
      accessibilityRole="button"
      accessibilityState={{ disabled: !isInteractive, busy: loading }}
      hitSlop={8}
      android_ripple={
        isInteractive
          ? { color: 'rgba(255, 255, 255, 0.2)', borderless: false }
          : undefined
      }
      style={({ pressed }) => [
        styles.buttonBase,
        styles[variant],
        disabled && styles.disabled,
        // Opacity feedback for iOS
        pressed && isInteractive && Platform.OS === 'ios' && styles.pressed,
      ]}
    >
      {loading ? (
        <ActivityIndicator color="#ffffff" />
      ) : (
        <Text style={styles.buttonText}>{title}</Text>
      )}
    </Pressable>
  );
}

// 2. Main Day 4 Screen
export default function Day4Screen() {
  const [loading, setLoading] = useState(false);

  const handlePress = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Day 4 — Touch & Press</Text>

      {/* Button Variants */}
      <View style={styles.section}>
        <Text style={styles.label}>AppButton Variants</Text>
        <AppButton
          title="Primary Button"
          onPress={handlePress}
          variant="primary"
          loading={loading}
        />
        <AppButton
          title="Secondary Button"
          onPress={handlePress}
          variant="secondary"
        />
        <AppButton
          title="Danger Button"
          onPress={handlePress}
          variant="danger"
        />
        <AppButton title="Disabled Button" onPress={handlePress} disabled />
      </View>

      {/* 24x24 Icon Button with hitSlop */}
      <View style={styles.section}>
        <Text style={styles.label}>
          24x24 Icon Button (Effective Target ~48pt via hitSlop)
        </Text>
        <Pressable
          onPress={() => alert('Icon Tapped!')}
          hitSlop={12} // 24 + 12 top/bottom/left/right = 48x48
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.iconButton,
            pressed && styles.pressed,
          ]}
        >
          <Text style={{ color: '#fff', fontSize: 12 }}>★</Text>
        </Pressable>
      </View>

      {/* Bounds Clipping Bug Demo */}
      <View style={styles.section}>
        <Text style={styles.label}>Bounds Clipping Demo</Text>
        <Text style={styles.subtext}>
          The red box overflows its parent. Tap the overflowing part—it won't
          trigger because touches cannot escape parent bounds!
        </Text>
        <View style={styles.parentBox}>
          <Pressable
            onPress={() => alert('Parent Bound Tap Worked!')}
            style={styles.overflowingChild}
          >
            <Text style={{ color: '#fff', fontSize: 10 }}>Overflow Touch</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#121212',
    flexGrow: 1,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#a1a1a1',
    marginBottom: 10,
  },
  subtext: {
    fontSize: 12,
    color: '#8e8e93',
    marginBottom: 10,
  },
  buttonBase: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  primary: {
    backgroundColor: '#0a84ff',
  },
  secondary: {
    backgroundColor: '#3a3a3c',
  },
  danger: {
    backgroundColor: '#ff453a',
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  iconButton: {
    width: 24,
    height: 24,
    backgroundColor: '#3a3a3c',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  parentBox: {
    width: 200,
    height: 50,
    backgroundColor: '#1e1e1e',
    borderWidth: 1,
    borderColor: '#333',
    overflow: 'visible',
  },
  overflowingChild: {
    position: 'absolute',
    top: 25,
    left: 100,
    width: 120,
    height: 50,
    backgroundColor: '#ff3b30',
    justify: 'center',
    alignItems: 'center',
  },
});