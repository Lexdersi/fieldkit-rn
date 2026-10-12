import NativeDeviceInfo from './NativeDeviceInfo';

export interface DeviceInfo {
  batteryLevel: number | null; // 0..1
  model: string;
  isEmulator: boolean;
}

// null when the native module isn't linked (Expo Go, web, Jest)
export function getDeviceInfo(): DeviceInfo | null {
  if (!NativeDeviceInfo) return null;
  const level = NativeDeviceInfo.getBatteryLevel();
  return {
    batteryLevel: level < 0 ? null : level,
    model: NativeDeviceInfo.getModel(),
    isEmulator: NativeDeviceInfo.isEmulator(),
  };
}
