import api from './api';

const storyService = {
  // Create a new story
  createStory: async (data) => {
    const response = await api.post('/stories', data);
    return response.data;
  },

  // Get active stories
  getStories: async () => {
    const response = await api.get('/stories');
    return response.data;
  },

  // Mark story as viewed
  viewStory: async (storyId) => {
    const response = await api.post(`/stories/${storyId}/view`);
    return response.data;
  },

  // Delete a story
  deleteStory: async (storyId) => {
    const response = await api.delete(`/stories/${storyId}`);
    return response.data;
  },
};

export default storyService;
