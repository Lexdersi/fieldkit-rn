import NetInfo from '@react-native-community/netinfo';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';

export function useNetworkSync() {
  const queryClient = useQueryClient();
  const prevConnected = useRef<boolean | null>(null);

  useEffect(() => {
    const appStateSub = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        console.log('[App State]: Foreground active — refetching queries');
        queryClient.refetchQueries();
      } else if (nextAppState === 'background') {
        console.log('[App State]: Entering background');
      }
    });

    const netInfoSub = NetInfo.addEventListener((state) => {
      const isConnected = Boolean(state.isConnected);
      
      // Only trigger when transitioning from disconnected to connected
      if (prevConnected.current === false && isConnected) {
        console.log('[Network]: Connection restored — triggering queue flush');
        queryClient.invalidateQueries();
      }
      
      prevConnected.current = isConnected;
    });

    return () => {
      appStateSub.remove();
      netInfoSub();
    };
  }, [queryClient]);
}