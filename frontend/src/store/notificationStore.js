import { create } from 'zustand';

const useNotificationStore = create((set) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,

  // Set notifications
  setNotifications: (notifications) => {
    const unreadCount = notifications.filter((n) => !n.read).length;
    set({ notifications, unreadCount });
  },

  // Add a new notification (from socket)
  addNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    })),

  // Mark all as read
  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    })),

  // Set loading state
  setLoading: (loading) => set({ loading }),

  // Clear notifications
  clearNotifications: () =>
    set({ notifications: [], unreadCount: 0, loading: false }),
}));

export default useNotificationStore;
