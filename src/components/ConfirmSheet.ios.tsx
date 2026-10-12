import { useEffect, useEffectEvent } from 'react';
import { ActionSheetIOS } from 'react-native';
import type { ConfirmSheetProps } from './ConfirmSheet.types';

export default function ConfirmSheet({ visible, title, message, onConfirm, onCancel }: ConfirmSheetProps) {
  // Effect events read the latest callbacks without re-opening the sheet when they change
  const handleConfirm = useEffectEvent(onConfirm);
  const handleCancel = useEffectEvent(onCancel);

  useEffect(() => {
    if (!visible) return;

    // Showing the sheet is a side effect, so it can't happen during render
    ActionSheetIOS.showActionSheetWithOptions(
      {
        title,
        message,
        options: ['Cancel', 'Confirm'],
        destructiveButtonIndex: 1,
        cancelButtonIndex: 0,
      },
      (buttonIndex) => {
        if (buttonIndex === 1) {
          handleConfirm();
        } else {
          handleCancel();
        }
      }
    );
  }, [visible, title, message]);

  return null; // ActionSheetIOS renders natively via UIKit
}
