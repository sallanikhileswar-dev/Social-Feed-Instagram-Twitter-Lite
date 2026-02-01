import { useEffect } from 'react';
import socketService from '../utils/socket';
import { useMessageStore } from '../store';

/**
 * Custom hook for handling real-time messaging
 */
const useMessages = () => {
  const { addMessage, updateConversation, markAsSeen } = useMessageStore();

  useEffect(() => {
    // Listen for incoming messages
    socketService.onMessage((message) => {
      addMessage(message);
      updateConversation(message.sender, message);
    });

    // Listen for typing indicators
    socketService.onTyping((data) => {
      // Handle typing indicator UI update
      console.log('User typing:', data);
    });

    // Listen for stop typing indicators
    socketService.onStopTyping((data) => {
      // Handle stop typing UI update
      console.log('User stopped typing:', data);
    });

    // Listen for message seen status
    socketService.onMessageSeen((data) => {
      markAsSeen(data.userId);
    });

    // Cleanup listeners on unmount
    return () => {
      socketService.off('receive_message');
      socketService.off('user_typing');
      socketService.off('user_stopped_typing');
      socketService.off('message_seen');
    };
  }, [addMessage, updateConversation, markAsSeen]);

  // Return socket methods for sending messages
  return {
    sendMessage: socketService.sendMessage.bind(socketService),
    startTyping: socketService.startTyping.bind(socketService),
    stopTyping: socketService.stopTyping.bind(socketService),
  };
};

export default useMessages;
