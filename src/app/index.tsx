import { Redirect } from 'expo-router';

// The app opens on the Notes tab. There used to be a second notes list here,
// which is how the tab list and compose ended up reading different data.
export default function Index() {
  return <Redirect href="/notes" />;
}
