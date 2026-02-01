const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const { verifyAccessTokenMiddleware } = require('../middleware/auth');
const {
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
} = require('../controllers/postController');
const { validate } = require('../middleware/validate');

// Validation
const createPostValidation = [
  body('content')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Content must not exceed 500 characters'),
  body('images')
    .optional()
    .isArray()
    .withMessage('Images must be an array'),
  body('images.*')
    .optional()
    .isString()
    .withMessage('Each image must be a base64 string'),
  // Custom validation: at least content or images must be provided
  body().custom((value, { req }) => {
    const hasContent = req.body.content && req.body.content.trim().length > 0;
    const hasImages = req.body.images && req.body.images.length > 0;
    
    if (!hasContent && !hasImages) {
      throw new Error('Post must have either content or images');
    }
    return true;
  })
];

const postIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid post ID')
];

const commentValidation = [
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Content is required')
    .isLength({ max: 280 })
    .withMessage('Comment must not exceed 280 characters')
];

// Routes
router.get('/feed/following', verifyAccessTokenMiddleware, getFollowingFeed);
router.get('/feed/global', getGlobalFeed);
router.get('/feed/trending', getTrendingPosts);
router.get('/bookmarks/me', verifyAccessTokenMiddleware, getBookmarkedPosts);
router.get('/user/:userId', getUserPosts);
router.post('/', verifyAccessTokenMiddleware, createPostValidation, validate, createPost);
router.delete('/:id', verifyAccessTokenMiddleware, postIdValidation, validate, deletePost);
router.get('/:id', postIdValidation, validate, getPost);
router.post('/:id/like', verifyAccessTokenMiddleware, postIdValidation, validate, likePost);
router.delete('/:id/like', verifyAccessTokenMiddleware, postIdValidation, validate, unlikePost);
router.post('/:id/comment', verifyAccessTokenMiddleware, postIdValidation, commentValidation, validate, commentOnPost);
router.get('/:id/comments', postIdValidation, validate, getPostComments);
router.post('/:id/repost', verifyAccessTokenMiddleware, postIdValidation, validate, repostPost);
router.post('/:id/bookmark', verifyAccessTokenMiddleware, postIdValidation, validate, bookmarkPost);
router.delete('/:id/bookmark', verifyAccessTokenMiddleware, postIdValidation, validate, removeBookmark);

module.exports = router;
