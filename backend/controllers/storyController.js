const Story = require('../models/Story');
const User = require('../models/User');
const { validateImage, uploadStoryImage } = require('../utils/imageUpload');

/**
 * Create a new story
 */
const createStory = async (req, res) => {
  try {
    const userId = req.user._id;
    const { image } = req.body;

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
    const uploadResult = await uploadStoryImage(image, userId.toString());

    // Set expiration to 24 hours from now
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Create story
    const story = await Story.create({
      author: userId,
      image: uploadResult.url,
      expiresAt
    });

    await story.populate('author', 'username name profileImage');

    res.status(201).json({
      success: true,
      data: { story }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: error.message || 'Error creating story',
        code: 'CREATE_STORY_ERROR'
      }
    });
  }
};

/**
 * Get active stories from followed users
 */
const getStories = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get user's following list
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

    // Get active stories from followed users AND own stories (not expired)
    const now = new Date();
    const stories = await Story.find({
      author: { $in: [...user.following, userId] },
      expiresAt: { $gt: now }
    })
      .sort({ createdAt: 1 })
      .populate('author', 'username name profileImage');

    // Group stories by author and check if all stories are viewed
    const storiesByAuthor = stories.reduce((acc, story) => {
      const authorId = story.author._id.toString();
      const isViewed = story.viewers.some(viewerId => viewerId.toString() === userId.toString());
      
      if (!acc[authorId]) {
        acc[authorId] = {
          author: story.author,
          stories: [],
          allViewed: true
        };
      }
      
      acc[authorId].stories.push({
        ...story.toObject(),
        isViewed
      });
      
      // If any story is not viewed, set allViewed to false
      if (!isViewed) {
        acc[authorId].allViewed = false;
      }
      
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        stories: Object.values(storiesByAuthor)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: error.message || 'Error fetching stories',
        code: 'FETCH_STORIES_ERROR'
      }
    });
  }
};

/**
 * Delete a story
 */
const deleteStory = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const story = await Story.findById(id);

    if (!story) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Story not found',
          code: 'STORY_NOT_FOUND'
        }
      });
    }

    // Check if user is the author
    if (story.author.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Not authorized to delete this story',
          code: 'FORBIDDEN'
        }
      });
    }

    await Story.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Story deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: error.message || 'Error deleting story',
        code: 'DELETE_STORY_ERROR'
      }
    });
  }
};

/**
 * Mark story as viewed
 */
const viewStory = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const story = await Story.findById(id);

    if (!story) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Story not found',
          code: 'STORY_NOT_FOUND'
        }
      });
    }

    // Add user to viewers if not already there
    if (!story.viewers.includes(userId)) {
      story.viewers.push(userId);
      await story.save();
    }

    res.json({
      success: true,
      message: 'Story marked as viewed'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: error.message || 'Error marking story as viewed',
        code: 'VIEW_STORY_ERROR'
      }
    });
  }
};

/**
 * Cleanup expired stories (to be run periodically)
 */
const deleteExpiredStories = async () => {
  try {
    const now = new Date();
    const result = await Story.deleteMany({ expiresAt: { $lte: now } });
    console.log(`Deleted ${result.deletedCount} expired stories`);
    return result;
  } catch (error) {
    console.error('Error deleting expired stories:', error);
    throw error;
  }
};

module.exports = {
  createStory,
  getStories,
  viewStory,
  deleteStory,
  deleteExpiredStories
};
