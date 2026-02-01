const Message = require('../models/Message');
const User = require('../models/User');

/**
 * Get all conversations for the current user
 */
const getConversations = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get unique users the current user has messaged with
    const messages = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: userId },
            { recipient: userId }
          ]
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$sender', userId] },
              '$recipient',
              '$sender'
            ]
          },
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$recipient', userId] },
                    { $eq: ['$seen', false] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $sort: { 'lastMessage.createdAt': -1 }
      }
    ]);

    // Populate user details
    const conversations = await User.populate(messages, {
      path: '_id',
      select: 'username name profileImage'
    });

    res.json({
      success: true,
      data: {
        conversations: conversations.map(conv => ({
          user: conv._id,
          lastMessage: conv.lastMessage,
          unreadCount: conv.unreadCount
        }))
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: error.message || 'Error fetching conversations',
        code: 'FETCH_CONVERSATIONS_ERROR'
      }
    });
  }
};

/**
 * Get messages with a specific user
 */
const getMessages = async (req, res) => {
  try {
    const userId = req.user._id;
    const { userId: otherUserId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    // Check if other user exists
    const otherUser = await User.findById(otherUserId);
    if (!otherUser) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'User not found',
          code: 'USER_NOT_FOUND'
        }
      });
    }

    // Get messages between the two users
    const messages = await Message.find({
      $or: [
        { sender: userId, recipient: otherUserId },
        { sender: otherUserId, recipient: userId }
      ]
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('sender', 'username name profileImage')
      .populate('recipient', 'username name profileImage');

    const total = await Message.countDocuments({
      $or: [
        { sender: userId, recipient: otherUserId },
        { sender: otherUserId, recipient: userId }
      ]
    });

    res.json({
      success: true,
      data: {
        messages: messages.reverse(), // Reverse to show oldest first
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: error.message || 'Error fetching messages',
        code: 'FETCH_MESSAGES_ERROR'
      }
    });
  }
};

/**
 * Mark messages as seen
 */
const markMessagesAsSeen = async (req, res) => {
  try {
    const userId = req.user._id;
    const { userId: senderId } = req.params;

    // Mark all unseen messages from sender as seen
    await Message.updateMany(
      {
        sender: senderId,
        recipient: userId,
        seen: false
      },
      {
        $set: { seen: true }
      }
    );

    res.json({
      success: true,
      message: 'Messages marked as seen'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: error.message || 'Error marking messages as seen',
        code: 'MARK_SEEN_ERROR'
      }
    });
  }
};

module.exports = {
  getConversations,
  getMessages,
  markMessagesAsSeen
};
