const Post = require('../models/Post');
const Comment = require('../models/Comment');
const User = require('../models/User');
const AdminLog = require('../models/AdminLog');
const Bookmark = require('../models/Bookmark');
const Message = require('../models/Message');
const Notification = require('../models/Notification');
const Story = require('../models/Story');

/**
 * Log admin action
 */
const logAdminAction = async (adminId, action, targetType, targetId, reason = '') => {
  try {
    await AdminLog.create({
      admin: adminId,
      action,
      targetType,
      targetId,
      reason
    });
  } catch (error) {
    console.error('Error logging admin action:', error);
  }
};

/**
 * Admin delete post (with cascading deletion)
 */
const deletePost = async (req, res) => {
  try {
    const adminId = req.user._id;
    const { id } = req.params;
    const { reason } = req.body;

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Post not found',
          code: 'POST_NOT_FOUND'
        }
      });
    }

    // Delete associated data
    await Comment.deleteMany({ post: id });
    await Bookmark.deleteMany({ post: id });
    await Notification.deleteMany({ post: id });

    // Delete the post
    await Post.findByIdAndDelete(id);

    // Log admin action
    await logAdminAction(adminId, 'delete_post', 'post', id, reason);

    res.json({
      success: true,
      message: 'Post and associated data deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: error.message || 'Error deleting post',
        code: 'ADMIN_DELETE_POST_ERROR'
      }
    });
  }
};

/**
 * Admin delete comment
 */
const deleteComment = async (req, res) => {
  try {
    const adminId = req.user._id;
    const { id } = req.params;
    const { reason } = req.body;

    const comment = await Comment.findById(id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Comment not found',
          code: 'COMMENT_NOT_FOUND'
        }
      });
    }

    // Update post comment count
    await Post.findByIdAndUpdate(comment.post, {
      $pull: { comments: id },
      $inc: { commentCount: -1 }
    });

    // Delete notifications related to this comment
    await Notification.deleteMany({ comment: id });

    // Delete the comment
    await Comment.findByIdAndDelete(id);

    // Log admin action
    await logAdminAction(adminId, 'delete_comment', 'comment', id, reason);

    res.json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: error.message || 'Error deleting comment',
        code: 'ADMIN_DELETE_COMMENT_ERROR'
      }
    });
  }
};

/**
 * Admin delete user (with cascading deletion)
 */
const deleteUser = async (req, res) => {
  try {
    const adminId = req.user._id;
    const { id } = req.params;
    const { reason } = req.body;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'User not found',
          code: 'USER_NOT_FOUND'
        }
      });
    }

    // Prevent deleting another admin
    if (user.isAdmin) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Cannot delete admin users',
          code: 'FORBIDDEN'
        }
      });
    }

    // Delete all user's content
    await Post.deleteMany({ author: id });
    await Comment.deleteMany({ author: id });
    await Message.deleteMany({ $or: [{ sender: id }, { recipient: id }] });
    await Notification.deleteMany({ $or: [{ recipient: id }, { actor: id }] });
    await Bookmark.deleteMany({ user: id });
    await Story.deleteMany({ author: id });

    // Remove user from followers/following lists
    await User.updateMany(
      { followers: id },
      { $pull: { followers: id } }
    );
    await User.updateMany(
      { following: id },
      { $pull: { following: id } }
    );

    // Delete the user
    await User.findByIdAndDelete(id);

    // Log admin action
    await logAdminAction(adminId, 'delete_user', 'user', id, reason);

    res.json({
      success: true,
      message: 'User and all associated content deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: error.message || 'Error deleting user',
        code: 'ADMIN_DELETE_USER_ERROR'
      }
    });
  }
};

/**
 * Get admin logs
 */
const getAdminLogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const logs = await AdminLog.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('admin', 'username name');

    const total = await AdminLog.countDocuments();

    res.json({
      success: true,
      data: {
        logs,
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
        message: error.message || 'Error fetching admin logs',
        code: 'FETCH_LOGS_ERROR'
      }
    });
  }
};

/**
 * Get admin statistics
 */
const getStats = async (req, res) => {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [totalUsers, totalPosts, activeToday, newThisWeek] = await Promise.all([
      User.countDocuments(),
      Post.countDocuments(),
      User.countDocuments({ lastActive: { $gte: today } }),
      User.countDocuments({ createdAt: { $gte: weekAgo } })
    ]);

    res.json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalPosts,
          activeToday,
          newThisWeek
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: error.message || 'Error fetching statistics',
        code: 'FETCH_STATS_ERROR'
      }
    });
  }
};

/**
 * Get all users
 */
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('username name email profileImage createdAt followers following isAdmin')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        users
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: error.message || 'Error fetching users',
        code: 'FETCH_USERS_ERROR'
      }
    });
  }
};

module.exports = {
  deletePost,
  deleteComment,
  deleteUser,
  getAdminLogs,
  getStats,
  getAllUsers
};
