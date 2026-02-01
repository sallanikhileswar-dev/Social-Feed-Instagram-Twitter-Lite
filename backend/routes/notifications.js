const express = require('express');
const router = express.Router();
const { verifyAccessTokenMiddleware } = require('../middleware/auth');
const {
  getNotifications,
  markNotificationsAsRead
} = require('../controllers/notificationController');

// Routes
router.get('/', verifyAccessTokenMiddleware, getNotifications);
router.put('/read', verifyAccessTokenMiddleware, markNotificationsAsRead);

module.exports = router;
