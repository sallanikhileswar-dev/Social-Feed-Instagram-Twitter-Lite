const mongoose = require('mongoose');
const { createSchema } = require('../utils/baseSchema');

const adminLogSchema = createSchema({
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Admin is required']
  },
  action: {
    type: String,
    enum: ['delete_post', 'delete_comment', 'delete_user'],
    required: [true, 'Action is required']
  },
  targetType: {
    type: String,
    enum: ['post', 'comment', 'user'],
    required: [true, 'Target type is required']
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'Target ID is required']
  },
  reason: {
    type: String,
    trim: true,
    default: ''
  }
});

// Index for efficient querying
adminLogSchema.index({ createdAt: -1 });
adminLogSchema.index({ admin: 1, createdAt: -1 });

const AdminLog = mongoose.model('AdminLog', adminLogSchema);

module.exports = AdminLog;
