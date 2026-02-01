import api from './api';

const messageService = {
  // Get all conversations
  getConversations: async () => {
    const response = await api.get('/messages/conversations');
    return response.data;
  },

  // Get messages with a specific user
  getMessages: async (userId, page = 1, limit = 50) => {
    const response = await api.get(`/messages/${userId}`, {
      params: { page, limit },
    });
    return response.data;
  },

  // Mark messages as seen
  markMessagesAsSeen: async (userId) => {
    const response = await api.put(`/messages/${userId}/seen`);
    return response.data;
  },
};

export default messageService;
