const mongoose = require('mongoose');

const foodSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  externalId: {
    type: String,
    trim: true,
    sparse: true // Allows null values but enforces uniqueness when present
  },
  ingredients: [{
    type: String,
    trim: true
  }],
  category: {
    type: String,
    trim: true,
    index: true
  },
  brand: {
    type: String,
    trim: true
  },
  servingSize: {
    amount: Number,
    unit: String
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Index for text search
foodSchema.index({ name: 'text', ingredients: 'text' });

// Index for external API IDs
foodSchema.index({ externalId: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('Food', foodSchema);
