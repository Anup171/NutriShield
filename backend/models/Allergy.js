const mongoose = require('mongoose');

const allergySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  allergen: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  severity: {
    type: String,
    enum: ['mild', 'moderate', 'severe', 'unknown'],
    default: 'unknown'
  },
  addedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
allergySchema.index({ userId: 1, allergen: 1 }, { unique: true });

module.exports = mongoose.model('Allergy', allergySchema);
