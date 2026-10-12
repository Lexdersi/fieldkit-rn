import { useEffect, useRef, useState } from 'react';
import { Animated, PanResponder, Pressable, StyleSheet, View } from 'react-native';
import { swipeOutcome } from '../noteLogic';
import { ACTIONS_WIDTH, rowA11yProps, SwipeActions, type SwipeRowProps } from './SwipeActions';

// Day 12 drill: the PanResponder version, kept for the comparison in
// docs/day12-gestures.md. FieldKit's list uses SwipeRow (gesture-handler).
export function PanSwipeRow({ label, onPress, onArchive, onDelete, children }: SwipeRowProps) {
  const [translateX] = useState(() => new Animated.Value(0));
  const [dragging, setDragging] = useState(false);
  const rest = useRef(0); // where the row sits when nobody is touching it
  const width = useRef(0);

  // PanResponder is created once; read the latest callbacks through a ref
  const latest = useRef({ onArchive });
  useEffect(() => {
    latest.current = { onArchive };
  });

  const settle = (to: number, velocity = 0) => {
    rest.current = to;
    Animated.spring(translateX, { toValue: to, velocity, useNativeDriver: false }).start();
  };

  // The handlers read refs only while a gesture runs, never during render. The rule
  // can't see that through PanResponder.create, so it is silenced here, not globally.
  // eslint-disable-next-line react-hooks/refs
  const [pan] = useState(() =>
    PanResponder.create({
      // The whole trick to living inside a vertical FlatList: only claim the
      // gesture when the movement is more horizontal than vertical.
      onMoveShouldSetPanResponder: (_e, g) => Math.abs(g.dx) > 8 && Math.abs(g.dx) > Math.abs(g.dy),
      onPanResponderGrant: () => setDragging(true),
      // Driven by hand rather than Animated.event so the row can be clamped to
      // left swipes. Either way it is JS-driven: PanResponder is not a direct event.
      onPanResponderMove: (_e, g) => translateX.setValue(Math.min(0, rest.current + g.dx)),
      onPanResponderRelease: (_e, g) => {
        setDragging(false);
        const dx = Math.min(0, rest.current + g.dx);
        // PanResponder velocity is px/ms; swipeOutcome takes px/s
        const outcome = swipeOutcome(dx, g.vx * 1000, width.current, ACTIONS_WIDTH);

        if (outcome === 'commit') {
          const done = () => latest.current.onArchive();
          if (g.vx < -1.5) {
            // A fling keeps its own momentum. useNativeDriver must stay false: this
            // value is also driven from JS in onPanResponderMove.
            Animated.decay(translateX, { velocity: g.vx, deceleration: 0.997, useNativeDriver: false }).start(done);
          } else {
            Animated.timing(translateX, { toValue: -width.current, duration: 180, useNativeDriver: false }).start(done);
          }
          return;
        }
        settle(outcome === 'open' ? -ACTIONS_WIDTH : 0, g.vx);
      },
      // Don't surrender a drag in progress to a parent that asks for it
      onPanResponderTerminationRequest: () => false,
      // The OS took the gesture anyway (call, Control Center). Without this reset
      // the row stays stuck half-open with dragging=true forever.
      onPanResponderTerminate: () => {
        setDragging(false);
        settle(0);
      },
    })
  );

  return (
    <View style={styles.container} onLayout={(e) => (width.current = e.nativeEvent.layout.width)}>
      <SwipeActions
        onArchive={() => {
          settle(0);
          onArchive();
        }}
        onDelete={() => {
          settle(0);
          onDelete();
        }}
      />
      <Animated.View
        style={[{ transform: [{ translateX }] }, dragging && styles.dragging]}
        {...pan.panHandlers}
      >
        <Pressable onPress={onPress} {...rowA11yProps({ label, onPress, onArchive, onDelete })}>
          {children}
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 12 },
  dragging: { opacity: 0.85 },
});
