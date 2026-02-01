const User = require('../models/User');

/**
 * Get user profile by ID
 */
const getProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user?._id; // May be undefined if not authenticated

    const user = await User.findById(id)
      .select('-password -refreshToken -resetPasswordToken -resetPasswordExpires')
      .populate('followers', 'username name profileImage')
      .populate('following', 'username name profileImage');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'User not found',
          code: 'USER_NOT_FOUND'
        }
      });
    }

    // Check if current user is following this profile
    let isFollowing = false;
    if (currentUserId) {
      const currentUser = await User.findById(currentUserId);
      isFollowing = currentUser?.following.some(
        followingId => followingId.toString() === id
      ) || false;
    }

    // Get user's posts count (will be implemented later)
    // const postsCount = await Post.countDocuments({ author: id });

    res.json({
      success: true,
      data: {
        user: {
          ...user.toObject(),
          followerCount: user.followers.length,
          followingCount: user.following.length,
          isFollowing
          // postsCount
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: error.message || 'Error fetching profile',
        code: 'FETCH_PROFILE_ERROR'
      }
    });
  }
};

/**
 * Update user profile
 */
const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { name, bio, website, location } = req.body;

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

    // Update fields
    if (name !== undefined) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (website !== undefined) user.website = website;
    if (location !== undefined) user.location = location;

    await user.save();

    res.json({
      success: true,
      data: {
        user: user.toSafeObject()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: error.message || 'Error updating profile',
        code: 'UPDATE_PROFILE_ERROR'
      }
    });
  }
};

/**
 * Upload profile image
 */
const uploadProfileImage = async (req, res) => {
  try {
    const userId = req.user._id;
    const { image } = req.body; // Base64 encoded image

    const { validateImage, uploadProfileImage: uploadToCloudinary } = require('../utils/imageUpload');

    // Validate image
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

    // Upload to Cloudinary
    const uploadResult = await uploadToCloudinary(image, userId.toString());

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

    user.profileImage = uploadResult.url;
    await user.save();

    res.json({
      success: true,
      data: {
        user: user.toSafeObject(),
        image: uploadResult
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: error.message || 'Error uploading profile image',
        code: 'UPLOAD_IMAGE_ERROR'
      }
    });
  }
};

/**
 * Follow a user
 */
const followUser = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id: targetUserId } = req.params;

    // Can't follow yourself
    if (userId.toString() === targetUserId) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Cannot follow yourself',
          code: 'INVALID_OPERATION'
        }
      });
    }

    const user = await User.findById(userId);
    const targetUser = await User.findById(targetUserId);

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'User not found',
          code: 'USER_NOT_FOUND'
        }
      });
    }

    // Check if already following
    if (user.following.includes(targetUserId)) {
      return res.status(409).json({
        success: false,
        error: {
          message: 'Already following this user',
          code: 'ALREADY_FOLLOWING'
        }
      });
    }

    // Add to following and followers
    user.following.push(targetUserId);
    targetUser.followers.push(userId);

    await user.save();
    await targetUser.save();

    // Create notification for follow
    const { createFollowNotification } = require('../utils/notificationUtils');
    const io = req.app.get('io');
    await createFollowNotification(targetUserId, userId, io);

    res.json({
      success: true,
      message: 'User followed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: error.message || 'Error following user',
        code: 'FOLLOW_ERROR'
      }
    });
  }
};

/**
 * Unfollow a user
 */
const unfollowUser = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id: targetUserId } = req.params;

    const user = await User.findById(userId);
    const targetUser = await User.findById(targetUserId);

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'User not found',
          code: 'USER_NOT_FOUND'
        }
      });
    }

    // Check if following
    if (!user.following.includes(targetUserId)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Not following this user',
          code: 'NOT_FOLLOWING'
        }
      });
    }

    // Remove from following and followers
    user.following = user.following.filter(id => id.toString() !== targetUserId);
    targetUser.followers = targetUser.followers.filter(id => id.toString() !== userId.toString());

    await user.save();
    await targetUser.save();

    res.json({
      success: true,
      message: 'User unfollowed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: error.message || 'Error unfollowing user',
        code: 'UNFOLLOW_ERROR'
      }
    });
  }
};

/**
 * Get user's followers
 */
const getFollowers = async (req, res) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const user = await User.findById(id)
      .populate({
        path: 'followers',
        select: 'username name profileImage bio',
        options: { skip, limit }
      });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'User not found',
          code: 'USER_NOT_FOUND'
        }
      });
    }

    const total = user.followers.length;

    res.json({
      success: true,
      data: {
        followers: user.followers,
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
        message: error.message || 'Error fetching followers',
        code: 'FETCH_FOLLOWERS_ERROR'
      }
    });
  }
};

/**
 * Get user's following
 */
const getFollowing = async (req, res) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const user = await User.findById(id)
      .populate({
        path: 'following',
        select: 'username name profileImage bio',
        options: { skip, limit }
      });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'User not found',
          code: 'USER_NOT_FOUND'
        }
      });
    }

    const total = user.following.length;

    res.json({
      success: true,
      data: {
        following: user.following,
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
        message: error.message || 'Error fetching following',
        code: 'FETCH_FOLLOWING_ERROR'
      }
    });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  uploadProfileImage,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing
};
