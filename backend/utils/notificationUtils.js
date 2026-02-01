const Notification = require('../models/Notification');

/**
 * Create a notification
 * @param {Object} data - Notification data
 * @param {string} data.recipientId - User receiving the notification
 * @param {string} data.actorId - User performing the action
 * @param {string} data.type - Type of notification (like, comment, follow, repost)
 * @param {string} data.postId - Post ID (optional)
 * @param {string} data.commentId - Comment ID (optional)
 * @param {Object} io - Socket.IO instance
 * @returns {Promise<Object>} Created notification
 */
const createNotification = async (data, io) => {
  try {
    const { recipientId, actorId, type, postId, commentId } = data;

    // Don't create notification if actor is the recipient
    if (recipientId.toString() === actorId.toString()) {
      return null;
    }

    // Create notification
    const notification = await Notification.create({
      recipient: recipientId,
      actor: actorId,
      type,
      post: postId || null,
      comment: commentId || null
    });

    await notification.populate('actor', 'username name profileImage');
    if (postId) {
      await notification.populate('post', 'content images');
    }

    // Send real-time notification via Socket.IO
    if (io) {
      io.to(`user:${recipientId}`).emit('new_notification', {
        notification: notification.toObject()
      });
    }

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
};

/**
 * Create like notification
 */
const createLikeNotification = async (postAuthorId, actorId, postId, io) => {
  return createNotification({
    recipientId: postAuthorId,
    actorId,
    type: 'like',
    postId
  }, io);
};

/**
 * Create comment notification
 */
const createCommentNotification = async (postAuthorId, actorId, postId, commentId, io) => {
  return createNotification({
    recipientId: postAuthorId,
    actorId,
    type: 'comment',
    postId,
    commentId
  }, io);
};

/**
 * Create follow notification
 */
const createFollowNotification = async (followedUserId, actorId, io) => {
  return createNotification({
    recipientId: followedUserId,
    actorId,
    type: 'follow'
  }, io);
};

/**
 * Create repost notification
 */
const createRepostNotification = async (postAuthorId, actorId, postId, io) => {
  return createNotification({
    recipientId: postAuthorId,
    actorId,
    type: 'repost',
    postId
  }, io);
};

module.exports = {
  createNotification,
  createLikeNotification,
  createCommentNotification,
  createFollowNotification,
  createRepostNotification
};
