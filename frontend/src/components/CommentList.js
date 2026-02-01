import React, { useState, useEffect } from 'react';
import { postService } from '../services';
import Comment from './Comment';

const CommentList = ({ postId, initialComments = [] }) => {
  const [comments, setComments] = useState(initialComments);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingComments, setFetchingComments] = useState(false);

  // Fetch comments when component mounts
  useEffect(() => {
    const fetchComments = async () => {
      setFetchingComments(true);
      try {
        const response = await postService.getPostComments(postId);
        if (response && response.data && response.data.comments) {
          setComments(response.data.comments);
        }
      } catch (error) {
        console.error('Failed to fetch comments:', error);
      } finally {
        setFetchingComments(false);
      }
    };

    fetchComments();
  }, [postId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!newComment.trim()) return;

    setLoading(true);
    try {
      const response = await postService.commentOnPost(postId, newComment);
      if (response && response.data && response.data.comment) {
        setComments((prev) => [response.data.comment, ...prev]);
      }
      setNewComment('');
    } catch (error) {
      console.error('Failed to post comment:', error);
      alert('Failed to post comment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Filter out any undefined or invalid comments
  const validComments = comments.filter(comment => comment && comment._id);

  return (
    <div>
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            maxLength={280}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            type="submit"
            disabled={loading || !newComment.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? '...' : 'Post'}
          </button>
        </div>
      </form>

      <div className="space-y-2">
        {fetchingComments ? (
          <p className="text-sm text-gray-500 text-center py-4">
            Loading comments...
          </p>
        ) : validComments.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">
            No comments yet. Be the first to comment!
          </p>
        ) : (
          validComments.map((comment) => (
            <Comment key={comment._id} comment={comment} />
          ))
        )}
      </div>
    </div>
  );
};

export default CommentList;
