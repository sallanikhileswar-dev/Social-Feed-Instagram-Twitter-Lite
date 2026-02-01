const express = require('express');
const router = express.Router();
const { param, body } = require('express-validator');
const { verifyAccessTokenMiddleware, verifyAdmin } = require('../middleware/auth');
const {
  deletePost,
  deleteComment,
  deleteUser,
  getAdminLogs,
  getStats,
  getAllUsers
} = require('../controllers/adminController');
const { validate } = require('../middleware/validate');

// Validation
const idValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ID')
];

const reasonValidation = [
  body('reason')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Reason must not exceed 500 characters')
];

// All admin routes require authentication and admin privileges
router.use(verifyAccessTokenMiddleware, verifyAdmin);

// Routes
router.get('/stats', getStats);
router.get('/users', getAllUsers);
router.get('/logs', getAdminLogs);
router.delete('/posts/:id', idValidation, reasonValidation, validate, deletePost);
router.delete('/comments/:id', idValidation, reasonValidation, validate, deleteComment);
router.delete('/users/:id', idValidation, reasonValidation, validate, deleteUser);

module.exports = router;
