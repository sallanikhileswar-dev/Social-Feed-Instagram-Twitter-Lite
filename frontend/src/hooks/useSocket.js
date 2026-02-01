import { useEffect } from 'react';
import socketService from '../utils/socket';
import { useAuthStore } from '../store';

/**
 * Custom hook to manage socket connection lifecycle
 * Automatically connects when user is authenticated and disconnects on unmount
 */
const useSocket = () => {
  const { isAuthenticated, accessToken } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && accessToken) {
      // Connect to socket with auth token
      socketService.connect(accessToken);

      // Cleanup on unmount or when auth changes
      return () => {
        socketService.disconnect();
      };
    }
  }, [isAuthenticated, accessToken]);

  return socketService;
};

export default useSocket;
