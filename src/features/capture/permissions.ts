// Pure mapping from Expo's PermissionResponse to the states the UI has to handle.
export type PermissionState = 'loading' | 'undetermined' | 'granted' | 'denied' | 'blocked';

interface PermissionLike {
  granted: boolean;
  canAskAgain: boolean;
  status: string;
}

export function permissionState(res: PermissionLike | null): PermissionState {
  if (!res) return 'loading';
  if (res.granted) return 'granted';
  // Denied and the OS won't show the prompt again (Android "don't ask again", or iOS
  // after the one-shot prompt). Linking.openSettings() is the only way back.
  if (!res.canAskAgain) return 'blocked';
  return res.status === 'undetermined' ? 'undetermined' : 'denied';
}
