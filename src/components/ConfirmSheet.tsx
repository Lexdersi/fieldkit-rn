// Metro resolves ConfirmSheet.ios.tsx / ConfirmSheet.android.tsx on device.
// This file is what TypeScript sees, and the fallback for web (Modal works there).
export { default } from './ConfirmSheet.android';
export type { ConfirmSheetProps } from './ConfirmSheet.types';
