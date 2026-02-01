import React from 'react';
import { useAuthStore } from '../store';

const MessageBubble = ({ message }) => {
  const currentUser = useAuthStore((state) => state.user);
  
  // Handle both object and string sender formats
  const senderId = typeof message.sender === 'object' ? message.sender._id : message.sender;
  const isOwnMessage = senderId === currentUser?._id || message.sender === 'me';

  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-2`}>
      <div
        className={`max-w-xs px-4 py-2 rounded-lg ${
          isOwnMessage
            ? 'bg-blue-600 text-white'
            : 'bg-gray-200 text-gray-900'
        }`}
      >
        <p className="text-sm">{message.content}</p>
        <p className={`text-xs mt-1 ${isOwnMessage ? 'text-blue-100' : 'text-gray-500'}`}>
          {new Date(message.createdAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>
    </div>
  );
};

export default MessageBubble;
