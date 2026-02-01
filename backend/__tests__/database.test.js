const mongoose = require('mongoose');
const connectDB = require('../config/database');

describe('Database Connection', () => {
  beforeAll(async () => {
    // Set test database URI if not already set
    if (!process.env.MONGODB_URI) {
      process.env.MONGODB_URI = 'mongodb://localhost:27017/social-media-test';
    }
  });

  afterAll(async () => {
    // Close database connection after tests
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
  });

  it('should connect to MongoDB successfully', async () => {
    await connectDB();
    expect(mongoose.connection.readyState).toBe(1); // 1 = connected
  });

  it('should have proper connection configuration', () => {
    expect(mongoose.connection.name).toBeDefined();
    expect(mongoose.connection.host).toBeDefined();
  });
});
