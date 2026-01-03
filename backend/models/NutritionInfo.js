const mongoose = require('mongoose');

const nutritionInfoSchema = new mongoose.Schema({
  foodId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Food',
    required: true,
    unique: true,
    index: true
  },
  // Macronutrients
  calories: {
    type: Number,
    min: 0
  },
  protein: {
    type: Number,
    min: 0
  },
  carbohydrates: {
    type: Number,
    min: 0
  },
  sugars: {
    type: Number,
    min: 0
  },
  fat: {
    type: Number,
    min: 0
  },
  saturatedFat: {
    type: Number,
    min: 0
  },
  
  // Micronutrients
  calcium: {
    type: Number,
    min: 0
  },
  iron: {
    type: Number,
    min: 0
  },
  vitaminC: {
    type: Number,
    min: 0
  },
  potassium: {
    type: Number,
    min: 0
  },
  magnesium: {
    type: Number,
    min: 0
  },
  sodium: {
    type: Number,
    min: 0
  },
  fiber: {
    type: Number,
    min: 0
  },
  
  // Additional info
  nutritionSource: {
    type: String,
    enum: ['api', 'user-entered', 'calculated', 'unknown'],
    default: 'unknown'
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('NutritionInfo', nutritionInfoSchema);
