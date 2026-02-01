const mongoose = require('mongoose');
const { createSchema } = require('../utils/baseSchema');

const storySchema = createSchema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Author is required'],
    index: true
  },
  image: {
    type: String,
    required: [true, 'Image is required']
  },
  viewers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  expiresAt: {
    type: Date,
    required: [true, 'Expiration date is required'],
    index: true
  }
});

// Index for efficient querying of active stories
storySchema.index({ author: 1, expiresAt: 1 });

const Story = mongoose.model('Story', storySchema);

module.exports = Story;
