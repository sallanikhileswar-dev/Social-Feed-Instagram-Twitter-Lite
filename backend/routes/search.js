const express = require('express');
const router = express.Router();
const { query } = require('express-validator');
const {
  searchUsers,
  searchPosts
} = require('../controllers/searchController');
const { validate } = require('../middleware/validate');

// Validation
const searchValidation = [
  query('q')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Search query must not exceed 100 characters')
];

// Routes
router.get('/users', searchValidation, validate, searchUsers);
router.get('/posts', searchValidation, validate, searchPosts);

module.exports = router;
