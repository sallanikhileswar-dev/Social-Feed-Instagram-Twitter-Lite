const express = require('express');
const router = express.Router();
const { param } = require('express-validator');
const { verifyAccessTokenMiddleware } = require('../middleware/auth');
const {
  getConversations,
  getMessages,
  markMessagesAsSeen
} = require('../controllers/messageController');
const { validate } = require('../middleware/validate');

// Validation
const userIdValidation = [
  param('userId')
    .isMongoId()
    .withMessage('Invalid user ID')
];

// Routes
router.get('/conversations', verifyAccessTokenMiddleware, getConversations);
router.get('/:userId', verifyAccessTokenMiddleware, userIdValidation, validate, getMessages);
router.put('/:userId/seen', verifyAccessTokenMiddleware, userIdValidation, validate, markMessagesAsSeen);

module.exports = router;
