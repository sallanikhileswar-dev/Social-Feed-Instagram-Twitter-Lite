const { verifyAccessTokenMiddleware, verifyRefreshTokenMiddleware, verifyAdmin } = require('../middleware/auth');
const { generateAccessToken, generateRefreshToken } = require('../utils/tokenUtils');
const User = require('../models/User');
const { connectTestDB, clearTestDB, closeTestDB } = require('../utils/testDb');

describe('Authentication Middleware', () => {
  beforeAll(async () => {
    await connectTestDB();
  });

  afterEach(async () => {
    await clearTestDB();
  });

  afterAll(async () => {
    await closeTestDB();
  });

  describe('verifyAccessTokenMiddleware', () => {
    it('should reject request without Authorization header', async () => {
      const req = { headers: {} };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      await verifyAccessTokenMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({ code: 'NO_TOKEN' })
        })
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject request with invalid token', async () => {
      const req = {
        headers: { authorization: 'Bearer invalid_token' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      await verifyAccessTokenMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });

    it('should accept request with valid token and attach user', async () => {
      const user = await User.create({
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashedpassword123',
        name: 'Test User'
      });

      const token = generateAccessToken({
        userId: user._id.toString(),
        email: user.email
      });

      const req = {
        headers: { authorization: `Bearer ${token}` }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      await verifyAccessTokenMiddleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.user).toBeDefined();
      expect(req.user.username).toBe('testuser');
      expect(req.user.password).toBeUndefined(); // Should not include password
    });
  });

  describe('verifyRefreshTokenMiddleware', () => {
    it('should reject request without refresh token', async () => {
      const req = { body: {} };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      await verifyRefreshTokenMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({ code: 'NO_REFRESH_TOKEN' })
        })
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('should accept valid refresh token', async () => {
      const refreshToken = generateRefreshToken({ userId: 'test123' });
      
      const user = await User.create({
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashedpassword123',
        name: 'Test User',
        refreshToken: refreshToken
      });

      const req = {
        body: { refreshToken }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      await verifyRefreshTokenMiddleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.user).toBeDefined();
    });
  });

  describe('verifyAdmin', () => {
    it('should reject if user is not authenticated', () => {
      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      verifyAdmin(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject non-admin user', () => {
      const req = {
        user: { isAdmin: false, username: 'testuser' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      verifyAdmin(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({ code: 'FORBIDDEN' })
        })
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('should allow admin user', () => {
      const req = {
        user: { isAdmin: true, username: 'admin' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      verifyAdmin(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });
  });
});
