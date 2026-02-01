import api from './api';

const postService = {
  // Create a new post
  createPost: async (postData) => {
    const response = await api.post('/posts', postData);
    return response.data;
  },

  // Get a single post
  getPost: async (postId) => {
    const response = await api.get(`/posts/${postId}`);
    return response.data;
  },

  // Delete a post
  deletePost: async (postId) => {
    const response = await api.delete(`/posts/${postId}`);
    return response.data;
  },

  // Like a post
  likePost: async (postId) => {
    const response = await api.post(`/posts/${postId}/like`);
    return response.data;
  },

  // Unlike a post
  unlikePost: async (postId) => {
    const response = await api.delete(`/posts/${postId}/like`);
    return response.data;
  },

  // Comment on a post
  commentOnPost: async (postId, content) => {
    const response = await api.post(`/posts/${postId}/comment`, { content });
    return response.data;
  },

  // Get comments for a post
  getPostComments: async (postId) => {
    const response = await api.get(`/posts/${postId}/comments`);
    return response.data;
  },

  // Repost a post
  repostPost: async (postId) => {
    const response = await api.post(`/posts/${postId}/repost`);
    return response.data;
  },

  // Bookmark a post
  bookmarkPost: async (postId) => {
    const response = await api.post(`/posts/${postId}/bookmark`);
    return response.data;
  },

  // Get following feed
  getFollowingFeed: async (page = 1, limit = 10) => {
    const response = await api.get('/posts/feed/following', {
      params: { page, limit },
    });
    return response.data;
  },

  // Get global feed
  getGlobalFeed: async (page = 1, limit = 10) => {
    const response = await api.get('/posts/feed/global', {
      params: { page, limit },
    });
    return response.data;
  },

  // Get trending posts
  getTrendingPosts: async (page = 1, limit = 10) => {
    const response = await api.get('/posts/feed/trending', {
      params: { page, limit },
    });
    return response.data;
  },

  // Get user posts
  getUserPosts: async (userId, page = 1, limit = 20) => {
    const response = await api.get(`/posts/user/${userId}`, {
      params: { page, limit },
    });
    return response.data;
  },
};

export default postService;
