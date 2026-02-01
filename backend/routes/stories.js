const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const { verifyAccessTokenMiddleware } = require('../middleware/auth');
const {
  createStory,
  getStories,
  viewStory,
  deleteStory
} = require('../controllers/storyController');
const { validate } = require('../middleware/validate');

// Validation
const createStoryValidation = [
  body('image')
    .notEmpty()
    .withMessage('Image is required')
    .isString()
    .withMessage('Image must be a base64 string')
];

const storyIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid story ID')
];

// Routes
router.post('/', verifyAccessTokenMiddleware, createStoryValidation, validate, createStory);
router.get('/', verifyAccessTokenMiddleware, getStories);
router.post('/:id/view', verifyAccessTokenMiddleware, storyIdValidation, validate, viewStory);
router.delete('/:id', verifyAccessTokenMiddleware, storyIdValidation, validate, deleteStory);

module.exports = router;
