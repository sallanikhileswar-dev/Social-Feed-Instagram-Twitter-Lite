import api from './api';

const notificationService = {
  // Get user notifications
  getNotifications: async (page = 1, limit = 20) => {
    const response = await api.get('/notifications', {
      params: { page, limit },
    });
    return response.data;
  },

  // Mark notifications as read
  markAsRead: async () => {
    const response = await api.put('/notifications/read');
    return response.data;
  },
};

export default notificationService;
