const mongoose = require('mongoose');
const User = require('../models/User');
const { connectTestDB, clearTestDB, closeTestDB } = require('../utils/testDb');

describe('User Model', () => {
  beforeAll(async () => {
    await connectTestDB();
  });

  afterEach(async () => {
    await clearTestDB();
  });

  afterAll(async () => {
    await closeTestDB();
  });

  it('should create a user with required fields', async () => {
    const userData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'hashedpassword123',
      name: 'Test User'
    };

    const user = await User.create(userData);

    expect(user.username).toBe(userData.username);
    expect(user.email).toBe(userData.email);
    expect(user.name).toBe(userData.name);
    expect(user._id).toBeDefined();
    expect(user.createdAt).toBeDefined();
    expect(user.updatedAt).toBeDefined();
  });

  it('should have default values for optional fields', async () => {
    const user = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: 'hashedpassword123',
      name: 'Test User'
    });

    expect(user.bio).toBe('');
    expect(user.profileImage).toBe('');
    expect(user.website).toBe('');
    expect(user.location).toBe('');
    expect(user.followers).toEqual([]);
    expect(user.following).toEqual([]);
    expect(user.isAdmin).toBe(false);
  });

  it('should enforce unique username', async () => {
    const userData = {
      username: 'testuser',
      email: 'test1@example.com',
      password: 'hashedpassword123',
      name: 'Test User'
    };

    await User.create(userData);

    const duplicateUser = {
      username: 'testuser',
      email: 'test2@example.com',
      password: 'hashedpassword123',
      name: 'Test User 2'
    };

    await expect(User.create(duplicateUser)).rejects.toThrow();
  });

  it('should enforce unique email', async () => {
    const userData = {
      username: 'testuser1',
      email: 'test@example.com',
      password: 'hashedpassword123',
      name: 'Test User'
    };

    await User.create(userData);

    const duplicateUser = {
      username: 'testuser2',
      email: 'test@example.com',
      password: 'hashedpassword123',
      name: 'Test User 2'
    };

    await expect(User.create(duplicateUser)).rejects.toThrow();
  });

  it('should validate email format', async () => {
    const userData = {
      username: 'testuser',
      email: 'invalid-email',
      password: 'hashedpassword123',
      name: 'Test User'
    };

    await expect(User.create(userData)).rejects.toThrow();
  });

  it('should have virtual fields for follower and following counts', async () => {
    const user1 = await User.create({
      username: 'user1',
      email: 'user1@example.com',
      password: 'hashedpassword123',
      name: 'User One'
    });

    const user2 = await User.create({
      username: 'user2',
      email: 'user2@example.com',
      password: 'hashedpassword123',
      name: 'User Two'
    });

    user1.followers.push(user2._id);
    user1.following.push(user2._id);
    await user1.save();

    expect(user1.followerCount).toBe(1);
    expect(user1.followingCount).toBe(1);
  });

  it('should remove sensitive data with toSafeObject method', async () => {
    const user = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: 'hashedpassword123',
      name: 'Test User',
      refreshToken: 'some-refresh-token',
      resetPasswordToken: 'some-reset-token'
    });

    const safeObject = user.toSafeObject();

    expect(safeObject.password).toBeUndefined();
    expect(safeObject.refreshToken).toBeUndefined();
    expect(safeObject.resetPasswordToken).toBeUndefined();
    expect(safeObject.resetPasswordExpires).toBeUndefined();
    expect(safeObject.username).toBe('testuser');
    expect(safeObject.email).toBe('test@example.com');
  });
});
