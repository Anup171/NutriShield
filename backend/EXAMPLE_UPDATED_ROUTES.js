/**
 * EXAMPLE: Updated routes using the new normalized schema
 * 
 * This shows how to update your existing routes to work with the new schema
 * while maintaining all functionality.
 */

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

// Import helper functions for new schema
const {
  getUserWithAllergies,
  addUserAllergy,
  removeUserAllergy,
  recordFoodDetection,
  getUserSearchHistory,
  getUserFoodAnalytics
} = require('../helpers/schemaHelpers');

// Import models
const User = require('../models/User');
const Food = require('../models/Food');

// ==============================================================
// USER ROUTES - Updated to use new schema
// ==============================================================

// @desc    Get current user with allergies
// @route   GET /api/users/profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
  try {
    // NEW: Use helper to get user with allergies
    const user = await getUserWithAllergies(req.user._id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    res.json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        allergies: user.allergies, // Still works!
        allergiesDetailed: user.allergiesDetailed, // NEW: includes severity
        preferences: user.preferences
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// @desc    Add user allergy
// @route   POST /api/users/allergies
// @access  Private
router.post('/allergies', protect, async (req, res) => {
  try {
    const { allergen, severity } = req.body;

    if (!allergen) {
      return res.status(400).json({ 
        success: false, 
        message: 'Allergen name is required' 
      });
    }

    // NEW: Use helper to add allergy
    const allergy = await addUserAllergy(
      req.user._id, 
      allergen, 
      severity || 'unknown'
    );

    // Get updated user
    const user = await getUserWithAllergies(req.user._id);

    res.status(201).json({
      success: true,
      message: 'Allergy added successfully',
      data: {
        allergy,
        allergies: user.allergies
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error adding allergy', 
      error: error.message 
    });
  }
});

// @desc    Remove user allergy
// @route   DELETE /api/users/allergies/:allergen
// @access  Private
router.delete('/allergies/:allergen', protect, async (req, res) => {
  try {
    const { allergen } = req.params;

    // NEW: Use helper to remove allergy
    await removeUserAllergy(req.user._id, allergen);

    // Get updated user
    const user = await getUserWithAllergies(req.user._id);

    res.json({
      success: true,
      message: 'Allergy removed successfully',
      data: {
        allergies: user.allergies
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error removing allergy', 
      error: error.message 
    });
  }
});

// ==============================================================
// FOOD SEARCH ROUTES - Updated to use new schema
// ==============================================================

// @desc    Search for food and check allergens
// @route   POST /api/food/search
// @access  Private
router.post('/search', protect, async (req, res) => {
  try {
    const { foodName, foodId, ingredients, nutrition } = req.body;

    if (!foodName) {
      return res.status(400).json({ 
        success: false, 
        message: 'Food name is required' 
      });
    }

    // Get user's allergies
    const user = await getUserWithAllergies(req.user._id);
    const userAllergens = user.allergies || [];

    // NEW: Record food detection (automatically creates Food, NutritionInfo, and Detection)
    const result = await recordFoodDetection(
      req.user._id,
      {
        name: foodName,
        externalId: foodId,
        ingredients: ingredients || [],
        nutrition: nutrition || {}
      },
      userAllergens
    );

    res.json({
      success: true,
      data: {
        food: {
          name: result.food.name,
          ingredients: result.food.ingredients,
          nutrition: result.food.nutrition
        },
        allergenDetection: {
          safe: result.safe,
          allergenDetected: result.detection.allergenDetected,
          detectedAllergens: result.detection.detectedAllergens.map(a => a.allergen)
        }
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error processing food search', 
      error: error.message 
    });
  }
});

// @desc    Get user's search history
// @route   GET /api/food/history
// @access  Private
router.get('/history', protect, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;

    // NEW: Use helper to get history (returns old SearchHistory format!)
    const history = await getUserSearchHistory(req.user._id, limit);

    res.json({
      success: true,
      count: history.length,
      data: history
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching search history', 
      error: error.message 
    });
  }
});

// ==============================================================
// NEW ANALYTICS ROUTES - Enabled by new schema!
// ==============================================================

// @desc    Get user food safety analytics
// @route   GET /api/users/analytics
// @access  Private
router.get('/analytics', protect, async (req, res) => {
  try {
    const analytics = await getUserFoodAnalytics(req.user._id);

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching analytics', 
      error: error.message 
    });
  }
});

// @desc    Get popular foods
// @route   GET /api/food/popular
// @access  Private
router.get('/popular', protect, async (req, res) => {
  try {
    const UserFoodDetection = require('../models/UserFoodDetection');
    
    // NEW: Easy to query most searched foods!
    const popularFoods = await UserFoodDetection.aggregate([
      {
        $group: {
          _id: '$foodId',
          searchCount: { $sum: 1 },
          allergenDetections: {
            $sum: { $cond: ['$allergenDetected', 1, 0] }
          }
        }
      },
      { $sort: { searchCount: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'foods',
          localField: '_id',
          foreignField: '_id',
          as: 'food'
        }
      },
      { $unwind: '$food' }
    ]);

    res.json({
      success: true,
      data: popularFoods.map(item => ({
        name: item.food.name,
        searchCount: item.searchCount,
        allergenDetections: item.allergenDetections,
        safetyRate: ((item.searchCount - item.allergenDetections) / item.searchCount * 100).toFixed(1) + '%'
      }))
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching popular foods', 
      error: error.message 
    });
  }
});

// @desc    Get foods containing specific allergen
// @route   GET /api/food/allergen/:allergen
// @access  Private
router.get('/allergen/:allergen', protect, async (req, res) => {
  try {
    const { allergen } = req.params;

    // NEW: Easy to find foods with specific allergens!
    const foods = await Food.find({
      ingredients: { 
        $regex: new RegExp(allergen, 'i') 
      }
    }).limit(20);

    res.json({
      success: true,
      count: foods.length,
      data: foods
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching foods', 
      error: error.message 
    });
  }
});

// ==============================================================
// COMPARISON: Old vs New
// ==============================================================

/* 
OLD WAY (direct model access):
----------------------------------
// Add allergy
const user = await User.findById(userId);
user.allergies.push('peanuts');
await user.save();

// Create search history
await SearchHistory.create({
  user: userId,
  foodName: 'Apple',
  calories: 95,
  allergenDetected: false
});

// Get history
const history = await SearchHistory.find({ user: userId })
  .sort({ searchedAt: -1 })
  .limit(50);


NEW WAY (with helpers):
----------------------------------
// Add allergy (with severity!)
await addUserAllergy(userId, 'peanuts', 'severe');

// Record food detection (auto-creates Food, Nutrition, Detection)
await recordFoodDetection(userId, {
  name: 'Apple',
  nutrition: { calories: 95 }
}, userAllergens);

// Get history (same format as old!)
const history = await getUserSearchHistory(userId, 50);
*/

module.exports = router;
