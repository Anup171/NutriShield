const mongoose = require('mongoose');

const userFoodDetectionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  foodId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Food',
    required: true,
    index: true
  },
  allergenDetected: {
    type: Boolean,
    default: false,
    index: true
  },
  detectedAllergens: [{
    allergen: String,
    source: {
      type: String,
      enum: ['ingredient', 'derived', 'may-contain'],
      default: 'ingredient'
    }
  }],
  userNotified: {
    type: Boolean,
    default: false
  },
  searchContext: {
    type: String,
    enum: ['search', 'scan', 'manual-entry', 'recommendation'],
    default: 'search'
  },
  detectedAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Compound indexes for common queries
userFoodDetectionSchema.index({ userId: 1, detectedAt: -1 });
userFoodDetectionSchema.index({ userId: 1, allergenDetected: 1 });
userFoodDetectionSchema.index({ foodId: 1, detectedAt: -1 });

module.exports = mongoose.model('UserFoodDetection', userFoodDetectionSchema);
