const mongoose = require('mongoose');
const { createSchema, baseSchemaOptions } = require('../utils/baseSchema');

describe('Base Schema Utility', () => {
  it('should create a schema with timestamps enabled', () => {
    const testSchema = createSchema({
      name: String,
      email: String
    });

    expect(testSchema.options.timestamps).toBe(true);
  });

  it('should include createdAt and updatedAt in schema paths', () => {
    const testSchema = createSchema({
      name: String
    });

    expect(testSchema.paths.createdAt).toBeDefined();
    expect(testSchema.paths.updatedAt).toBeDefined();
  });

  it('should allow additional options to be merged', () => {
    const testSchema = createSchema(
      { name: String },
      { collection: 'custom_collection' }
    );

    expect(testSchema.options.collection).toBe('custom_collection');
    expect(testSchema.options.timestamps).toBe(true); // Base option should still be present
  });

  it('should transform JSON output correctly', () => {
    const testSchema = createSchema({
      name: String,
      email: String
    });

    const TestModel = mongoose.model('TestModel', testSchema);
    const doc = new TestModel({
      name: 'Test User',
      email: 'test@example.com'
    });

    const json = doc.toJSON();
    
    // Should have id field
    expect(json.id).toBeDefined();
    // Should not have __v field
    expect(json.__v).toBeUndefined();
    // Should still have _id
    expect(json._id).toBeDefined();
  });

  afterAll(() => {
    // Clean up the test model
    if (mongoose.models.TestModel) {
      delete mongoose.models.TestModel;
    }
  });
});
