const fc = require('fast-check');
const { hashPassword, comparePassword } = require('../utils/passwordUtils');

// Feature: mern-social-media-app, Property 1: Password hashing on registration
describe('Property 1: Password hashing on registration', () => {
  it('should hash any valid password with bcrypt and not store in plaintext', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 8, maxLength: 100 }),
        async (password) => {
          const hashedPassword = await hashPassword(password);
          
          // Password should be hashed (not equal to original)
          expect(hashedPassword).not.toBe(password);
          
          // Hashed password should be a string
          expect(typeof hashedPassword).toBe('string');
          
          // Bcrypt hashes start with $2b$ or $2a$
          expect(hashedPassword).toMatch(/^\$2[ab]\$/);
          
          // Hashed password should be verifiable
          const isMatch = await comparePassword(password, hashedPassword);
          expect(isMatch).toBe(true);
          
          // Wrong password should not match
          const wrongPassword = password + 'wrong';
          const isWrongMatch = await comparePassword(wrongPassword, hashedPassword);
          expect(isWrongMatch).toBe(false);
        }
      ),
      { numRuns: 50 } // Reduced runs for bcrypt performance
    );
  });

  it('should produce different hashes for the same password', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 8, maxLength: 50 }),
        async (password) => {
          const hash1 = await hashPassword(password);
          const hash2 = await hashPassword(password);
          
          // Different hashes due to different salts
          expect(hash1).not.toBe(hash2);
          
          // Both should verify correctly
          expect(await comparePassword(password, hash1)).toBe(true);
          expect(await comparePassword(password, hash2)).toBe(true);
        }
      ),
      { numRuns: 20 }
    );
  });
});
