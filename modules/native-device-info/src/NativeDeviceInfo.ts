// Codegen spec. The filename must start with "Native": Codegen finds specs by
// filename, not content. The string below, Android's NAME and iOS's +moduleName
// must all be exactly "NativeDeviceInfo".
import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  // 0..1, or -1 when the OS can't say. `number` can't be nullable in a spec,
  // so "unknown" is a sentinel that index.ts turns into null.
  getBatteryLevel(): number;
  getModel(): string;
  isEmulator(): boolean;
}

// get, not getEnforcing: in Expo Go, on web and in Jest the module doesn't exist,
// and Settings should say so instead of crashing at import time.
export default TurboModuleRegistry.get<Spec>('NativeDeviceInfo');
