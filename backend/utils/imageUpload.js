const cloudinary = require('../config/cloudinary');

/**
 * Allowed image formats
 */
const ALLOWED_FORMATS = ['jpg', 'jpeg', 'png', 'gif', 'webp'];

/**
 * Maximum file size in bytes (5MB)
 */
const MAX_FILE_SIZE = 5 * 1024 * 1024;

/**
 * Upload image to Cloudinary
 * @param {string} base64Image - Base64 encoded image or file path
 * @param {string} folder - Cloudinary folder name
 * @param {Object} options - Additional upload options
 * @returns {Promise<Object>} Upload result with URL
 */
const uploadImage = async (base64Image, folder = 'social-media', options = {}) => {
  try {
    const uploadOptions = {
      folder,
      resource_type: 'image',
      allowed_formats: ALLOWED_FORMATS,
      ...options
    };

    const result = await cloudinary.uploader.upload(base64Image, uploadOptions);

    return {
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      width: result.width,
      height: result.height,
      size: result.bytes
    };
  } catch (error) {
    throw new Error(`Image upload failed: ${error.message}`);
  }
};

/**
 * Upload profile image
 * @param {string} base64Image - Base64 encoded image
 * @param {string} userId - User ID for unique naming
 * @returns {Promise<Object>} Upload result
 */
const uploadProfileImage = async (base64Image, userId) => {
  return uploadImage(base64Image, 'social-media/profiles', {
    public_id: `profile_${userId}`,
    overwrite: true,
    transformation: [
      { width: 400, height: 400, crop: 'fill', gravity: 'face' },
      { quality: 'auto' }
    ]
  });
};

/**
 * Upload post images
 * @param {Array<string>} base64Images - Array of base64 encoded images
 * @param {string} userId - User ID
 * @returns {Promise<Array<Object>>} Array of upload results
 */
const uploadPostImages = async (base64Images, userId) => {
  if (!Array.isArray(base64Images)) {
    throw new Error('Images must be an array');
  }

  if (base64Images.length > 4) {
    throw new Error('Maximum 4 images allowed per post');
  }

  const uploadPromises = base64Images.map((image, index) => 
    uploadImage(image, 'social-media/posts', {
      public_id: `post_${userId}_${Date.now()}_${index}`,
      transformation: [
        { width: 1200, height: 1200, crop: 'limit' },
        { quality: 'auto' }
      ]
    })
  );

  return Promise.all(uploadPromises);
};

/**
 * Upload story image
 * @param {string} base64Image - Base64 encoded image
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Upload result
 */
const uploadStoryImage = async (base64Image, userId) => {
  return uploadImage(base64Image, 'social-media/stories', {
    public_id: `story_${userId}_${Date.now()}`,
    transformation: [
      { width: 1080, height: 1920, crop: 'fill' },
      { quality: 'auto' }
    ]
  });
};

/**
 * Delete image from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 * @returns {Promise<Object>} Deletion result
 */
const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    throw new Error(`Image deletion failed: ${error.message}`);
  }
};

/**
 * Validate image format and size
 * @param {string} base64Image - Base64 encoded image
 * @returns {Object} Validation result
 */
const validateImage = (base64Image) => {
  // Check if it's a valid base64 string
  const base64Regex = /^data:image\/(jpeg|jpg|png|gif|webp);base64,/;
  
  if (!base64Regex.test(base64Image)) {
    return {
      valid: false,
      error: 'Invalid image format. Allowed formats: JPEG, PNG, GIF, WEBP'
    };
  }

  // Estimate file size from base64 string
  const base64Length = base64Image.split(',')[1].length;
  const estimatedSize = (base64Length * 3) / 4;

  if (estimatedSize > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `Image size exceeds maximum allowed size of ${MAX_FILE_SIZE / (1024 * 1024)}MB`
    };
  }

  return { valid: true };
};

module.exports = {
  uploadImage,
  uploadProfileImage,
  uploadPostImages,
  uploadStoryImage,
  deleteImage,
  validateImage,
  ALLOWED_FORMATS,
  MAX_FILE_SIZE
};
