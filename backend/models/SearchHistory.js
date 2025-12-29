const mongoose = require('mongoose');

const searchHistorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  foodName: {
    type: String,
    required: true,
    trim: true
  },
  foodId: {
    type: String,
    trim: true
  },
  calories: {
    type: Number
  },
  protein: {
    type: Number
  },
  carbs: {
    type: Number
  },
  fats: {
    type: Number
  },
  allergenDetected: {
    type: Boolean,
    default: false
  },
  detectedAllergens: [{
    type: String
  }],
  searchedAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries
searchHistorySchema.index({ user: 1, searchedAt: -1 });

module.exports = mongoose.model('SearchHistory', searchHistorySchema);
