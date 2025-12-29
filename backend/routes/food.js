const express = require('express');
const router = express.Router();
const axios = require('axios');
const User = require('../models/User');
const SearchHistory = require('../models/SearchHistory');
const { protect } = require('../middleware/auth');

// Comprehensive allergen keywords mapping
const ALLERGEN_KEYWORDS = {
  milk: ['milk', 'dairy', 'cream', 'butter', 'cheese', 'yogurt', 'whey', 'casein', 'lactose', 'curd'],
  eggs: ['egg', 'eggs', 'albumin', 'mayonnaise', 'meringue'],
  fish: ['fish', 'salmon', 'tuna', 'cod', 'bass', 'flounder', 'anchovy'],
  shellfish: ['shrimp', 'crab', 'lobster', 'prawn', 'crayfish', 'shellfish'],
  'tree nuts': ['almond', 'cashew', 'walnut', 'pecan', 'pistachio', 'macadamia', 'hazelnut', 'nut'],
  peanuts: ['peanut', 'groundnut'],
  wheat: ['wheat', 'flour', 'bread', 'pasta', 'semolina', 'gluten'],
  soy: ['soy', 'soya', 'tofu', 'edamame', 'tempeh', 'miso'],
  sesame: ['sesame', 'tahini'],
  gluten: ['gluten', 'wheat', 'barley', 'rye', 'malt']
};

// Helper function to check for allergens with enhanced detection
const checkForAllergens = (foodLabel, ingredients, healthLabels, userAllergies) => {
  const detectedAllergens = [];
  const searchText = [
    foodLabel || '',
    ...(ingredients || []),
    ...(healthLabels || [])
  ].join(' ').toLowerCase();

  userAllergies.forEach(allergy => {
    const allergyLower = allergy.toLowerCase();
    
    // Check if user allergy has mapped keywords
    const keywords = ALLERGEN_KEYWORDS[allergyLower] || [allergyLower];
    
    // Check if any keyword matches
    const found = keywords.some(keyword => 
      searchText.includes(keyword.toLowerCase())
    );

    if (found && !detectedAllergens.includes(allergy)) {
      detectedAllergens.push(allergy);
    }
  });

  return detectedAllergens;
};

// @route   GET /api/food/search
// @desc    Search for food items using Edamam API
// @access  Private
router.get('/search', protect, async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a search query'
      });
    }

    const response = await axios.get('https://api.edamam.com/api/food-database/v2/parser', {
      params: {
        app_id: process.env.EDAMAM_APP_ID,
        app_key: process.env.EDAMAM_APP_KEY,
        ingr: query
      }
    });

    if (!response.data.hints || response.data.hints.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No food items found'
      });
    }

    const foods = response.data.hints.map(hint => {
      const food = hint.food;
      return {
        foodId: food.foodId,
        label: food.label,
        category: food.category || 'General Food',
        image: food.image,
        nutrients: {
          calories: Math.round(food.nutrients.ENERC_KCAL || 0),
          protein: parseFloat((food.nutrients.PROCNT || 0).toFixed(1)),
          fat: parseFloat((food.nutrients.FAT || 0).toFixed(1)),
          carbs: parseFloat((food.nutrients.CHOCDF || 0).toFixed(1)),
          fiber: parseFloat((food.nutrients.FIBTG || 0).toFixed(1))
        }
      };
    });

    res.status(200).json({
      success: true,
      count: foods.length,
      foods
    });

  } catch (error) {
    console.error('Food search error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error searching for food. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/food/details
// @desc    Get detailed food information and check for allergens
// @access  Private
router.post('/details', protect, async (req, res) => {
  try {
    const { foodId, quantity = 100, measureURI } = req.body;

    if (!foodId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a food ID'
      });
    }

    const user = await User.findById(req.user.id);

    const requestBody = {
      ingredients: [{
        quantity: quantity,
        measureURI: measureURI || "http://www.edamam.com/ontologies/edamam.owl#Measure_gram",
        foodId: foodId
      }]
    };

    const response = await axios.post('https://api.edamam.com/api/food-database/v2/nutrients', requestBody, {
      params: {
        app_id: process.env.EDAMAM_APP_ID,
        app_key: process.env.EDAMAM_APP_KEY
      }
    });

    const data = response.data;
    const parsedFood = data.ingredients?.[0]?.parsed?.[0];
    const foodData = parsedFood?.food;

    // Get food name - try multiple sources
    const foodName = foodData?.label || parsedFood?.foodMatch || 'Food Item';

    // Extract ingredients and health labels
    const ingredients = [];
    const healthLabels = data.healthLabels || [];
    
    if (foodData) {
      if (foodData.label) ingredients.push(foodData.label);
      if (foodData.knownAs) ingredients.push(...foodData.knownAs);
      if (foodData.foodContentsLabel) ingredients.push(foodData.foodContentsLabel);
    }

    // Enhanced allergen detection
    const detectedAllergens = checkForAllergens(
      foodName,
      ingredients,
      healthLabels,
      user.allergies
    );

    const foodDetails = {
      foodId: foodId,
      label: foodName,
      category: foodData?.category || 'General Food',
      quantity: quantity,
      calories: Math.round(data.calories || 0),
      totalWeight: data.totalWeight || 0,
      nutrients: {
        protein: parseFloat((data.totalNutrients?.PROCNT?.quantity || 0).toFixed(1)),
        fat: parseFloat((data.totalNutrients?.FAT?.quantity || 0).toFixed(1)),
        carbs: parseFloat((data.totalNutrients?.CHOCDF?.quantity || 0).toFixed(1)),
        fiber: parseFloat((data.totalNutrients?.FIBTG?.quantity || 0).toFixed(1)),
        sugar: parseFloat((data.totalNutrients?.SUGAR?.quantity || 0).toFixed(1)),
        sodium: Math.round(data.totalNutrients?.NA?.quantity || 0),
        saturatedFat: parseFloat((data.totalNutrients?.FASAT?.quantity || 0).toFixed(1)),
        cholesterol: Math.round(data.totalNutrients?.CHOLE?.quantity || 0)
      },
      ingredients: ingredients.length > 0 ? ingredients : [foodName],
      healthLabels: healthLabels,
      allergenDetected: detectedAllergens.length > 0,
      detectedAllergens: detectedAllergens
    };

    // Save to search history with proper food name
    await SearchHistory.create({
      user: req.user.id,
      foodName: foodName, // Use the extracted food name
      foodId: foodId,
      calories: foodDetails.calories,
      protein: foodDetails.nutrients.protein,
      carbs: foodDetails.nutrients.carbs,
      fats: foodDetails.nutrients.fat,
      allergenDetected: foodDetails.allergenDetected,
      detectedAllergens: detectedAllergens
    });

    res.status(200).json({
      success: true,
      food: foodDetails
    });

  } catch (error) {
    console.error('Food details error:', error.message);
    console.error('Full error:', error.response?.data || error);
    res.status(500).json({
      success: false,
      message: 'Error fetching food details. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/food/history
// @desc    Get user's search history
// @access  Private
router.get('/history', protect, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const history = await SearchHistory.find({ user: req.user.id })
      .sort({ searchedAt: -1 })
      .limit(limit);

    res.status(200).json({
      success: true,
      count: history.length,
      history
    });

  } catch (error) {
    console.error('History fetch error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error fetching search history',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   DELETE /api/food/history/:id
// @desc    Delete a search history item
// @access  Private
router.delete('/history/:id', protect, async (req, res) => {
  try {
    const historyItem = await SearchHistory.findById(req.params.id);

    if (!historyItem) {
      return res.status(404).json({
        success: false,
        message: 'History item not found'
      });
    }

    if (historyItem.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to delete this item'
      });
    }

    await historyItem.deleteOne();

    res.status(200).json({
      success: true,
      message: 'History item deleted successfully'
    });

  } catch (error) {
    console.error('History delete error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error deleting history item',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   DELETE /api/food/history
// @desc    Clear all search history
// @access  Private
router.delete('/history', protect, async (req, res) => {
  try {
    const result = await SearchHistory.deleteMany({ user: req.user.id });

    res.status(200).json({
      success: true,
      message: `Cleared ${result.deletedCount} history items`,
      deletedCount: result.deletedCount
    });

  } catch (error) {
    console.error('History clear error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error clearing history',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;