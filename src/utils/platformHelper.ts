import { Platform } from 'react-native';

export function supportsFeatureX(): boolean {
  return Platform.OS === 'android'
    ? (Platform.Version as number) >= 31
    : parseInt(Platform.Version as string, 10) >= 15;
}