const User = require('../models/User');
const Post = require('../models/Post');

/**
 * Search users by username or name
 */
const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    if (!q || q.trim() === '') {
      return res.json({
        success: true,
        data: {
          users: [],
          pagination: {
            page,
            limit,
            total: 0,
            pages: 0
          }
        }
      });
    }

    // Case-insensitive partial matching on username and name
    const searchRegex = new RegExp(q, 'i');
    
    const users = await User.find({
      $or: [
        { username: searchRegex },
        { name: searchRegex }
      ]
    })
      .select('username name profileImage bio')
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments({
      $or: [
        { username: searchRegex },
        { name: searchRegex }
      ]
    });

    res.json({
      success: true,
      data: {
        users,
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
        message: error.message || 'Error searching users',
        code: 'SEARCH_USERS_ERROR'
      }
    });
  }
};

/**
 * Search posts by content
 */
const searchPosts = async (req, res) => {
  try {
    const { q } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    if (!q || q.trim() === '') {
      return res.json({
        success: true,
        data: {
          posts: [],
          pagination: {
            page,
            limit,
            total: 0,
            pages: 0
          }
        }
      });
    }

    // MongoDB text search
    const posts = await Post.find(
      { $text: { $search: q } },
      { score: { $meta: 'textScore' } }
    )
      .sort({ score: { $meta: 'textScore' }, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'username name profileImage');

    const total = await Post.countDocuments({ $text: { $search: q } });

    res.json({
      success: true,
      data: {
        posts,
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
        message: error.message || 'Error searching posts',
        code: 'SEARCH_POSTS_ERROR'
      }
    });
  }
};

module.exports = {
  searchUsers,
  searchPosts
};
