const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const { verifyAccessTokenMiddleware } = require('../middleware/auth');
const {
  getProfile,
  updateProfile,
  uploadProfileImage,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing
} = require('../controllers/userController');
const { validate } = require('../middleware/validate');

// Validation
const updateProfileValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Name must not exceed 50 characters'),
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 160 })
    .withMessage('Bio must not exceed 160 characters'),
  body('website')
    .optional()
    .trim(),
  body('location')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Location must not exceed 50 characters')
];

const uploadImageValidation = [
  body('image')
    .notEmpty()
    .withMessage('Image is required')
    .isString()
    .withMessage('Image must be a base64 string')
];

const userIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid user ID')
];

// Optional auth middleware - adds user to req if token exists, but doesn't fail if missing
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    // Try to verify token, but don't fail if invalid
    try {
      const token = authHeader.substring(7);
      const { verifyAccessToken } = require('../utils/tokenUtils');
      const decoded = verifyAccessToken(token);
      req.user = { _id: decoded.userId };
    } catch (error) {
      // Token invalid or expired, continue without user
    }
  }
  next();
};

// Routes
router.get('/:id', optionalAuth, userIdValidation, validate, getProfile);
router.put('/profile', verifyAccessTokenMiddleware, updateProfileValidation, validate, updateProfile);
router.post('/profile/image', verifyAccessTokenMiddleware, uploadImageValidation, validate, uploadProfileImage);
router.post('/:id/follow', verifyAccessTokenMiddleware, userIdValidation, validate, followUser);
router.delete('/:id/follow', verifyAccessTokenMiddleware, userIdValidation, validate, unfollowUser);
router.get('/:id/followers', userIdValidation, validate, getFollowers);
router.get('/:id/following', userIdValidation, validate, getFollowing);

module.exports = router;
