import api from './api';

const userService = {
  // Get user profile by ID
  getProfile: async (userId) => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },

  // Update current user's profile
  updateProfile: async (profileData) => {
    const response = await api.put('/users/profile', profileData);
    return response.data;
  },

  // Upload profile image
  uploadProfileImage: async (imageData) => {
    const response = await api.post('/users/profile/image', imageData);
    return response.data;
  },

  // Follow a user
  followUser: async (userId) => {
    const response = await api.post(`/users/${userId}/follow`);
    return response.data;
  },

  // Unfollow a user
  unfollowUser: async (userId) => {
    const response = await api.delete(`/users/${userId}/follow`);
    return response.data;
  },

  // Get user's followers
  getFollowers: async (userId, page = 1, limit = 20) => {
    const response = await api.get(`/users/${userId}/followers`, {
      params: { page, limit },
    });
    return response.data;
  },

  // Get user's following
  getFollowing: async (userId, page = 1, limit = 20) => {
    const response = await api.get(`/users/${userId}/following`, {
      params: { page, limit },
    });
    return response.data;
  },
};

export default userService;
