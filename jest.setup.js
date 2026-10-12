// Native-only runtimes swapped for the mocks their packages ship for Jest.
// Gesture recognition and UI-thread animation are not tested here; that needs a device.
require('react-native-gesture-handler/jestSetup');
jest.mock('react-native-worklets', () => require('react-native-worklets/src/mock'));
jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));
