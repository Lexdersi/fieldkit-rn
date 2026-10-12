# Day 20 – Capstone Defence (FieldKit)

Notes for the 15-minute panel. Everything here points at a real file in this repo.
Anything in `[brackets]` is a number I still have to measure on the device. I won't make one up.

Per-lesson write-ups: `day12-gestures.md`, `day14-capture.md`, `day15-testing.md`, `day18-native-module.md`.

---

## 0. Where the app actually is (12 Oct)

| Check | Start of day | Now |
|---|---|---|
| `npm run typecheck` | **10 errors** | 0 |
| `npm run lint` | never run | 0 problems |
| `npm test` | no tests | 37 passing, 1 snapshot, 5 suites |
| CI | none | `.github/workflows/ci.yml`: typecheck, lint, jest on every push |
| Android release build | never built | **Incomplete.** `./gradlew assembleRelease` ran 752 tasks with no errors (including the native module's Codegen and Kotlin compile), then was stopped because the machine ran out of memory. No APK yet |
| iOS build | never built | **Not built.** Needs a Mac or EAS. The iOS native code is unverified |
| Accessibility props in `src/` | 0 | Core flow labelled, swipe has accessibility actions. **Not yet tested with a screen reader** |
| Gestures (Day 12) | none | Swipe to archive/delete, PanResponder + gesture-handler |
| Device capability (Day 14) | none | Camera + GPS + file system, all permission outcomes |
| Native module (Day 18) | none | `NativeDeviceInfo` Turbo Module, Codegen on both platforms |

Anything that needs a phone is still open. Section 4 lists it.

---

## 1. Morning: freeze, then three defects

### Feature freeze

In scope: notes list (swipe, sync state), note detail, compose with field photo, settings (native
module), gallery.
Out of scope, and I'll say so: auth (`secureStore.ts` is ready but no screen uses it), live
WebSocket updates (dev only, the handler only logs), the Map tab (placeholder).
`confirm-test.tsx`, `asset-check.tsx` and `swipe-lab.tsx` are drill screens, kept out of the demo path.

### Top three defects, ranked

Ranking rule: (1) loses user data, (2) breaks on one platform, (3) blocks the release build.
Anything cosmetic doesn't make the list.

**1. Compose lost the note offline, then said it saved it.** (fixed)
The old `onError` rolled the optimistic note back and then showed "Note saved locally". React Query
didn't know the phone was offline because `onlineManager` was never connected to NetInfo.
Fix: `onlineManager` ← NetInfo, and the create mutation is registered with `setMutationDefaults`
(`features/notes/notesStore.ts`), so a paused mutation restored after a restart can still run.
Its `onMutate` writes the note to the device before the request, so it's saved the moment Save is pressed.
While fixing this I found a second data-loss bug: `PersistQueryClientProvider` discards the whole
restored cache after 24 h by default (`maxAge`), which would have wiped device-only notes.
Now `maxAge: Infinity` (`services/queryClient.ts`).

**2. On iOS the confirm sheet opened by itself.** (fixed)
`ConfirmSheet.ios.tsx` called `ActionSheetIOS` in the render body. Now both platforms implement
one `ConfirmSheetProps` interface driven by `visible`, and iOS opens the sheet in an effect.

**3. The release build wasn't clean.** (fixed)
Missing direct dependencies, `Image.queryCache` called with a string (the prefetch never ran),
and a `ws://localhost` socket that can't work on a phone. All fixed; the socket is dev only.

---

## 2. The five questions

### Q1. Core flow with the screen reader on

Flow: Notes → open a note → back → New note → title → Save → (swipe) archive a note.
TalkBack on the Android phone, VoiceOver on the iPhone.

What a screen-reader user gets:
- Each note is **one** element: "Bridge pier 3, waiting to sync, photo at 14.5995° N, 120.9842° E,
  5 min ago". Built by `noteA11yLabel()` in `noteLogic.ts`, unit tested.
- Swiping isn't available with a screen reader on, so archive and delete are **accessibility
  actions** on the row (VoiceOver: swipe up/down; TalkBack: actions menu). The revealed buttons are
  hidden from the accessibility tree so focus never lands on something covered.
  Tested in `NoteList-test.tsx`.
- Compose inputs have labels (a placeholder isn't one). Save is disabled until there's a title, and
  that's announced.
- After save/archive/delete there's a spoken confirmation (`announceForAccessibility`), because
  the screen changes and nothing else would tell you what happened.
- The delete sheet traps focus on Android (`accessibilityViewIsModal`) and closes with Back.

What I'll say: "I ran this flow with TalkBack and VoiceOver on [date]." Only once that's true.

### Q2. A measurement, and the fix it led to

Two options. I'll use whichever one I actually measure:

**A. Collapsing header, JS thread vs UI thread** (`notes/[id].tsx`, dev build).
Before: `useNativeDriver: false`. Press "Block JS (2s)" while scrolling, Perf Monitor open.
After: `useNativeDriver: true` (committed).
Record: UI FPS during the block, before `[ ]` and after `[ ]`. JS FPS is ~0 both times, which is
the point: the header keeps moving because it no longer needs the JS thread.
Same idea, second data point: in the Swipe lab, block JS mid-drag. The PanResponder row freezes,
the gesture-handler row keeps tracking the finger.

**B. Gallery image size** (`gallery.tsx`).
The Unsplash URLs have no size parameters, so every tile downloads the original.
Before: bytes per image `[ ]`, time to full grid `[ ]`. After `?w=600&q=70`: `[ ]`, `[ ]`.

Either way: the problem in one sentence, two numbers, why the fix works. No "it felt smoother".

### Q3. One deliberate platform difference

`ConfirmSheet.ios.tsx` (native `ActionSheetIOS`) vs `ConfirmSheet.android.tsx` (a `Modal` bottom
sheet, because Android has no equivalent). Metro picks the file at bundle time, so neither platform
ships the other's code. Both implement `ConfirmSheet.types.ts`.

What I'll admit: they started with different APIs (imperative function vs `visible` prop), and that
mismatch caused defect #2. I fixed it by writing the shared interface first. I should have started there.

### Q4. Native module and Codegen

Demo: Settings tab → "Device (NativeDeviceInfo Turbo Module)": model, battery, emulator yes/no.

Walk-through, in this order:
1. **Spec**: `modules/native-device-info/src/NativeDeviceInfo.ts`. Three sync methods. The filename
   starts with `Native` because Codegen finds specs by filename, not content.
2. **codegenConfig** in the module's `package.json`: `type: modules`, Java package, iOS provider class.
3. **What Codegen generated** (Android, `android/build/generated/source/codegen/`):
   - `NativeDeviceInfoSpec.java`: an abstract class with `NAME = "NativeDeviceInfo"` and one abstract
     method per spec line, each `@ReactMethod(isBlockingSynchronousMethod = true)`.
     `number` → `double`, `string` → `String`, `boolean` → `boolean`.
   - `jni/NativeDeviceInfoSpec-generated.cpp`: the JSI host functions. `getBatteryLevel` calls the
     Java method with signature `()D` and `NumberKind`. That's the bridge-free path.
   - `schema.json`: the parsed spec Codegen worked from.
   - iOS (from pod install): a `NativeDeviceInfoSpec` protocol and `NativeDeviceInfoSpecJSI`, which
     `RCTNativeDeviceInfo.mm` returns from `getTurboModule:`.
4. **Implementation**: `NativeDeviceInfoModule.kt` subclasses the generated spec, so a missing
   method is a compile error, not a runtime crash. iOS is `.mm` because `getTurboModule:` returns a C++ type.
5. **Judgement calls**: `number` can't be nullable in a spec, so "battery unknown" is `-1`, turned
   into `null` in `index.ts`. I used `TurboModuleRegistry.get`, not `getEnforcing`, so Expo Go, web
   and Jest show "not linked" instead of crashing at import.

What I'll admit: the iOS side has never been compiled (no Mac). On Android, Codegen ran and the Kotlin compiled against the generated spec; the full app build hasn't finished yet (section 0).

### Q5. What I would not ship to a million users

**Where the notes actually live.**

Notes written on the device are stored inside the React Query persisted cache: one JSON string in
AsyncStorage, re-serialised on every change, together with the cached server list. It works for one
user with fifty notes. At scale it breaks in ways the user can't see:
- Android's AsyncStorage has a default size cap (6 MB). A heavy user reaches it, the persist write
  fails silently, and every note written since the last successful write is gone on the next restart.
- Every save rewrites the whole blob, so it gets slower as the user writes more.
- The photo in the POST is a `file://` path on the phone. The server receives a path it can never open.
- I send an `Idempotency-Key`, but the demo API ignores it. If the app is killed after the POST
  arrives but before the success is persisted, the resumed request creates a duplicate.
- A note the server rejects is marked "Sync failed" and stays on the device, but there's no retry button.

What I'd do instead:
1. SQLite (`expo-sqlite`): a `notes` table as the source of truth, and an `outbox` table of pending
   operations with the client id as primary key. React Query reads from it, not the other way round.
2. Upload photos first (multipart, to object storage), then POST the note with the photo URL.
3. A server that actually de-duplicates on the idempotency key.
4. Retry from "Sync failed", plus background retry with backoff.
5. The Maestro flow in `.maestro/offline-sync.yaml`, extended with "kill the app while syncing",
   running on every release build.

Today's work made the offline path honest and stopped it losing notes. This plan makes it hold up at scale.

---

## 3. Rubric check (what I can actually claim)

| Criterion | Pts | Honest status |
|---|---|---|
| Release build on both physical devices | 20 | Android: build got through the native module with no errors but didn't finish (out of memory). iOS: not built |
| M1–M3 features | 15 | Code for all M1–M3 requirements is in. M3 still needs the on-device evidence |
| Accessibility verified live | 15 | Implemented and unit tested. Counts once done with a screen reader on both phones |
| Measured perf fix | 15 | Only with real numbers from Q2 |
| Native module | 10 | Android generated and compiled. iOS written, unverified. Break-it table not done |
| Code quality: TS clean, tests green | 15 | 0 TS errors, 0 lint, 37 tests green in CI |
| Defence | 10 | This document |

---

## 4. Steps to finish Day 20

What the course site says (checked 12 Oct):
- **M4 / capstone:** "definition pending", no form. Day 20 is the live panel.
- **Day 20 drill form:** repo URL + commit hash required; findings and screenshot optional.
- **M1, M2, M3:** all **NOT STARTED**. The capstone gives 15 points for M1–M3 completeness.
  Each form needs the repo URL, a commit hash and one piece of evidence.

### Step 1: push
- [ ] `git push origin main`, then confirm the commit on GitHub

### Step 2: device checks (needs both phones)
- [ ] Android release build on the phone: `npx expo run:android --variant release`
- [ ] iOS: no Mac, so EAS. `npm i -g eas-cli`, `eas login`, `eas build:configure`, then
      `eas build --profile preview --platform ios`. Needs an Apple Developer account to install on a
      real iPhone. If that isn't possible, say so in the panel; it's the 20-point row
- [ ] Q1: run the flow with TalkBack and with VoiceOver. Screen-record both (M3 needs it)
- [ ] Offline: airplane mode → save a note with a photo → kill the app → reopen → back online →
      "Pending sync" goes away, the note shows once. Screen-record it (M2 needs it)
- [ ] Day 12: start a swipe, pull down the notification shade mid-drag, the row springs closed. Record it
- [ ] Day 14: deny camera twice on Android → the Settings screen appears. Location services off → note still saves
- [ ] Q2: take the measurement, put the numbers in section 2
- [ ] Settings tab on the phone shows real model and battery (Day 18)
- [ ] Optional: install Maestro and run `.maestro/offline-sync.yaml` against the release build

### Step 3: submit M1 (Note Browser)
- Commit `6253bdf` (Day 5). M1 asks for hard-coded data; at HEAD the list comes from the network
- Demo video: scroll the list, open a note, back. Under a minute

### Step 4: submit M2 (Navigable, Network-Backed, Offline-Capable)
- Commit: HEAD after Step 1 (`git rev-parse --short HEAD`)
- Offline evidence: the Step 2 recording, plus: "Notes are written to the device in `onMutate`
  before the request; offline mutations pause (onlineManager ← NetInfo) and persist with the query
  cache; `resumePausedMutations()` on restore."
- Platform-specific adaptation: section 2, Q3
- Security notes, what's actually true:
  - Auth token storage uses `expo-secure-store` (Keychain / Keystore); no screen uses it yet
  - The persisted query cache in AsyncStorage is **not encrypted**. Fine for demo notes, not for real field data
  - HTTPS only; the `ws://localhost` socket is dev only
  - Photos stay on the device under Documents; deleting a note deletes its photo
  - Android: `SYSTEM_ALERT_WINDOW` and legacy storage permissions blocked in `app.json`
  - Not done: certificate pinning, encryption at rest, real auth

### Step 5: submit M3 (Animated, Accessible, Device-Integrated, Tested)
| Requirement | Evidence |
|---|---|
| Animation and gesture work | `notes/[id].tsx` (native-driver header), `day12-gestures.md`, Step 2 recording |
| Screen-reader usable, on device | Step 2 TalkBack/VoiceOver recordings |
| Device capability with permissions | `day14-capture.md`, Step 2 denial checks |
| Passing test suite | paste `npx jest` output; CI run link from GitHub Actions |

### Step 6: Day 20 drill form
- Repo URL, commit hash (HEAD after Step 1), findings: summary of section 0 and the Q5 answer
- Tick "Exercise runs without errors" only after Step 2

### Step 7: the panel
- [ ] Day 19 release checklist, every line
- [ ] Both phones charged, release builds installed, screen reader shortcut set
      (iOS: triple-click side button; Android: both volume keys)
- [ ] Feature freeze after the last commit. Whatever is still broken goes into Q5
- [ ] Q1 → Q5 in 15 minutes. Read section 2 out loud once and time it
