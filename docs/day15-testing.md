# Day 15 – Four layers, one feature

Feature under test: note sync (write locally, sync when online), plus the pieces it leans on.

```
npm run typecheck   # tsc
npm run lint        # ESLint (expo config + jest/no-large-snapshots)
npm test            # Jest: unit + component
maestro test .maestro/offline-sync.yaml   # E2E, needs a release build on a device/emulator
```

CI runs the first three on every push and PR: `.github/workflows/ci.yml`.

## Layers

| Layer | What | Files |
|---|---|---|
| Static | `tsc --noEmit` (strict), ESLint | whole repo |
| Unit (no React) | 30 tests: relative time, conflict resolution, merge order, hidden ids, coords format, a11y label, swipe thresholds, permission states, HTTP retry policy | `noteLogic-test.ts`, `permissions-test.ts`, `api-test.ts` |
| Component (RNTL) | 7 tests, text and accessibility queries only, no `testID`, no state assertions | `CaptureFlow-test.tsx`, `NoteList-test.tsx` |
| Snapshot | 1, the "Pending sync" badge (20 lines). ESLint fails above 30 | `__snapshots__/NoteList-test.tsx.snap` |
| E2E | Maestro: offline → write → reconnect → "Pending sync" disappears | `.maestro/offline-sync.yaml` |

## Runtime (this machine, warm cache, 12 Oct)

| Layer | Wall time | Per test |
|---|---|---|
| tsc | 3.2 s | n/a |
| ESLint | 5.3 s | n/a |
| Unit, 30 tests | 2.4 s (Jest reports 1.5 s) | ~50 ms |
| Component, 7 tests | 6.6 s (Jest reports 3.1 s) | ~440 ms |
| E2E, 1 flow | not run: needs a device. Expect minutes including the release build | |

About 9× per test from unit to component, and E2E is in another league. That's the pyramid's
cost gradient, and it's why the conflict and retry rules live in pure functions with many cheap
tests, while the screens get a few expensive ones.

## Refactor resilience

Done 12 Oct: in `CaptureFlow.tsx`, renamed `step`→`screen`, `setStep`→`goTo`, `shot`→`capture`,
`cameraReady`→`isReady`, `showCamera`→`inCamera`, `Step`→`Screen`, and renamed the
`PrimaryButton`/`LinkButton` components. `tsc` clean, and `CaptureFlow-test.tsx` passed
**unedited** (3/3). Reverted afterwards, since the point was the proof, not the names.
It works because the tests only touch what a user can see or hear: text, roles and names.

## Bugs the tests found

- `api.ts` retried a 200 response with a broken JSON body three times with backoff, because it
  treated "no HTTP status" as "network error". Fixed. Covered by `does not retry a body that is not JSON`.

## What this suite can't see

All of this runs in Node. None of it touches iOS or Android: not the native driver, not the
gesture recognisers (mocked in `jest.setup.js`), not TalkBack, not the camera, not the Turbo
Module. A green suite says the logic is right. It doesn't say the app works on a phone. That's
what the device checks in `day20-defense.md` are for.

## Not done

- [ ] Run the Maestro flow (needs Maestro installed + a device/emulator)
