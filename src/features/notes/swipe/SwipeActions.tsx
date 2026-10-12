import type { AccessibilityActionEvent } from 'react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export const ACTIONS_WIDTH = 160;

export interface SwipeRowProps {
  label: string; // full accessibility label for the row
  onPress: () => void;
  onArchive: () => void;
  onDelete: () => void;
  children: React.ReactNode;
}

// Swiping is invisible to a screen reader. The same commands are exposed as
// accessibility actions (VoiceOver: swipe up/down on the row; TalkBack: actions menu).
export function rowA11yProps({ label, onPress, onArchive, onDelete }: Omit<SwipeRowProps, 'children'>) {
  return {
    accessible: true,
    accessibilityRole: 'button' as const,
    accessibilityLabel: label,
    accessibilityHint: 'Opens the note. Archive and delete are in the actions menu.',
    accessibilityActions: [
      { name: 'activate' },
      { name: 'archive', label: 'Archive' },
      { name: 'delete', label: 'Delete' },
    ],
    onAccessibilityAction: (e: AccessibilityActionEvent) => {
      const name = e.nativeEvent.actionName;
      if (name === 'activate') onPress();
      if (name === 'archive') onArchive();
      if (name === 'delete') onDelete();
    },
  };
}

// The buttons revealed behind the row. Hidden from screen readers because the
// row's accessibility actions already cover them; otherwise focus would land on
// buttons that are visually covered.
export function SwipeActions({ onArchive, onDelete }: { onArchive: () => void; onDelete: () => void }) {
  return (
    <View style={styles.actions} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
      <Pressable style={[styles.action, styles.archive]} onPress={onArchive}>
        <Text style={styles.actionText}>Archive</Text>
      </Pressable>
      <Pressable style={[styles.action, styles.delete]} onPress={onDelete}>
        <Text style={styles.actionText}>Delete</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  actions: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    width: ACTIONS_WIDTH,
    flexDirection: 'row',
    borderRadius: 8,
    overflow: 'hidden',
  },
  action: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  archive: { backgroundColor: '#FF9500' },
  delete: { backgroundColor: '#FF3B30' },
  actionText: { color: '#fff', fontWeight: '600' },
});
