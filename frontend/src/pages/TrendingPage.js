import React, { useState, useEffect } from 'react';
import { postService } from '../services';
import Post from '../components/Post';

const TrendingPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrendingPosts();
  }, []);

  const fetchTrendingPosts = async () => {
    try {
      const response = await postService.getTrendingPosts(1, 20);
      const { posts: trendingPosts } = response.data;
      setPosts(trendingPosts);
    } catch (error) {
      console.error('Failed to fetch trending posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePostDeleted = (postId) => {
    setPosts((prev) => prev.filter((post) => post._id !== postId));
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">🔥 Trending</h1>

      {loading ? (
        <div className="text-center py-8 text-gray-600">Loading trending posts...</div>
      ) : posts.length === 0 ? (
        <div className="text-center py-8 text-gray-600">No trending posts</div>
      ) : (
        posts.map((post) => (
          <Post key={post._id} post={post} onDelete={handlePostDeleted} />
        ))
      )}
    </div>
  );
};

export default TrendingPage;
