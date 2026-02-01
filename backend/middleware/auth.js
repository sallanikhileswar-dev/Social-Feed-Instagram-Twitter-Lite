const { verifyAccessToken, verifyRefreshToken } = require('../utils/tokenUtils');
const User = require('../models/User');

/**
 * Middleware to verify access token
 * Attaches user object to req.user if valid
 */
const verifyAccessTokenMiddleware = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Access token is required',
          code: 'NO_TOKEN'
        }
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = verifyAccessToken(token);

    // Get user from database
    const user = await User.findById(decoded.userId).select('-password -refreshToken');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'User not found',
          code: 'USER_NOT_FOUND'
        }
      });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: {
        message: 'Invalid or expired access token',
        code: 'INVALID_TOKEN'
      }
    });
  }
};

/**
 * Middleware to verify refresh token
 * Attaches user object to req.user if valid
 */
const verifyRefreshTokenMiddleware = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Refresh token is required',
          code: 'NO_REFRESH_TOKEN'
        }
      });
    }

    // Verify token
    const decoded = verifyRefreshToken(refreshToken);

    // Get user and verify refresh token matches
    const user = await User.findById(decoded.userId);
    
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Invalid refresh token',
          code: 'INVALID_REFRESH_TOKEN'
        }
      });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: {
        message: 'Invalid or expired refresh token',
        code: 'INVALID_REFRESH_TOKEN'
      }
    });
  }
};

/**
 * Middleware to verify admin privileges
 * Must be used after verifyAccessTokenMiddleware
 */
const verifyAdmin = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Authentication required',
          code: 'NOT_AUTHENTICATED'
        }
      });
    }

    if (!req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Admin privileges required',
          code: 'FORBIDDEN'
        }
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: {
        message: 'Error verifying admin privileges',
        code: 'INTERNAL_ERROR'
      }
    });
  }
};

module.exports = {
  verifyAccessTokenMiddleware,
  verifyRefreshTokenMiddleware,
  verifyAdmin
};
