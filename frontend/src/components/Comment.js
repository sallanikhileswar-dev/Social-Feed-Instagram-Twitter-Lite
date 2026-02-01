import React from 'react';
import { Link } from 'react-router-dom';

const Comment = ({ comment }) => {
  // Safety check for comment data
  if (!comment || !comment.author) {
    return null;
  }

  const authorId = comment.author._id || comment.author;
  const authorName = comment.author.name || 'Unknown User';
  const authorUsername = comment.author.username || 'unknown';
  const authorImage = comment.author.profileImage || '/default-avatar.png';

  return (
    <div className="flex space-x-2 py-2">
      <Link to={`/profile/${authorId}`}>
        <img
          src={authorImage}
          alt={authorUsername}
          className="w-8 h-8 rounded-full object-cover"
          onError={(e) => {
            e.target.src = '/default-avatar.png';
          }}
        />
      </Link>
      <div className="flex-1">
        <div className="bg-gray-100 rounded-lg px-3 py-2">
          <Link
            to={`/profile/${authorId}`}
            className="font-semibold text-sm text-gray-900 hover:underline"
          >
            {authorName}
          </Link>
          <p className="text-sm text-gray-800 mt-1">{comment.content}</p>
        </div>
        <p className="text-xs text-gray-500 mt-1 ml-3">
          {comment.createdAt ? new Date(comment.createdAt).toLocaleDateString() : 'Just now'}
        </p>
      </div>
    </div>
  );
};

export default Comment;
