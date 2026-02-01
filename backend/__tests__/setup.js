/**
 * Global test setup
 * This file runs before all tests
 */

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_ACCESS_SECRET = 'test_access_secret_key_for_testing';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_key_for_testing';
process.env.JWT_ACCESS_EXPIRY = '15m';
process.env.JWT_REFRESH_EXPIRY = '7d';
process.env.MONGODB_URI = 'mongodb://localhost:27017/social-media-test';

// Increase test timeout for database operations
jest.setTimeout(30000);
