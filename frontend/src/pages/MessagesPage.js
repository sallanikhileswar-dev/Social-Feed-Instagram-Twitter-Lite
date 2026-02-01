import { useState, useEffect } from 'react';
import { messageService } from '../services';
import ChatWindow from '../components/ChatWindow';
import { getDefaultAvatar } from '../utils/defaultAvatar';

const MessagesPage = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showNewMessage, setShowNewMessage] = useState(false);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const response = await messageService.getConversations();
      setConversations(response.data.conversations || []);
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleNewMessage = () => {
    setShowNewMessage(true);
    setSelectedConversation(null);
  };

  const handleSelectUser = (user) => {
    setSelectedConversation({ user });
    setShowNewMessage(false);
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-gradient-to-br from-gray-50 to-white">
      {/* Conversations List */}
      <div className="w-96 border-r border-gray-200 bg-white/80 backdrop-blur-sm overflow-y-auto">
        <div className="px-6 py-5 border-b border-gray-200 bg-white/90 backdrop-blur-sm sticky top-0 z-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Messages
            </h2>
            <button
              onClick={handleNewMessage}
              className="p-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
              title="New Message"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-purple-400 focus:ring-4 focus:ring-purple-50 outline-none transition-all duration-200 text-sm"
            />
            <svg className="w-5 h-5 text-gray-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-purple-200 border-t-purple-600"></div>
            <p className="mt-3 text-gray-500 font-medium">Loading conversations...</p>
          </div>
        ) : conversations.length === 0 ? (
          <div className="p-8 text-center animate-fade-in">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center">
              <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-gray-600 font-medium mb-4">No conversations yet</p>
            <button
              onClick={handleNewMessage}
              className="btn-gradient px-6 py-2.5"
            >
              Start Chatting
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {conversations.map((conversation) => (
              <button
                key={conversation.user._id}
                onClick={() => {
                  setSelectedConversation(conversation);
                  setShowNewMessage(false);
                }}
                className={`w-full px-6 py-4 flex items-center space-x-3 hover:bg-purple-50 transition-all duration-200 ${
                  selectedConversation?.user._id === conversation.user._id && !showNewMessage
                    ? 'bg-gradient-to-r from-purple-50 to-indigo-50 border-l-4 border-purple-600'
                    : ''
                }`}
              >
                <div className="relative">
                  <img
                    src={conversation.user.profileImage || getDefaultAvatar(conversation.user.username, conversation.user.name)}
                    alt={conversation.user.username}
                    className="w-14 h-14 rounded-full object-cover ring-2 ring-white shadow-md"
                    onError={(e) => {
                      e.target.src = getDefaultAvatar(conversation.user.username, conversation.user.name);
                    }}
                  />
                  <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{conversation.user.name}</p>
                  <p className="text-sm text-gray-500 truncate">
                    {conversation.lastMessage?.content || 'No messages yet'}
                  </p>
                </div>
                {conversation.unreadCount > 0 && (
                  <span className="bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-bold rounded-full px-2.5 py-1 shadow-md animate-pulse">
                    {conversation.unreadCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Chat Window */}
      <ChatWindow 
        conversation={selectedConversation} 
        showNewMessage={showNewMessage}
        onSelectUser={handleSelectUser}
      />
    </div>
  );
};

export default MessagesPage;
