import { io } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
  }

  // Connect to socket server with JWT authentication
  connect(token) {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = io(SOCKET_URL, {
      auth: {
        token,
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    // Setup connection event handlers
    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket.id);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    return this.socket;
  }

  // Disconnect from socket server
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.listeners.clear();
    }
  }

  // Join a room (for notifications)
  joinRoom(room) {
    if (this.socket) {
      this.socket.emit('join_room', room);
    }
  }

  // Send a message
  sendMessage(recipientId, content) {
    if (this.socket) {
      this.socket.emit('send_message', { recipientId, content });
    }
  }

  // Emit typing indicator
  startTyping(recipientId) {
    if (this.socket) {
      this.socket.emit('typing', { recipientId });
    }
  }

  // Emit stop typing indicator
  stopTyping(recipientId) {
    if (this.socket) {
      this.socket.emit('stop_typing', { recipientId });
    }
  }

  // Listen for incoming messages
  onMessage(callback) {
    if (this.socket) {
      this.socket.on('receive_message', callback);
      this.listeners.set('receive_message', callback);
    }
  }

  // Listen for typing indicators
  onTyping(callback) {
    if (this.socket) {
      this.socket.on('user_typing', callback);
      this.listeners.set('user_typing', callback);
    }
  }

  // Listen for stop typing indicators
  onStopTyping(callback) {
    if (this.socket) {
      this.socket.on('user_stopped_typing', callback);
      this.listeners.set('user_stopped_typing', callback);
    }
  }

  // Listen for message seen status
  onMessageSeen(callback) {
    if (this.socket) {
      this.socket.on('message_seen', callback);
      this.listeners.set('message_seen', callback);
    }
  }

  // Listen for new notifications
  onNotification(callback) {
    if (this.socket) {
      this.socket.on('new_notification', callback);
      this.listeners.set('new_notification', callback);
    }
  }

  // Remove a specific event listener
  off(event) {
    if (this.socket && this.listeners.has(event)) {
      this.socket.off(event, this.listeners.get(event));
      this.listeners.delete(event);
    }
  }

  // Remove all event listeners
  removeAllListeners() {
    if (this.socket) {
      this.listeners.forEach((callback, event) => {
        this.socket.off(event, callback);
      });
      this.listeners.clear();
    }
  }

  // Check if socket is connected
  isConnected() {
    return this.socket?.connected || false;
  }
}

// Export singleton instance
const socketService = new SocketService();
export default socketService;
