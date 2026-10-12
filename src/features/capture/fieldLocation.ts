import * as Location from 'expo-location';
import type { Coords } from '../notes/types';
import { permissionState } from './permissions';

export interface FieldLocation {
  coords: Coords | null;
  locationNote: string | null; // why coords are missing, in words the user can act on
  blocked: boolean; // true → offer Linking.openSettings()
}

const FIX_TIMEOUT_MS = 8000;

// Never throws: a photo without coordinates is still a useful field note.
export async function getFieldLocation(): Promise<FieldLocation> {
  try {
    const state = permissionState(await Location.requestForegroundPermissionsAsync());
    if (state === 'blocked') {
      return { coords: null, locationNote: 'Location is turned off for FieldKit in Settings', blocked: true };
    }
    if (state !== 'granted') {
      return { coords: null, locationNote: 'No location: permission not given', blocked: false };
    }
    if (!(await Location.hasServicesEnabledAsync())) {
      return { coords: null, locationNote: 'No location: location services are off', blocked: false };
    }

    // Indoors a fresh fix can take a long time. Race it against a timeout and fall
    // back to the last known position, if it is recent enough to be honest.
    const fresh = await Promise.race([
      Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High }),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), FIX_TIMEOUT_MS)),
    ]);
    const fix = fresh ?? (await Location.getLastKnownPositionAsync({ maxAge: 5 * 60_000 }));
    if (!fix) {
      return { coords: null, locationNote: 'No location: no GPS fix', blocked: false };
    }

    const { latitude, longitude, accuracy } = fix.coords;
    return { coords: { latitude, longitude, accuracy }, locationNote: null, blocked: false };
  } catch {
    return { coords: null, locationNote: 'No location: GPS error', blocked: false };
  }
}
