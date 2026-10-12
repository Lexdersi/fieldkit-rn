# Day 20 – Capstone Defence (FieldKit)

Notes for the 15-minute panel. Everything here points at a real file in this repo.
Anything in `[brackets]` is a number I still have to measure on the device. I won't make one up.

---

## 0. Where the app actually is (12 Oct)

I checked this before writing anything else, because questions 1, 2 and 4 depend on it.
The "After fixes" column is the state after the defect and accessibility commit.

| Check | Before | After fixes |
|---|---|---|
| `npx tsc --noEmit` | **10 errors** | **0 errors** |
| `npx expo export` (iOS + Android, production) | not checked | bundles both |
| Tests | None | Still none |
| `accessibilityLabel` / `accessibilityRole` in `src/` | **0 uses** | Core flow labelled (Q1). Not yet tested on a device |
| Native module (Day 18) | Not in the repo | Still not in the repo |
| `expo-secure-store` | Imported but not in `package.json` | Installed (`~57.0.4`), config plugin added |
| `@tanstack/react-query` | Transitive dependency only | Direct dependency (`^5.104.2`) |

So the plan for the morning is about closing gaps, not adding features.

---

## 1. Morning: freeze, then three defects

### Feature freeze

In scope: notes list, note detail (collapsing header), compose, gallery, tabs.
Out of scope, and I'll say so: auth (`secureStore.ts` isn't called anywhere), live WebSocket updates
(the handler in `(tabs)/notes/index.tsx:45` only logs), map and settings tabs (placeholder screens).
`confirm-test.tsx` and `asset-check.tsx` are drill screens. They stay out of the demo path.

### Top three defects, ranked

How I ranked them: (1) loses user data, (2) breaks on one platform, (3) blocks the release build.
Anything cosmetic doesn't make the list.

**1. Compose loses the note offline, then says it saved it.** (fixed)
`src/app/compose.tsx:32-36`. `onError` puts the old cache back, which removes the optimistic note,
and then shows "Note saved locally and will sync when reconnected". Neither part is true. The mutation
isn't persisted, and `onlineManager` is never connected to NetInfo (`useNetworkSync.ts` only
invalidates queries), so React Query doesn't know the phone is offline.
What I changed: `services/queryClient.ts` connects `onlineManager` to NetInfo and registers the
POST with `setMutationDefaults(['createNote'])`, so a paused mutation restored from storage still has
a function to run. `_layout.tsx` calls `resumePausedMutations()` once the cache is restored. When the
phone is offline, compose now says "Saved on this device", which is true now. When the server
rejects the note, it says "Note not saved" and keeps the text.
Still to verify on a device: airplane mode → save → kill app → reopen → back online → the POST goes out once.

**2. On iOS the confirm sheet opens by itself.** (fixed)
`src/components/ConfirmSheet.ios.tsx:11` calls `ActionSheetIOS.showActionSheetWithOptions` in the
render body. `confirm-test.tsx:33` always renders `<ConfirmSheet>`, so the sheet shows as soon as the
screen mounts and again after every `setStatus`. Android doesn't have this problem because it checks
`visible`. Also, `ConfirmSheet.tsx` is an empty file, which is the cause of TS1192.
What I changed: both platforms take the same `ConfirmSheetProps` (`ConfirmSheet.types.ts`). iOS opens
the sheet in a `useEffect` on `visible`, and uses `useEffectEvent` so the effect calls the latest
callbacks without opening the sheet again. `ConfirmSheet.tsx` now exports the Modal version as the
web fallback. `confirm-test.tsx` no longer has a `Platform.OS` branch.

**3. The release build isn't clean.** (fixed)
Add `expo-secure-store` and `@tanstack/react-query` as direct dependencies (`npx expo install ...`).
Fix the gallery calls: `Image.queryCache` takes an array, not a string (`gallery.tsx:27,33`).
That is a real bug as well as a type error: it returns `{}`, an empty object is truthy, so the
prefetch branch never runs. Remove the `ws://localhost:8080` socket from the demo build. On a
physical device `localhost` is the phone itself, and Android release builds block cleartext `ws://`.
Done means `tsc` reports 0 errors. It does now. The socket only connects when `__DEV__` is true.

Not fixing today, but known: `/notes/[id]` exists twice (`app/notes/[id].tsx` and
`app/(tabs)/notes/[id].tsx` are identical files), so both resolve to the same URL.

---

## 2. The five questions

### Q1. Core flow with the screen reader on

Flow I'll demo: Notes tab → open a note → back → New Note → type a title → Save.
I'll run TalkBack on the Android phone and VoiceOver on the iPhone.

These labels are in the code now, but I haven't tested them with a screen reader yet:

- Note card, `(tabs)/notes/index.tsx:97`: `accessibilityRole="button"`,
  `accessibilityLabel={\`Open note: ${item.title}\`}`
- Compose inputs, `compose.tsx:57,64`: a placeholder isn't a label. Add `accessibilityLabel="Note title"`
  and `"Note content"`
- Android `ConfirmSheet`: add `onRequestClose={onCancel}` so the back gesture closes it, and
  `accessibilityViewIsModal` so focus stays inside the sheet
- "Block JS (2s)" in `notes/[id].tsx`: a test control, now only rendered when `__DEV__` is true
- Also: header roles on the screen titles, an image label on gallery tiles (the duplicate title
  text is hidden from screen readers), a live region on the load error, and "waiting to sync" in
  the label of pending notes

What I'll say: "I tested this flow with TalkBack and VoiceOver on [date]. The note cards used to
read as just their title text with no role. I added the role and label. Here it is."
I will only say this after I've actually done it on both phones.

### Q2. A measurement, and the fix it led to

Two options. I'll use whichever one I actually measure:

**A. Collapsing header, JS thread vs UI thread** (`notes/[id].tsx`).
Before: `useNativeDriver: false`. Press "Block JS (2s)" while scrolling, with the Perf Monitor open.
After: `useNativeDriver: true` (what's committed now).
Record: UI FPS during the block, before `[ ]` and after `[ ]`. JS FPS is ~0 in both cases, and
that's the point. The header keeps moving because the animation doesn't need the JS thread anymore.

**B. Gallery image size** (`gallery.tsx`).
The Unsplash URLs have no size parameters, so every tile downloads the full-size original.
Before: bytes per image `[ ]`, time to first full grid on 4G `[ ]`.
After: add `?w=600&q=70` and measure again `[ ]`.
This one is easy to back with numbers because the network inspector shows the response sizes.

What I'll say: one sentence on the problem, the two numbers, one sentence on why the fix works.
No "it felt smoother".

### Q3. One deliberate platform difference

`ConfirmSheet.ios.tsx` vs `ConfirmSheet.android.tsx`.

iOS uses `ActionSheetIOS`, the native UIKit sheet. iOS users expect a destructive action to come up
from the bottom, red, with Cancel separate, and VoiceOver already knows how to read it.
Android has no direct equivalent, so I built a bottom sheet with `Modal`.
The choice between them is made by Metro's platform extensions at bundle time, not by
`Platform.OS` checks at runtime, so neither platform ships the other's code.

What I'll admit: the two files started out with different APIs. iOS was a function called
imperatively, Android was a component driven by `visible`. That mismatch caused defect #2. I fixed it
by writing the shared interface first (`ConfirmSheet.types.ts`) and making both platforms implement it.
I should have started that way.

### Q4. Native module and Codegen

There isn't one in this repo. I won't demo something that doesn't exist.

Option 1 (if there's time after the defects): build the Day 18 drill as a local Expo module, with a
TypeScript spec, run the prebuild, and show the generated files: the C++ JSI binding, the
Obj-C++ protocol on iOS, and the Java abstract spec class on Android. Then explain that Codegen turns
my spec types into native method signatures, so a type mismatch shows up at build time instead of
crashing at runtime.

Option 2 (no time): say it directly. "I didn't finish the native module. That's 10 points I'm not
claiming. I spent the time on the data-loss bug instead, because shipping a working native module
alongside an app that silently drops notes would be the wrong priority."

### Q5. What I would not ship to a million users

**The offline write path.**

There are two notes lists. `app/index.tsx` uses React Query, so the persisted cache covers it.
`app/(tabs)/notes/index.tsx` uses `useState` + `fetch`, so it gets nothing from
`PersistQueryClientProvider`, and that's the one the tab bar opens. Compose writes optimistically into
`['notes']`, which the tab list never reads. When the write fails offline, the note is gone and the
user is told it was saved (defect #1).

For a field app, where the whole point is writing notes with no signal, this is the feature that
matters most, and it's the weakest part of the code.

What I'd do instead:
1. One notes list, on React Query, and delete the duplicate route.
2. Save writes to a local store first (SQLite, e.g. `expo-sqlite`), keyed by a client-generated id.
   That local record is the source of truth.
3. An outbox table that retries in the background, with idempotency keys so a retry can't create
   duplicates on the server.
4. A visible "pending sync" state on each note, so the UI never claims something that hasn't happened.
5. A test that runs: go offline → write → kill the app → reopen → go online → note exists exactly once.

Today's fix makes it honest. This plan makes it correct.

---

## 3. Rubric check (what I can actually claim)

| Criterion | Pts | Honest status |
|---|---|---|
| Release build on both physical devices | 20 | Depends on defect #3 + an EAS/local release build today |
| M1–M3 features | 15 | Core notes flows yes; auth and live updates out of scope |
| Accessibility verified live | 15 | Labels are in. Only counts once tested on both phones |
| Measured perf fix | 15 | Only with real numbers from Q2 |
| Native module | 10 | Not done (see Q4) |
| Code quality: TS clean, tests green | 15 | 0 TS errors. No tests yet. Goal: one test for the offline write |
| Defence | 10 | This document |

---

## 4. Steps to finish Day 20

What the course site says (checked 12 Oct):
- **M4 / capstone:** "definition pending". There is no form, so there's nothing to submit yet.
  Day 20 is the live panel, and the instructor confirms the final rubric beforehand.
- **M1, M2, M3:** all three show **NOT STARTED**. The capstone gives 15 points for "feature
  completeness against M1–M3", so these need to be submitted before the panel.
- Each milestone form needs a **repository URL** and a **commit hash**, plus one piece of evidence
  that is different for each milestone (listed below). The repo is `https://github.com/Lexdersi/fieldkit-rn`.

### Step 1: push what's done
- [x] Defect fixes and accessibility labels committed
- [ ] `git push origin main` (I haven't pushed; do it yourself)

### Step 2: device checks (needs both phones)
- [ ] Release build on Android: `npx expo run:android --variant release`
- [ ] Release build on iOS: `npx expo run:ios --configuration Release` (needs a Mac). Or use EAS: `eas build --profile preview --platform all`
- [ ] Q1 flow with TalkBack (Android) and VoiceOver (iOS): Notes → open note → back → New Note → title → Save.
      Screen-record both. The M3 form needs this recording too
- [ ] Offline test: airplane mode → save a note → kill the app → reopen → back online → note shows up once.
      Screen-record it. The M2 form needs this recording
- [ ] Q2: take the before/after measurement and write the numbers into section 2

### Step 3: submit M1 (Note Browser)
- Commit hash: `6253bdf` (Day 5, list + detail). At HEAD the lists fetch from the network, and M1 asks
  for hard-coded data, so submit the Day 5 commit
- Demo video: scroll the list, open a note, go back. Under a minute
- [ ] Tick the 3 acceptance boxes only after watching your own video

### Step 4: submit M2 (Navigable, Network-Backed, Offline-Capable)
- Commit hash: the HEAD commit after Step 1 (`git rev-parse --short HEAD`)
- Offline behavior evidence: the Step 2 offline recording. In the text field, say what it shows,
  and name `services/queryClient.ts` (onlineManager + setMutationDefaults) and `_layout.tsx` (resume on restore)
- "Documented platform-specific adaptation": point to section 2, Q3 of this file (ConfirmSheet)
- Security notes: write what's actually true:
  - The auth token goes in `expo-secure-store` (Keychain / Keystore), never AsyncStorage
  - The AsyncStorage query cache is not encrypted, so it's fine for public note text but not for anything sensitive
  - All API calls use HTTPS. The `ws://localhost` socket is dev only
  - Not done: no auth flow actually uses the token, no certificate pinning

### Step 5: M3 (Animated, Accessible, Device-Integrated, Tested): not ready yet
Checked against the code at HEAD:

| Requirement | Status |
|---|---|
| Animation and gesture work | Animation yes (`notes/[id].tsx`, native driver). **No gesture code** in `src/` |
| Screen-reader usable, on device | Labels are in. Needs the Step 2 recording |
| Device capability with permission handling | **Missing.** No camera, location or similar module in the repo |
| Passing test suite | **Missing.** No jest setup, no tests |

To make M3 submittable, the minimum is:
- [ ] One gesture, e.g. swipe-to-delete on a note card with `react-native-gesture-handler` (already installed),
      opening `ConfirmSheet`
- [ ] One device capability: `npx expo install expo-location`, then attach coordinates to a note, and
      handle "denied" with a message and a link to Settings
- [ ] Tests: `npx expo install jest-expo jest @testing-library/react-native -- --save-dev`. At least
      cover `services/api.ts` (retry on 5xx, no retry on 4xx) and the ConfirmSheet confirm/cancel buttons.
      Paste the `npx jest` output into the form
- If there isn't time, don't tick boxes you can't show. Submit what you have and list the rest as
  out of scope. Same rule as Q5

### Step 6: the panel
- [ ] Day 19 release checklist, every line
- [ ] Both phones charged, release builds installed, screen reader shortcut set up
      (iOS: triple-click side button; Android: both volume keys)
- [ ] Feature freeze: after the last commit, stop changing code. Whatever is still broken goes into the Q5 answer
- [ ] Order on the day: Q1 → Q2 → Q3 → Q4 → Q5, 15 minutes. Read section 2 out loud once beforehand and time it
