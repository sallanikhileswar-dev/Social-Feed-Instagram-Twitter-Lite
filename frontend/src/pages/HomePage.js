import React, { useState, useEffect } from 'react';
import { postService } from '../services';
import CreatePost from '../components/CreatePost';
import Post from '../components/Post';
import { StoriesBar, StoryViewer, CreateStory } from '../components';

const HomePage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedStory, setSelectedStory] = useState(null);
  const [showCreateStory, setShowCreateStory] = useState(false);
  const [storiesKey, setStoriesKey] = useState(0);

  useEffect(() => {
    fetchPosts(page);
  }, [page]);

  const fetchPosts = async (currentPage) => {
    setLoading(true);
    try {
      const response = await postService.getFollowingFeed(currentPage, 10);
      const { posts: newPosts } = response.data;
      
      if (currentPage === 1) {
        // First page - replace posts
        setPosts(newPosts);
      } else {
        // Subsequent pages - append posts
        setPosts((prev) => [...prev, ...newPosts]);
      }
      
      setHasMore(newPosts.length === 10);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePostCreated = (newPost) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  const handlePostDeleted = (postId) => {
    setPosts((prev) => prev.filter((post) => post._id !== postId));
  };

  const handleStoryCreated = () => {
    setStoriesKey((prev) => prev + 1); // Force StoriesBar to refresh
  };

  const loadMore = () => {
    setPage((prev) => prev + 1);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Home Feed
          </h1>
          <p className="text-sm text-gray-500 mt-1">Stay connected with your network</p>
        </div>
        <button
          onClick={() => setShowCreateStory(true)}
          className="px-5 py-2.5 bg-gradient-to-r from-yellow-400 via-pink-500 to-rose-500 text-white rounded-xl hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 font-semibold text-sm"
        >
          ✨ Add Story
        </button>
      </div>

      <StoriesBar key={storiesKey} onStoryClick={setSelectedStory} />
      
      <CreatePost onPostCreated={handlePostCreated} />

      {loading && posts.length === 0 ? (
        <div className="text-center py-8 text-gray-600">Loading posts...</div>
      ) : posts.length === 0 ? (
        <div className="text-center py-8 text-gray-600">
          No posts yet. Follow some users to see their posts here!
        </div>
      ) : (
        <>
          {posts.map((post) => (
            <Post key={post._id} post={post} onDelete={handlePostDeleted} />
          ))}
          
          {hasMore && (
            <button
              onClick={loadMore}
              className="w-full py-3 text-blue-600 hover:text-blue-700 font-medium"
            >
              Load More
            </button>
          )}
        </>
      )}

      {/* Story Viewer Modal */}
      {selectedStory && (
        <StoryViewer story={selectedStory} onClose={() => setSelectedStory(null)} />
      )}

      {/* Create Story Modal */}
      {showCreateStory && (
        <CreateStory
          onClose={() => setShowCreateStory(false)}
          onCreated={handleStoryCreated}
        />
      )}
    </div>
  );
};

export default HomePage;
