# Day 12 – Swipe to archive

Two implementations of the same row, sharing one decision function so the comparison is about
the gesture systems and not about different thresholds.

| | File |
|---|---|
| Shared thresholds | `src/features/notes/noteLogic.ts` → `swipeOutcome(dx, vx, rowWidth, actionsWidth)` |
| PanResponder version | `src/features/notes/swipe/PanSwipeRow.tsx` |
| gesture-handler port (used in the Notes list) | `src/features/notes/swipe/SwipeRow.tsx` |
| Side-by-side in one FlatList | `src/app/swipe-lab.tsx` (Settings → Swipe lab, dev builds only) |

Behaviour, both versions: swipe left reveals Archive and Delete. A short swipe springs back.
Past half the action width (or a quick flick) it stays open. Past 60 % of the row, or a fling
past the actions, it commits. Commit means **archive**, not delete: a long swipe is easy to do
by accident, so it triggers the reversible action. Delete always goes through `ConfirmSheet`.

## Checklist

- [x] Horizontal drags work, vertical scroll unaffected. PanResponder: `onMoveShouldSetPanResponder`
      returns true only when `|dx| > |dy|` (and `|dx| > 8` so a tap isn't a drag).
- [x] `Animated.decay` with `gestureState.vx` on a fling commit (`PanSwipeRow.tsx`, release handler).
- [x] `onPanResponderTerminate` resets `dragging` and springs the row closed.
      `onPanResponderTerminationRequest` returns false.
- [ ] **Show it on a device:** start a drag, then pull down Control Center (iOS) or the
      notification shade (Android) mid-swipe. The row must spring closed, not stay half open.
      Record this; it can't be reproduced in Jest.
- [x] Ported to react-native-gesture-handler. Comparison below.

## PanResponder vs gesture-handler

| | PanResponder | gesture-handler + Reanimated |
|---|---|---|
| Where recognition runs | JS thread. Every move event crosses to JS | UI thread. JS only hears the outcome (`scheduleOnRN(onArchive)`) |
| Horizontal vs vertical | Hand-written `Math.abs(dx) > Math.abs(dy)` | Declared: `activeOffsetX([-12, 12])` + `failOffsetY([-12, 12])` |
| Nesting in FlatList | Works, but the list and the row negotiate through the responder system; a capture handler higher up can steal it | The handler and the native scroll view arbitrate natively |
| Animation driver | Must be JS-driven: `onPanResponderMove` sets the value from JS, so `useNativeDriver: false` everywhere on that value | Shared value animated on the UI thread (`withSpring`, `withTiming`) |
| JS thread blocked (Block JS button) | Row freezes mid-drag | Row keeps tracking the finger |
| System interruption | `onPanResponderTerminate`, easy to forget, and the row sticks | `onFinalize(_, success)`; `success === false` on cancel |
| Velocity units | px/ms (`vx * 1000` before `swipeOutcome`) | px/s |
| Testing | Same in Jest: neither gesture runs in Node. Both rows are tested through their accessibility actions | |

One thing the lesson's snippet glosses over: it pairs a JS-driven `Animated.event` with
`Animated.decay(..., { useNativeDriver: true })` on the same value. Once a value has been
driven from JS, moving it to the native driver throws on the next JS update, so
`PanSwipeRow` keeps `useNativeDriver: false` for every animation on `translateX`.

## Accessibility

Swiping is unavailable to VoiceOver and TalkBack users, so both rows expose the same commands
as accessibility actions (`archive`, `delete`) and hide the revealed buttons from the
accessibility tree. Tested in `src/features/notes/__tests__/NoteList-test.tsx`.
