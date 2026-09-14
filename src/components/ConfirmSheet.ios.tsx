import { ActionSheetIOS } from 'react-native';

interface ConfirmSheetProps {
  title: string;
  message?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmSheet({ title, message, onConfirm, onCancel }: ConfirmSheetProps) {
  ActionSheetIOS.showActionSheetWithOptions(
    {
      options: ['Cancel', title],
      destructiveButtonIndex: 1,
      cancelButtonIndex: 0,
    },
    (buttonIndex) => {
      if (buttonIndex === 1) {
        onConfirm();
      } else {
        onCancel();
      }
    }
  );

  return null; // ActionSheetIOS renders natively via UIKit
}