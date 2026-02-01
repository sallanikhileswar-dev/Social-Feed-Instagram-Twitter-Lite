import api from './api';

const adminService = {
  // Delete a post (admin only)
  deletePost: async (postId, reason) => {
    const response = await api.delete(`/admin/posts/${postId}`, {
      data: { reason },
    });
    return response.data;
  },

  // Delete a comment (admin only)
  deleteComment: async (commentId, reason) => {
    const response = await api.delete(`/admin/comments/${commentId}`, {
      data: { reason },
    });
    return response.data;
  },

  // Delete a user (admin only)
  deleteUser: async (userId, reason) => {
    const response = await api.delete(`/admin/users/${userId}`, {
      data: { reason },
    });
    return response.data;
  },

  // Get admin logs
  getAdminLogs: async (page = 1, limit = 50) => {
    const response = await api.get('/admin/logs', {
      params: { page, limit },
    });
    return response.data;
  },

  // Get statistics
  getStats: async () => {
    const response = await api.get('/admin/stats');
    return response.data;
  },

  // Get all users
  getAllUsers: async () => {
    const response = await api.get('/admin/users');
    return response.data;
  },
};

export default adminService;
