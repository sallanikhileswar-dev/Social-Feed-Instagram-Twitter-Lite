

const { verifyAccessToken } = require('./tokenUtils');
const Message = require('../models/Message');

// Store connected users: { userId: socketId }
const connectedUsers = new Map();

/**
 * Initialize Socket.IO with authentication
 */
const initializeSocket = (io) => {
  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication token required'));
      }

      const decoded = verifyAccessToken(token);
      socket.userId = decoded.userId;
      next();
    } catch (error) {
      next(new Error('Invalid authentication token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.userId}`);
    
    // Store connected user
    connectedUsers.set(socket.userId, socket.id);

    // Join user's personal room for notifications
    socket.join(`user:${socket.userId}`);

    // Handle send message
    socket.on('send_message', async (data) => {
      try {
        const { recipientId, content } = data;

        // Create message in database
        const message = await Message.create({
          sender: socket.userId,
          recipient: recipientId,
          content
        });

        await message.populate('sender', 'username name profileImage');

        // Send to recipient if online
        const recipientSocketId = connectedUsers.get(recipientId);
        if (recipientSocketId) {
          io.to(recipientSocketId).emit('receive_message', {
            message: message.toObject()
          });
        }

        // Confirm to sender
        socket.emit('message_sent', {
          message: message.toObject()
        });
      } catch (error) {
        socket.emit('error', {
          message: 'Failed to send message',
          error: error.message
        });
      }
    });

    // Handle typing indicator
    socket.on('typing', (data) => {
      const { recipientId } = data;
      const recipientSocketId = connectedUsers.get(recipientId);
      
      if (recipientSocketId) {
        io.to(recipientSocketId).emit('user_typing', {
          userId: socket.userId
        });
      }
    });

    // Handle stop typing
    socket.on('stop_typing', (data) => {
      const { recipientId } = data;
      const recipientSocketId = connectedUsers.get(recipientId);
      
      if (recipientSocketId) {
        io.to(recipientSocketId).emit('user_stopped_typing', {
          userId: socket.userId
        });
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.userId}`);
      connectedUsers.delete(socket.userId);
    });
  });

  return io;
};

/**
 * Send notification to user
 */
const sendNotification = (io, userId, notification) => {
  io.to(`user:${userId}`).emit('new_notification', notification);
};

/**
 * Mark message as seen
 */
const markMessageAsSeen = async (io, messageId, userId) => {
  try {
    const message = await Message.findById(messageId);
    
    if (message && message.recipient.toString() === userId) {
      message.seen = true;
      await message.save();

      // Notify sender
      const senderSocketId = connectedUsers.get(message.sender.toString());
      if (senderSocketId) {
        io.to(senderSocketId).emit('message_seen', {
          messageId: message._id
        });
      }
    }
  } catch (error) {
    console.error('Error marking message as seen:', error);
  }
};

module.exports = {
  initializeSocket,
  sendNotification,
  markMessageAsSeen,
  connectedUsers
};
