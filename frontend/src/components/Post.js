import { useState } from 'react';
import { Link } from 'react-router-dom';
import { postService } from '../services';
import { useAuthStore } from '../store';
import CommentList from './CommentList';
import { getDefaultAvatar } from '../utils/defaultAvatar';

const Post = ({ post: initialPost, onDelete }) => {
  const currentUser = useAuthStore((state) => state.user);
  const [post, setPost] = useState(initialPost);
  const [showComments, setShowComments] = useState(false);
  const [isLiked, setIsLiked] = useState(
    post.likes?.includes(currentUser?._id) || false
  );

  const handleLike = async () => {
    try {
      if (isLiked) {
        await postService.unlikePost(post._id);
        setPost((prev) => ({
          ...prev,
          likeCount: prev.likeCount - 1,
        }));
      } else {
        await postService.likePost(post._id);
        setPost((prev) => ({
          ...prev,
          likeCount: prev.likeCount + 1,
        }));
      }
      setIsLiked(!isLiked);
    } catch (error) {
      console.error('Failed to toggle like:', error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await postService.deletePost(post._id);
        if (onDelete) {
          onDelete(post._id);
        }
      } catch (error) {
        console.error('Failed to delete post:', error);
      }
    }
  };

  const handleBookmark = async () => {
    try {
      await postService.bookmarkPost(post._id);
      alert('Post bookmarked!');
    } catch (error) {
      console.error('Failed to bookmark post:', error);
    }
  };

  const handleRepost = async () => {
    try {
      await postService.repostPost(post._id);
      alert('Post reposted!');
    } catch (error) {
      console.error('Failed to repost:', error);
    }
  };

  return (
    <div className="card-premium p-6 mb-6 animate-slide-up hover:shadow-xl transition-all duration-300">
      {/* Post Header */}
      <div className="flex items-center justify-between mb-4">
        <Link
          to={`/profile/${post.author._id}`}
          className="flex items-center space-x-3 group"
        >
          <div className="relative">
            <img
              src={post.author.profileImage || getDefaultAvatar(post.author.username, post.author.name)}
              alt={post.author.username}
              className="w-12 h-12 rounded-full object-cover ring-2 ring-white shadow-md group-hover:ring-purple-200 transition-all duration-200"
              onError={(e) => {
                e.target.src = getDefaultAvatar(post.author.username, post.author.name);
              }}
            />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
          </div>
          <div>
            <p className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors duration-200">
              {post.author.name}
            </p>
            <p className="text-sm text-gray-500">@{post.author.username}</p>
          </div>
        </Link>
        
        {currentUser?._id === post.author._id && (
          <button
            onClick={handleDelete}
            className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all duration-200"
            title="Delete post"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>

      {/* Post Content */}
      <div className="mb-4">
        <p className="text-gray-800 text-base leading-relaxed whitespace-pre-wrap">
          {post.content}
        </p>
      </div>

      {/* Post Images */}
      {post.images && post.images.length > 0 && (
        <div className="mb-4 rounded-xl overflow-hidden">
          {post.images.length === 1 ? (
            <img
              src={post.images[0]}
              alt="Post content"
              className="w-full object-cover max-h-96 hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                console.error('Image load error:', e);
                e.target.style.display = 'none';
              }}
            />
          ) : (
            <div className={`grid gap-2 ${post.images.length === 2 ? 'grid-cols-2' : 'grid-cols-2'}`}>
              {post.images.slice(0, 4).map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`Post content ${index + 1}`}
                  className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    console.error('Image load error:', e);
                    e.target.style.display = 'none';
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Post Stats */}
      <div className="flex items-center space-x-6 text-sm text-gray-500 mb-4 pb-4 border-b border-gray-100">
        <span className="font-medium">{post.likeCount || 0} likes</span>
        <span className="font-medium">{post.commentCount || 0} comments</span>
        <span className="text-gray-400">
          {new Date(post.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          })}
        </span>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-around mb-4">
        <button
          onClick={handleLike}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-semibold transition-all duration-200 ${
            isLiked
              ? 'text-pink-600 bg-pink-50 hover:bg-pink-100'
              : 'text-gray-600 hover:text-pink-600 hover:bg-pink-50'
          }`}
        >
          <svg className="w-5 h-5" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <span className="text-sm">Like</span>
        </button>

        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl font-semibold text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span className="text-sm">Comment</span>
        </button>

        <button
          onClick={handleRepost}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl font-semibold text-gray-600 hover:text-green-600 hover:bg-green-50 transition-all duration-200"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
          <span className="text-sm">Share</span>
        </button>

        <button
          onClick={handleBookmark}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl font-semibold text-gray-600 hover:text-purple-600 hover:bg-purple-50 transition-all duration-200"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
          <span className="text-sm">Save</span>
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="mt-6 pt-6 border-t border-gray-100 animate-slide-up">
          <CommentList postId={post._id} />
        </div>
      )}
    </div>
  );
};

export default Post;
