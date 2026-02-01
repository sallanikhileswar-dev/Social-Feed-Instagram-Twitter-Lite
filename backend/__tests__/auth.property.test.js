const fc = require('fast-check');
const request = require('supertest');
const express = require('express');
const { verifyAccessTokenMiddleware, verifyAdmin } = require('../middleware/auth');
const { generateAccessToken } = require('../utils/tokenUtils');
const User = require('../models/User');
const { connectTestDB, clearTestDB, closeTestDB } = require('../utils/testDb');

// Feature: mern-social-media-app, Property 40: Protected endpoint authentication
describe('Property 40: Protected endpoint authentication', () => {
  let app;

  beforeAll(async () => {
    await connectTestDB();
    
    // Create test Express app
    app = express();
    app.use(express.json());
    
    // Protected route
    app.get('/api/protected', verifyAccessTokenMiddleware, (req, res) => {
      res.json({ success: true, user: req.user.username });
    });
    
    // Admin route
    app.get('/api/admin', verifyAccessTokenMiddleware, verifyAdmin, (req, res) => {
      res.json({ success: true, message: 'Admin access granted' });
    });
  });

  afterEach(async () => {
    await clearTestDB();
  });

  afterAll(async () => {
    await closeTestDB();
  });

  it('should reject requests without valid Access Token with 401', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.oneof(
          fc.constant(undefined),
          fc.constant(''),
          fc.string({ minLength: 1, maxLength: 50 }),
          fc.constant('Bearer invalid_token')
        ),
        async (authHeader) => {
          const response = await request(app)
            .get('/api/protected')
            .set('Authorization', authHeader || '');
          
          expect(response.status).toBe(401);
          expect(response.body.success).toBe(false);
          expect(response.body.error).toBeDefined();
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should allow requests with valid Access Token', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          username: fc.string({ minLength: 3, maxLength: 20 }).map(s => s.toLowerCase().replace(/[^a-z0-9_]/g, 'a')),
          email: fc.emailAddress(),
          name: fc.string({ minLength: 1, maxLength: 30 })
        }),
        async (userData) => {
          // Create user
          const user = await User.create({
            ...userData,
            password: 'hashedpassword123'
          });
          
          // Generate valid token
          const token = generateAccessToken({
            userId: user._id.toString(),
            email: user.email
          });
          
          const response = await request(app)
            .get('/api/protected')
            .set('Authorization', `Bearer ${token}`);
          
          expect(response.status).toBe(200);
          expect(response.body.success).toBe(true);
          expect(response.body.user).toBe(userData.username);
        }
      ),
      { numRuns: 30 }
    );
  });

  it('should reject non-admin users from admin routes with 403', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          username: fc.string({ minLength: 3, maxLength: 20 }).map(s => s.toLowerCase().replace(/[^a-z0-9_]/g, 'a')),
          email: fc.emailAddress(),
          name: fc.string({ minLength: 1, maxLength: 30 })
        }),
        async (userData) => {
          // Create non-admin user
          const user = await User.create({
            ...userData,
            password: 'hashedpassword123',
            isAdmin: false
          });
          
          const token = generateAccessToken({
            userId: user._id.toString(),
            email: user.email
          });
          
          const response = await request(app)
            .get('/api/admin')
            .set('Authorization', `Bearer ${token}`);
          
          expect(response.status).toBe(403);
          expect(response.body.success).toBe(false);
          expect(response.body.error.code).toBe('FORBIDDEN');
        }
      ),
      { numRuns: 30 }
    );
  });

  it('should allow admin users to access admin routes', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          username: fc.string({ minLength: 3, maxLength: 20 }).map(s => s.toLowerCase().replace(/[^a-z0-9_]/g, 'a')),
          email: fc.emailAddress(),
          name: fc.string({ minLength: 1, maxLength: 30 })
        }),
        async (userData) => {
          // Create admin user
          const user = await User.create({
            ...userData,
            password: 'hashedpassword123',
            isAdmin: true
          });
          
          const token = generateAccessToken({
            userId: user._id.toString(),
            email: user.email
          });
          
          const response = await request(app)
            .get('/api/admin')
            .set('Authorization', `Bearer ${token}`);
          
          expect(response.status).toBe(200);
          expect(response.body.success).toBe(true);
        }
      ),
      { numRuns: 30 }
    );
  });
});
