const jwt = require('jsonwebtoken');

const generateAccessToken = (payload) => {
  try {
    const token = jwt.sign(
      payload,
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: process.env.JWT_ACCESS_EXPIRY || '15m' }
    );
    return token;
  } catch (error) {
    throw new Error(`Error generating access token: ${error.message}`);
  }
};

const generateRefreshToken = (payload) => {
  try {
    const token = jwt.sign(
      payload,
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRY || '7d' }
    );
    return token;
  } catch (error) {
    throw new Error(`Error generating refresh token: ${error.message}`);
  }
};

const verifyAccessToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    return decoded;
  } catch (error) {
    throw new Error(`Invalid or expired access token: ${error.message}`);
  }
};

const verifyRefreshToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    return decoded;
  } catch (error) {
    throw new Error(`Invalid or expired refresh token: ${error.message}`);
  }
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken
};
