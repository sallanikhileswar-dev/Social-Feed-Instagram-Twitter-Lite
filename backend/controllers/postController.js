const Post = require('../models/Post');
const Comment = require('../models/Comment');
const { uploadPostImages, validateImage } = require('../utils/imageUpload');

/**
 * Create a new post
 */
const createPost = async (req, res) => {
  try {
    const userId = req.user._id;
    const { content, images } = req.body;

    // Check if Cloudinary is configured
    const cloudinaryConfigured = process.env.CLOUDINARY_CLOUD_NAME && 
                                  process.env.CLOUDINARY_API_KEY && 
                                  process.env.CLOUDINARY_API_SECRET &&
                                  process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name';

    // Validate images if provided
    if (images && images.length > 0) {
      if (!cloudinaryConfigured) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Image upload is not configured. Please configure Cloudinary in environment variables.',
            code: 'CLOUDINARY_NOT_CONFIGURED'
          }
        });
      }

      if (images.length > 4) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Maximum 4 images allowed per post',
            code: 'TOO_MANY_IMAGES'
          }
        });
      }

      // Validate each image
      for (const image of images) {
        const validation = validateImage(image);
        if (!validation.valid) {
          return res.status(400).json({
            success: false,
            error: {
              message: validation.error,
              code: 'INVALID_IMAGE'
            }
          });
        }
      }

      // Upload images to Cloudinary
      const uploadResults = await uploadPostImages(images, userId.toString());
      const imageUrls = uploadResults.map(result => result.url);

      // Create post with images
      const post = await Post.create({
        author: userId,
        content,
        images: imageUrls
      });

      await post.populate('author', 'username name profileImage followers following');

      return res.status(201).json({
        success: true,
        data: { post }
      });
    }

    // Create post without images
    const post = await Post.create({
      author: userId,
      content
    });

    await post.populate('author', 'username name profileImage followers following');

    res.status(201).json({
      success: true,
      data: { post }
    });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({
      success: false,
      error: {
        message: error.message || 'Error creating post',
        code: 'CREATE_POST_ERROR',
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }
    });
  }
};

/**
 * Delete a post
 */
const deletePost = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

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

    // Check if user is the author
    if (post.author.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Not authorized to delete this post',
          code: 'FORBIDDEN'
        }
      });
    }

    // Delete associated comments
    await Comment.deleteMany({ post: id });

    // Delete the post
    await Post.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: error.message || 'Error deleting post',
        code: 'DELETE_POST_ERROR'
      }
    });
  }
};

/**
 * Get a single post
 */
const getPost = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await Post.findById(id)
      .populate('author', 'username name profileImage')
      .populate({
        path: 'comments',
        populate: {
          path: 'author',
          select: 'username name profileImage'
        },
        options: { sort: { createdAt: -1 }, limit: 10 }
      });

    if (!post) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Post not found',
          code: 'POST_NOT_FOUND'
        }
      });
    }

    res.json({
      success: true,
      data: { post }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: error.message || 'Error fetching post',
        code: 'FETCH_POST_ERROR'
      }
    });
  }
};

module.exports = {
  createPost,
  deletePost,
  getPost
};

/**
 * Like a post
 */
const likePost = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

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

    // Check if already liked
    if (post.likes.includes(userId)) {
      return res.status(409).json({
        success: false,
        error: {
          message: 'Post already liked',
          code: 'ALREADY_LIKED'
        }
      });
    }

    // Add like
    post.likes.push(userId);
    post.likeCount += 1;
    await post.save();

    // Create notification for post author
    const { createLikeNotification } = require('../utils/notificationUtils');
    const io = req.app.get('io');
    await createLikeNotification(post.author, userId, id, io);

    res.json({
      success: true,
      message: 'Post liked successfully',
      data: {
        likeCount: post.likeCount
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: error.message || 'Error liking post',
        code: 'LIKE_POST_ERROR'
      }
    });
  }
};

/**
 * Unlike a post
 */
const unlikePost = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

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

    // Check if not liked
    if (!post.likes.includes(userId)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Post not liked yet',
          code: 'NOT_LIKED'
        }
      });
    }

    // Remove like
    post.likes = post.likes.filter(id => id.toString() !== userId.toString());
    post.likeCount -= 1;
    await post.save();

    res.json({
      success: true,
      message: 'Post unliked successfully',
      data: {
        likeCount: post.likeCount
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: error.message || 'Error unliking post',
        code: 'UNLIKE_POST_ERROR'
      }
    });
  }
};

/**
 * Comment on a post
 */
const commentOnPost = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const { content } = req.body;

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

    // Create comment
    const comment = await Comment.create({
      post: id,
      author: userId,
      content
    });

    await comment.populate('author', 'username name profileImage');

    // Add comment to post
    post.comments.push(comment._id);
    post.commentCount += 1;
    await post.save();

    // Create notification for post author
    const { createCommentNotification } = require('../utils/notificationUtils');
    const io = req.app.get('io');
    await createCommentNotification(post.author, userId, id, comment._id, io);

    res.status(201).json({
      success: true,
      data: { comment }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: error.message || 'Error commenting on post',
        code: 'COMMENT_ERROR'
      }
    });
  }
};

/**
 * Get comments for a post
 */
const getPostComments = async (req, res) => {
  try {
    const { id } = req.params;

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

    // Get all comments for this post
    const comments = await Comment.find({ post: id })
      .sort({ createdAt: -1 })
      .populate('author', 'username name profileImage');

    res.json({
      success: true,
      data: { comments }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: error.message || 'Error fetching comments',
        code: 'FETCH_COMMENTS_ERROR'
      }
    });
  }
};

/**
 * Repost a post
 */
const repostPost = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const originalPost = await Post.findById(id);

    if (!originalPost) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Post not found',
          code: 'POST_NOT_FOUND'
        }
      });
    }

    // Check if already reposted
    if (originalPost.reposts.includes(userId)) {
      return res.status(409).json({
        success: false,
        error: {
          message: 'Post already reposted',
          code: 'ALREADY_REPOSTED'
        }
      });
    }

    // Create repost
    const repost = await Post.create({
      author: userId,
      content: originalPost.content,
      images: originalPost.images,
      originalPost: id
    });

    await repost.populate('author', 'username name profileImage');
    await repost.populate('originalPost');

    // Update original post
    originalPost.reposts.push(userId);
    originalPost.repostCount += 1;
    await originalPost.save();

    // Create notification for original post author
    const { createRepostNotification } = require('../utils/notificationUtils');
    const io = req.app.get('io');
    await createRepostNotification(originalPost.author, userId, id, io);

    res.status(201).json({
      success: true,
      data: { repost }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: error.message || 'Error reposting',
        code: 'REPOST_ERROR'
      }
    });
  }
};

module.exports = {
  createPost,
  deletePost,
  getPost,
  likePost,
  unlikePost,
  commentOnPost,
  repostPost
};

const Bookmark = require('../models/Bookmark');

/**
 * Bookmark a post
 */
const bookmarkPost = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    // Check if post exists
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

    // Check if already bookmarked
    const existingBookmark = await Bookmark.findOne({ user: userId, post: id });
    if (existingBookmark) {
      return res.status(409).json({
        success: false,
        error: {
          message: 'Post already bookmarked',
          code: 'ALREADY_BOOKMARKED'
        }
      });
    }

    // Create bookmark
    const bookmark = await Bookmark.create({
      user: userId,
      post: id
    });

    res.status(201).json({
      success: true,
      message: 'Post bookmarked successfully',
      data: { bookmark }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: error.message || 'Error bookmarking post',
        code: 'BOOKMARK_ERROR'
      }
    });
  }
};

/**
 * Remove bookmark
 */
const removeBookmark = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const bookmark = await Bookmark.findOneAndDelete({ user: userId, post: id });

    if (!bookmark) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Bookmark not found',
          code: 'BOOKMARK_NOT_FOUND'
        }
      });
    }

    res.json({
      success: true,
      message: 'Bookmark removed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: error.message || 'Error removing bookmark',
        code: 'REMOVE_BOOKMARK_ERROR'
      }
    });
  }
};

/**
 * Get user's bookmarked posts
 */
const getBookmarkedPosts = async (req, res) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const bookmarks = await Bookmark.find({ user: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: 'post',
        populate: {
          path: 'author',
          select: 'username name profileImage'
        }
      });

    const total = await Bookmark.countDocuments({ user: userId });

    res.json({
      success: true,
      data: {
        bookmarks: bookmarks.map(b => b.post),
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
        message: error.message || 'Error fetching bookmarks',
        code: 'FETCH_BOOKMARKS_ERROR'
      }
    });
  }
};

module.exports = {
  createPost,
  deletePost,
  getPost,
  likePost,
  unlikePost,
  commentOnPost,
  repostPost,
  bookmarkPost,
  removeBookmark,
  getBookmarkedPosts
};

/**
 * Get following feed (posts from users the current user follows)
 */
const getFollowingFeed = async (req, res) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const User = require('../models/User');
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'User not found',
          code: 'USER_NOT_FOUND'
        }
      });
    }

    // Get posts from followed users
    const posts = await Post.find({ author: { $in: user.following } })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'username name profileImage')
      .populate({
        path: 'originalPost',
        populate: {
          path: 'author',
          select: 'username name profileImage'
        }
      });

    const total = await Post.countDocuments({ author: { $in: user.following } });

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
        message: error.message || 'Error fetching following feed',
        code: 'FETCH_FEED_ERROR'
      }
    });
  }
};

/**
 * Get global feed (all posts)
 */
const getGlobalFeed = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'username name profileImage')
      .populate({
        path: 'originalPost',
        populate: {
          path: 'author',
          select: 'username name profileImage'
        }
      });

    const total = await Post.countDocuments();

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
        message: error.message || 'Error fetching global feed',
        code: 'FETCH_FEED_ERROR'
      }
    });
  }
};

/**
 * Get trending posts (high engagement in last 24 hours)
 */
const getTrendingPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Get posts from last 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const posts = await Post.find({ createdAt: { $gte: oneDayAgo } })
      .sort({ likeCount: -1, commentCount: -1, repostCount: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'username name profileImage')
      .populate({
        path: 'originalPost',
        populate: {
          path: 'author',
          select: 'username name profileImage'
        }
      });

    const total = await Post.countDocuments({ createdAt: { $gte: oneDayAgo } });

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
        message: error.message || 'Error fetching trending posts',
        code: 'FETCH_TRENDING_ERROR'
      }
    });
  }
};

/**
 * Get user posts
 */
const getUserPosts = async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const posts = await Post.find({ author: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'username name profileImage');

    const total = await Post.countDocuments({ author: userId });

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
        message: error.message || 'Error fetching user posts',
        code: 'FETCH_USER_POSTS_ERROR'
      }
    });
  }
};

module.exports = {
  createPost,
  deletePost,
  getPost,
  likePost,
  unlikePost,
  commentOnPost,
  getPostComments,
  repostPost,
  bookmarkPost,
  removeBookmark,
  getBookmarkedPosts,
  getFollowingFeed,
  getGlobalFeed,
  getTrendingPosts,
  getUserPosts
};
