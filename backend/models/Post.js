const mongoose = require('mongoose');
const { createSchema } = require('../utils/baseSchema');

const postSchema = createSchema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Author is required'],
    index: true
  },
  content: {
    type: String,
    maxlength: [500, 'Content must not exceed 500 characters'],
    trim: true,
    default: ''
  },
  images: [{
    type: String
  }],
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  likeCount: {
    type: Number,
    default: 0,
    index: true
  },
  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  }],
  commentCount: {
    type: Number,
    default: 0
  },
  reposts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  repostCount: {
    type: Number,
    default: 0
  },
  originalPost: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    default: null
  }
});

// Indexes for performance
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ createdAt: -1 });
postSchema.index({ likeCount: -1, createdAt: -1 });
postSchema.index({ content: 'text' }); // Text index for search

// Virtual for engagement score (for trending)
postSchema.virtual('engagementScore').get(function() {
  return this.likeCount + this.commentCount + this.repostCount;
});

const Post = mongoose.model('Post', postSchema);

module.exports = Post;
