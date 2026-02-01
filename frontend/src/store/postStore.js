import { create } from 'zustand';

const usePostStore = create((set) => ({
  posts: [],
  currentPost: null,
  loading: false,
  error: null,

  // Set posts (for feeds)
  setPosts: (posts) => set({ posts }),

  // Add a new post to the beginning of the list
  addPost: (post) => set((state) => ({ posts: [post, ...state.posts] })),

  // Update a post in the list
  updatePost: (postId, updates) =>
    set((state) => ({
      posts: state.posts.map((post) =>
        post._id === postId ? { ...post, ...updates } : post
      ),
    })),

  // Remove a post from the list
  removePost: (postId) =>
    set((state) => ({
      posts: state.posts.filter((post) => post._id !== postId),
    })),

  // Set current post (for detail view)
  setCurrentPost: (post) => set({ currentPost: post }),

  // Set loading state
  setLoading: (loading) => set({ loading }),

  // Set error state
  setError: (error) => set({ error }),

  // Clear posts
  clearPosts: () => set({ posts: [], currentPost: null, error: null }),
}));

export default usePostStore;
