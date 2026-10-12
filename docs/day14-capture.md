# Day 14 – Capture in the field

Compose → **Add field photo** → photo → GPS stamp → saved under Documents → attached to the note.

| Piece | File |
|---|---|
| Flow and screens | `src/features/capture/CaptureFlow.tsx` |
| Permission states (pure) | `src/features/capture/permissions.ts` |
| Location, never throws | `src/features/capture/fieldLocation.ts` |
| Copy out of the camera cache | `src/features/capture/savePhoto.ts` |
| Wiring | `src/app/compose.tsx` |

## Permissions

Camera is asked for after an explanation screen, never on launch. On iOS the system prompt is
shown once; asking cold is how you get a permanent "no". Location is asked for right after the
photo is taken, so the prompt shows up when its reason is obvious.

| State | Camera | Location |
|---|---|---|
| Not asked yet | Explanation screen → Continue → system prompt | Prompt after the shot |
| Granted | Camera opens (explanation skipped next time) | Coordinates saved with the photo |
| Denied, can ask again | "Ask again" + "Not now"; note can be saved without a photo | Photo saved, "No location: permission not given" |
| Denied forever | "Open Settings" (`Linking.openSettings()`), no prompt button | Photo saved, plus an "Open Settings to allow location" button |
| Location services off | n/a | Photo saved, "No location: location services are off" |
| No fix within 8 s | n/a | Falls back to last known position ≤ 5 min old, else "No location: no GPS fix" |

When the app comes back to the foreground (from Settings), the camera permission is re-read
(`AppState` → `getPermission()`), so granting it in Settings takes effect without restarting.

Every failure path degrades: you can always save the note, with or without a photo, with or
without coordinates. Covered by `permissions-test.ts` (all five states) and
`CaptureFlow-test.tsx` (explain-then-ask, blocked → Settings, carry on without a photo).

## Files

The camera's `uri` points into the cache directory, which the OS may clear. On Save, the photo
is copied to `Paths.document/field-photos/<clientId>.jpg` (new `File`/`Directory` API,
SDK 57). Deleting a note deletes its photo. Retake throws the cache file away without copying.

## What `expo prebuild` changed

Run with `npx expo prebuild --platform android`. `android/` is generated output under
Continuous Native Generation and is gitignored; hand edits there would be lost on the next run.

Tracked files prebuild touched:
- `app.json`: added `android.package` (`com.anonymous.hellorn`, a placeholder; set a real
  id before publishing) and an explicit `android.permissions` list.
- `package.json`: `android`/`ios` scripts changed from `expo start --android` to
  `expo run:android`. Correct now: the app has custom native code (the Day 18 module), so it can't
  run in Expo Go anymore.

Generated `android/app/src/main/AndroidManifest.xml`:
- `CAMERA`, `ACCESS_FINE_LOCATION`, `ACCESS_COARSE_LOCATION` from the expo-camera / expo-location
  config plugins. No `RECORD_AUDIO`: `recordAudioAndroid: false` in the camera plugin, because
  FieldKit doesn't record video.
- Also present: `SYSTEM_ALERT_WINDOW` and `READ/WRITE_EXTERNAL_STORAGE`, from template defaults.
  FieldKit uses none of them; reviewers flag the overlay permission. Now listed in
  `android.blockedPermissions`, so the next prebuild strips them.
- `gradle.properties`: `newArchEnabled=true`, `hermesEnabled=true`.

iOS (`Info.plist`): `NSCameraUsageDescription` and `NSLocationWhenInUseUsageDescription` come from
the plugin strings in `app.json`. Not generated here: prebuild for iOS needs a Mac for pod install.

## Still to do on a device

- [ ] Development or release build installed on a physical phone
- [ ] Deny camera twice on Android (→ "don't ask again"), confirm the Settings screen appears
- [ ] Turn location services off, take a photo, confirm the note saves with the "services are off" message
