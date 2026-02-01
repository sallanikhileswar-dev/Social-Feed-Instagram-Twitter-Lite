import React, { useState, useEffect } from 'react';
import { postService } from '../services';
import Post from '../components/Post';

const ExplorePage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchPosts(page);
  }, [page]);

  const fetchPosts = async (currentPage) => {
    setLoading(true);
    try {
      const response = await postService.getGlobalFeed(currentPage, 10);
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

  const handlePostDeleted = (postId) => {
    setPosts((prev) => prev.filter((post) => post._id !== postId));
  };

  const loadMore = () => {
    setPage((prev) => prev + 1);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Explore</h1>

      {loading && posts.length === 0 ? (
        <div className="text-center py-8 text-gray-600">Loading posts...</div>
      ) : posts.length === 0 ? (
        <div className="text-center py-8 text-gray-600">No posts available</div>
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
    </div>
  );
};

export default ExplorePage;
