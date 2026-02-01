import React, { useState, useEffect } from 'react';
import { userService } from '../services';

const FollowButton = ({ userId, initialIsFollowing = false, onFollowChange }) => {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [loading, setLoading] = useState(false);

  // Sync with prop changes
  useEffect(() => {
    setIsFollowing(initialIsFollowing);
  }, [initialIsFollowing]);

  const handleToggleFollow = async () => {
    setLoading(true);
    try {
      if (isFollowing) {
        await userService.unfollowUser(userId);
        setIsFollowing(false);
        if (onFollowChange) {
          onFollowChange(false);
        }
      } else {
        await userService.followUser(userId);
        setIsFollowing(true);
        if (onFollowChange) {
          onFollowChange(true);
        }
      }
    } catch (error) {
      console.error('Failed to toggle follow:', error);
      
      // Handle specific error cases
      if (error.response?.data?.error?.code === 'ALREADY_FOLLOWING') {
        // User is already following, sync the state
        setIsFollowing(true);
        if (onFollowChange) {
          onFollowChange(true);
        }
      } else if (error.response?.data?.error?.code === 'NOT_FOLLOWING') {
        // User is not following, sync the state
        setIsFollowing(false);
        if (onFollowChange) {
          onFollowChange(false);
        }
      } else {
        // Show error to user
        alert(error.response?.data?.error?.message || 'Failed to update follow status');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggleFollow}
      disabled={loading}
      className={`px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50 ${
        isFollowing
          ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
          : 'bg-blue-600 text-white hover:bg-blue-700'
      }`}
    >
      {loading ? 'Loading...' : isFollowing ? 'Unfollow' : 'Follow'}
    </button>
  );
};

export default FollowButton;
