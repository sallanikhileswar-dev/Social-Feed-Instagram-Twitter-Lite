import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import FollowButton from './FollowButton';
import { useAuthStore } from '../store';

const UserCard = ({ user, showFollowButton = false }) => {
  const currentUser = useAuthStore((state) => state.user);
  const [isFollowing, setIsFollowing] = useState(user.isFollowing || false);
  
  // Don't show follow button for own profile
  const isOwnProfile = currentUser?._id === user._id;

  return (
    <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow">
      <Link to={`/profile/${user._id}`} className="flex items-center space-x-3">
        <img
          src={user.profileImage || '/default-avatar.png'}
          alt={user.username}
          className="w-12 h-12 rounded-full object-cover"
          onError={(e) => {
            e.target.src = '/default-avatar.png';
          }}
        />
        <div>
          <p className="font-semibold text-gray-900">{user.name}</p>
          <p className="text-sm text-gray-500">@{user.username}</p>
          {user.bio && (
            <p className="text-sm text-gray-600 mt-1 line-clamp-1">{user.bio}</p>
          )}
        </div>
      </Link>
      
      {showFollowButton && !isOwnProfile && (
        <FollowButton
          userId={user._id}
          initialIsFollowing={isFollowing}
          onFollowChange={(following) => setIsFollowing(following)}
        />
      )}
    </div>
  );
};

export default UserCard;
