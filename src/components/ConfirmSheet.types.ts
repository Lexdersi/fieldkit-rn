// Shared by ConfirmSheet.ios.tsx and ConfirmSheet.android.tsx so both
// platforms are driven the same way: the parent owns `visible`.
export interface ConfirmSheetProps {
  visible: boolean;
  title: string;
  message?: string;
  onConfirm: () => void;
  onCancel: () => void;
}
