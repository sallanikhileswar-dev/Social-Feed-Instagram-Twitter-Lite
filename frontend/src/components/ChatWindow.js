import React, { useState, useEffect, useRef } from 'react';
import { messageService, searchService } from '../services';
import { useMessages } from '../hooks';
import MessageBubble from './MessageBubble';

const ChatWindow = ({ conversation, showNewMessage, onSelectUser }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const messagesEndRef = useRef(null);
  const { sendMessage } = useMessages();
  const socketService = require('../utils/socket').default;

  useEffect(() => {
    if (conversation) {
      fetchMessages();
      setSearchQuery('');
      setSearchResults([]);
    } else {
      setMessages([]);
      setLoading(false);
    }
  }, [conversation]);

  // Listen for incoming messages
  useEffect(() => {
    if (!conversation) return;

    const handleIncomingMessage = (data) => {
      const { message } = data;
      // Only add message if it's from the current conversation
      if (message.sender._id === conversation.user._id || message.sender === conversation.user._id) {
        setMessages((prev) => [...prev, message]);
      }
    };

    socketService.onMessage(handleIncomingMessage);

    return () => {
      socketService.off('receive_message');
    };
  }, [conversation]);

  useEffect(() => {
    if (showNewMessage && searchQuery.trim()) {
      const timer = setTimeout(() => {
        handleSearch();
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, showNewMessage]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const response = await messageService.getMessages(conversation.user._id);
      setMessages(response.data.messages || []);
      await messageService.markMessagesAsSeen(conversation.user._id);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    setSearching(true);
    try {
      const response = await searchService.searchUsers(searchQuery);
      setSearchResults(response.data.users || []);
    } catch (error) {
      console.error('Failed to search users:', error);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = (e) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;

    sendMessage(conversation.user._id, newMessage);
    
    // Optimistically add message to UI
    setMessages((prev) => [
      ...prev,
      {
        _id: Date.now(),
        content: newMessage,
        sender: 'me',
        createdAt: new Date(),
      },
    ]);
    
    setNewMessage('');
  };

  if (showNewMessage) {
    return (
      <div className="flex-1 flex flex-col bg-white">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold mb-3">New Message</h3>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for a user..."
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          {searching ? (
            <div className="text-center text-gray-500">Searching...</div>
          ) : searchResults.length === 0 ? (
            <div className="text-center text-gray-500">
              {searchQuery.trim() ? 'No users found' : 'Search for a user to start messaging'}
            </div>
          ) : (
            <div className="space-y-2">
              {searchResults.map((user) => (
                <button
                  key={user._id}
                  onClick={() => onSelectUser(user)}
                  className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg"
                >
                  <img
                    src={user.profileImage || '/default-avatar.png'}
                    alt={user.username}
                    className="w-12 h-12 rounded-full object-cover"
                    onError={(e) => {
                      e.target.src = '/default-avatar.png';
                    }}
                  />
                  <div className="text-left">
                    <p className="font-semibold">{user.name}</p>
                    <p className="text-sm text-gray-500">@{user.username}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Select a conversation to start messaging</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Chat Header */}
      <div className="px-6 py-4 border-b flex items-center space-x-3">
        <img
          src={conversation.user.profileImage || '/default-avatar.png'}
          alt={conversation.user.username}
          className="w-10 h-10 rounded-full object-cover"
        />
        <div>
          <p className="font-semibold">{conversation.user.name}</p>
          <p className="text-sm text-gray-500">@{conversation.user.username}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <div className="text-center text-gray-500">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-500">No messages yet. Start the conversation!</div>
        ) : (
          messages.map((message) => (
            <MessageBubble key={message._id} message={message} />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSend} className="px-6 py-4 border-t">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            maxLength={1000}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatWindow;
