const fc = require('fast-check');
const { generateAccessToken, generateRefreshToken, verifyAccessToken, verifyRefreshToken } = require('../utils/tokenUtils');

// Feature: mern-social-media-app, Property 2: JWT token generation on login
describe('Property 2: JWT token generation on login', () => {
  it('should generate valid Access Token and Refresh Token in JWT format', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          userId: fc.hexaString({ minLength: 24, maxLength: 24 }),
          email: fc.emailAddress()
        }),
        async (payload) => {
          const accessToken = generateAccessToken(payload);
          const refreshToken = generateRefreshToken(payload);
          
          // Tokens should be strings
          expect(typeof accessToken).toBe('string');
          expect(typeof refreshToken).toBe('string');
          
          // JWT format: header.payload.signature
          expect(accessToken.split('.').length).toBe(3);
          expect(refreshToken.split('.').length).toBe(3);
          
          // Tokens should be different
          expect(accessToken).not.toBe(refreshToken);
          
          // Tokens should be verifiable
          const decodedAccess = verifyAccessToken(accessToken);
          const decodedRefresh = verifyRefreshToken(refreshToken);
          
          // Decoded payload should match original
          expect(decodedAccess.userId).toBe(payload.userId);
          expect(decodedAccess.email).toBe(payload.email);
          expect(decodedRefresh.userId).toBe(payload.userId);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should generate tokens with expiration claims', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          userId: fc.hexaString({ minLength: 24, maxLength: 24 })
        }),
        async (payload) => {
          const accessToken = generateAccessToken(payload);
          const refreshToken = generateRefreshToken(payload);
          
          const decodedAccess = verifyAccessToken(accessToken);
          const decodedRefresh = verifyRefreshToken(refreshToken);
          
          // Should have expiration claim
          expect(decodedAccess.exp).toBeDefined();
          expect(decodedRefresh.exp).toBeDefined();
          
          // Should have issued at claim
          expect(decodedAccess.iat).toBeDefined();
          expect(decodedRefresh.iat).toBeDefined();
          
          // Expiration should be in the future
          const now = Math.floor(Date.now() / 1000);
          expect(decodedAccess.exp).toBeGreaterThan(now);
          expect(decodedRefresh.exp).toBeGreaterThan(now);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should reject invalid tokens', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 10, maxLength: 100 }),
        (invalidToken) => {
          // Invalid tokens should throw errors
          expect(() => verifyAccessToken(invalidToken)).toThrow();
          expect(() => verifyRefreshToken(invalidToken)).toThrow();
        }
      ),
      { numRuns: 100 }
    );
  });
});
