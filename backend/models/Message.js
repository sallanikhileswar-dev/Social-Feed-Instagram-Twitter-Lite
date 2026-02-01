const mongoose = require('mongoose');
const { createSchema } = require('../utils/baseSchema');

const messageSchema = createSchema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Sender is required'],
    index: true
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Recipient is required'],
    index: true
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
    maxlength: [1000, 'Message must not exceed 1000 characters'],
    trim: true
  },
  seen: {
    type: Boolean,
    default: false
  }
});

// Compound indexes for efficient querying
messageSchema.index({ sender: 1, recipient: 1, createdAt: -1 });
messageSchema.index({ recipient: 1, seen: 1 });
messageSchema.index({ createdAt: -1 });

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
