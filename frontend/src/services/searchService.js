import api from './api';

const searchService = {
  // Search for users
  searchUsers: async (query, page = 1, limit = 20) => {
    const response = await api.get('/search/users', {
      params: { q: query, page, limit },
    });
    return response.data;
  },

  // Search for posts
  searchPosts: async (query, page = 1, limit = 20) => {
    const response = await api.get('/search/posts', {
      params: { q: query, page, limit },
    });
    return response.data;
  },
};

export default searchService;
