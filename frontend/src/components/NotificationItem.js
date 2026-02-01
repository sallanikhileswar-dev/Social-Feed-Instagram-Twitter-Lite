import React from 'react';
import { Link } from 'react-router-dom';

const NotificationItem = ({ notification }) => {
  const getNotificationText = () => {
    switch (notification.type) {
      case 'like':
        return 'liked your post';
      case 'comment':
        return 'commented on your post';
      case 'follow':
        return 'started following you';
      case 'repost':
        return 'reposted your post';
      default:
        return 'interacted with your content';
    }
  };

  const getNotificationIcon = () => {
    switch (notification.type) {
      case 'like':
        return '❤️';
      case 'comment':
        return '💬';
      case 'follow':
        return '👤';
      case 'repost':
        return '🔄';
      default:
        return '🔔';
    }
  };

  return (
    <div className={`flex items-start space-x-3 p-4 hover:bg-gray-50 ${!notification.read ? 'bg-blue-50' : ''}`}>
      <span className="text-2xl">{getNotificationIcon()}</span>
      <div className="flex-1">
        <p className="text-sm">
          <Link
            to={`/profile/${notification.actor._id}`}
            className="font-semibold hover:underline"
          >
            {notification.actor.name}
          </Link>
          {' '}
          <span className="text-gray-600">{getNotificationText()}</span>
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {new Date(notification.createdAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
};

export default NotificationItem;
