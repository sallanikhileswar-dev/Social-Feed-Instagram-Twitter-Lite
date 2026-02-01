import { useEffect } from 'react';
import socketService from '../utils/socket';
import { useNotificationStore } from '../store';
import { useAuthStore } from '../store';
import { notificationService } from '../services';

/**
 * Custom hook for handling real-time notifications
 */
const useNotifications = () => {
  const { addNotification, setNotifications } = useNotificationStore();
  const { user, isAuthenticated } = useAuthStore();

  // Fetch initial notifications and unread count
  useEffect(() => {
    if (isAuthenticated && user) {
      const fetchInitialNotifications = async () => {
        try {
          const response = await notificationService.getNotifications();
          setNotifications(response.data.notifications || []);
        } catch (error) {
          console.error('Failed to fetch initial notifications:', error);
        }
      };

      fetchInitialNotifications();
    }
  }, [isAuthenticated, user, setNotifications]);

  // Listen for real-time notifications
  useEffect(() => {
    if (user && socketService.isConnected()) {
      // Join user's notification room
      socketService.joinRoom(`user_${user._id}`);

      // Listen for new notifications
      socketService.onNotification((notification) => {
        addNotification(notification);
        
        // Optional: Show browser notification
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('New Notification', {
            body: getNotificationMessage(notification),
            icon: '/logo192.png',
          });
        }
      });

      // Cleanup listener on unmount
      return () => {
        socketService.off('new_notification');
      };
    }
  }, [user, addNotification]);

  return null;
};

// Helper function to format notification message
const getNotificationMessage = (notification) => {
  switch (notification.type) {
    case 'like':
      return `${notification.actor.username} liked your post`;
    case 'comment':
      return `${notification.actor.username} commented on your post`;
    case 'follow':
      return `${notification.actor.username} started following you`;
    case 'repost':
      return `${notification.actor.username} reposted your post`;
    default:
      return 'You have a new notification';
  }
};

export default useNotifications;
