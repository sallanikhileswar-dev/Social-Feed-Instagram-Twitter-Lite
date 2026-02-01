const mongoose = require('mongoose');

/**
 * Test database utilities for Jest tests
 */

/**
 * Connect to test database
 */
const connectTestDB = async () => {
  const testDbUri = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/social-media-test';
  
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(testDbUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  }
};

/**
 * Drop test database
 */
const dropTestDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.dropDatabase();
  }
};

/**
 * Close database connection
 */
const closeTestDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
};

/**
 * Clear all collections in test database
 */
const clearTestDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  }
};

module.exports = {
  connectTestDB,
  dropTestDB,
  closeTestDB,
  clearTestDB
};
