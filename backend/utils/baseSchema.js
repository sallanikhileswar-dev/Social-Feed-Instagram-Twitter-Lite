const mongoose = require('mongoose');

/**
 * Base schema options that include timestamps
 * This can be used by all models to ensure consistency
 */
const baseSchemaOptions = {
  timestamps: true, // Automatically adds createdAt and updatedAt fields
  toJSON: {
    virtuals: true,
    transform: function(doc, ret) {
      // Remove __v and _id from JSON output
      delete ret.__v;
      // Keep _id but also provide id
      ret.id = ret._id;
      return ret;
    }
  },
  toObject: {
    virtuals: true
  }
};

/**
 * Creates a schema with base options
 * @param {Object} definition - Schema definition
 * @param {Object} options - Additional schema options
 * @returns {mongoose.Schema}
 */
const createSchema = (definition, options = {}) => {
  return new mongoose.Schema(definition, {
    ...baseSchemaOptions,
    ...options
  });
};

module.exports = {
  baseSchemaOptions,
  createSchema
};
