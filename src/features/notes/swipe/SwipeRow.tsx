import { Pressable, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { swipeOutcome } from '../noteLogic';
import { ACTIONS_WIDTH, rowA11yProps, SwipeActions, type SwipeRowProps } from './SwipeActions';

// gesture-handler port of PanSwipeRow. Recognition and the animation both run on
// the UI thread; the JS thread is only told the outcome.
export function SwipeRow({ label, onPress, onArchive, onDelete, children }: SwipeRowProps) {
  const translateX = useSharedValue(0);
  const startX = useSharedValue(0);
  const rowWidth = useSharedValue(0);

  const close = () => {
    translateX.value = withSpring(0);
  };

  const pan = Gesture.Pan()
    // The PanResponder version checks |dx| > |dy| by hand. Here the two offsets do
    // it: claim after 12 px sideways, give up to the FlatList after 12 px vertically.
    .activeOffsetX([-12, 12])
    .failOffsetY([-12, 12])
    .onStart(() => {
      startX.value = translateX.value;
    })
    .onUpdate((e) => {
      translateX.value = Math.min(0, startX.value + e.translationX); // left only
    })
    .onEnd((e) => {
      const outcome = swipeOutcome(translateX.value, e.velocityX, rowWidth.value, ACTIONS_WIDTH);
      if (outcome === 'commit') {
        // Long swipe commits to archive, the reversible action. Delete always asks.
        translateX.value = withTiming(-rowWidth.value, { duration: 180 }, (finished) => {
          if (finished) scheduleOnRN(onArchive);
        });
      } else {
        translateX.value = withSpring(outcome === 'open' ? -ACTIONS_WIDTH : 0, { velocity: e.velocityX });
      }
    })
    // Equivalent of onPanResponderTerminate: if the system cancels the gesture
    // (incoming call, Control Center), success is false and the row resets.
    .onFinalize((_e, success) => {
      if (!success) translateX.value = withSpring(0);
    });

  const rowStyle = useAnimatedStyle(() => ({ transform: [{ translateX: translateX.value }] }));

  return (
    <View
      style={styles.container}
      onLayout={(e) => {
        rowWidth.value = e.nativeEvent.layout.width;
      }}
    >
      <SwipeActions
        onArchive={() => {
          close();
          onArchive();
        }}
        onDelete={() => {
          close();
          onDelete();
        }}
      />
      <GestureDetector gesture={pan}>
        <Animated.View style={rowStyle}>
          <Pressable onPress={onPress} {...rowA11yProps({ label, onPress, onArchive, onDelete })}>
            {children}
          </Pressable>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 12 },
});
