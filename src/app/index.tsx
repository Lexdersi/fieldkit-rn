import { DynamicColorIOS, Platform, PlatformColor, ScrollView, StyleSheet, Text, View } from 'react-native';

// Custom ThemedText Component (Required for Day 2)
export function ThemedText({ style, children, ...props }: any) {
  const textColor = Platform.select({
    ios: DynamicColorIOS({ light: '#11181c', dark: '#ecedee' }),
    android: PlatformColor('?android:attr/textColorPrimary'),
    default: '#11181c',
  });

  return (
    <Text style={[{ color: textColor }, style]} {...props}>
      {children}
    </Text>
  );
}

export default function Day2DrillScreen() {
  const longMessage = "This is a 400+ character long message designed to test flex behavior in React Native. It needs to grow and fill available space, wrap properly across multiple lines, and defend the layout so that the timestamp on the right never gets squeezed out of view or clipped off the edge of the screen, regardless of how much text is rendered here!";

  return (
    <ScrollView style={styles.screen}>
      {/* PART ONE: Web Port Component */}
      <Text style={styles.sectionHeader}>Part 1: Web Port</Text>
      <View style={styles.cardContainer}>
        <View style={styles.card}><Text>Card 1</Text></View>
        <View style={styles.card}><Text>Card 2</Text></View>
        <View style={styles.card}><Text>Card 3</Text></View>
      </View>

      {/* PART TWO: Chat Bubble Row Component */}
      <Text style={styles.sectionHeader}>Part 2: Chat Bubble Row</Text>
      <View style={styles.chatRow}>
        {/* 1. Avatar (40dp) + Absolute Unread Dot */}
        <View style={styles.avatarContainer}>
          <View style={styles.avatar} />
          <View style={styles.unreadDot} />
        </View>

        {/* 2. Message Body (Grows & Wraps) */}
        <View style={styles.messageBody}>
          <ThemedText style={styles.messageText}>{longMessage}</ThemedText>
        </View>

        {/* 3. Timestamp (Never Shrinks) */}
        <View style={styles.timestampContainer}>
          <ThemedText style={styles.timestampText}>11:42 AM</ThemedText>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 16,
    backgroundColor: '#f8fafc',
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 12,
    color: '#0f172a',
  },
  // Part 1 Styles: Ported Web Snippet
  cardContainer: {
    flexDirection: 'row', // [1] RN defaults to 'column'
    flexWrap: 'wrap',
    alignContent: 'flex-start', // [2] Web defaults to 'stretch'
    gap: 16, // [3] Unitless dp instead of '16px'
    marginBottom: 24,
  },
  card: {
    width: 100,
    height: 60,
    backgroundColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  // Part 2 Styles: Chat Bubble Row
  chatRow: {
    flexDirection: 'row', // Align elements horizontally
    alignItems: 'flex-start',
    gap: 12,
    padding: 12,
    backgroundColor: '#ffffff',
    borderRadius: 12,
  },
  avatarContainer: {
    position: 'relative', // Relative container for absolute dot
    width: 40,
    height: 40,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#cbd5e1',
  },
  unreadDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ef4444',
  },
  messageBody: {
    flex: 1, // Allows body to expand and take up remaining space
    flexShrink: 1, // Forces wrapping instead of pushing out the timestamp
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  timestampContainer: {
    flexShrink: 0, // Prevents long messages from shrinking the timestamp
  },
  timestampText: {
    fontSize: 12,
    color: '#64748b',
  },
});