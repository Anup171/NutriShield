/**
 * Helper functions for working with the new normalized schema
 * These maintain backward compatibility with existing code
 */

const User = require('../models/User');
const Allergy = require('../models/Allergy');
const Food = require('../models/Food');
const NutritionInfo = require('../models/NutritionInfo');
const UserFoodDetection = require('../models/UserFoodDetection');
const { checkForAllergens } = require('./allergenDetector');

/**
 * Get user with all their allergies
 * @param {String} userId - User ID
 * @returns {Promise<Object>} User object with allergies array
 */
async function getUserWithAllergies(userId) {
  const user = await User.findById(userId).lean();
  if (!user) return null;
  
  const allergies = await Allergy.find({ userId }).select('allergen severity -_id');
  user.allergies = allergies.map(a => a.allergen);
  user.allergiesDetailed = allergies;
  
  return user;
}

/**
 * Add allergy to user
 * @param {String} userId - User ID
 * @param {String} allergen - Allergen name
 * @param {String} severity - Severity level
 */
async function addUserAllergy(userId, allergen, severity = 'unknown') {
  return await Allergy.findOneAndUpdate(
    { userId, allergen: allergen.toLowerCase() },
    { 
      userId, 
      allergen: allergen.toLowerCase(),
      severity 
    },
    { upsert: true, new: true }
  );
}

/**
 * Remove allergy from user
 * @param {String} userId - User ID
 * @param {String} allergen - Allergen name
 */
async function removeUserAllergy(userId, allergen) {
  return await Allergy.findOneAndDelete({ 
    userId, 
    allergen: allergen.toLowerCase() 
  });
}

/**
 * Get or create food with nutrition info
 * @param {Object} foodData - Food information from API
 * @returns {Promise<Object>} Food object with nutrition
 */
async function getOrCreateFood(foodData) {
  const { name, externalId, ingredients = [], nutrition = {} } = foodData;
  
  // Try to find existing food
  let food = await Food.findOne({
    $or: [
      { externalId: externalId },
      { name: { $regex: new RegExp(`^${name}$`, 'i') } }
    ]
  });
  
  // Create new food if not found
  if (!food) {
    food = await Food.create({
      name,
      externalId,
      ingredients,
      category: foodData.category || 'unknown',
      brand: foodData.brand
    });
    
    // Create nutrition info
    await NutritionInfo.create({
      foodId: food._id,
      calories: nutrition.calories,
      protein: nutrition.protein,
      carbohydrates: nutrition.carbs || nutrition.carbohydrates,
      fat: nutrition.fats || nutrition.fat,
      sugars: nutrition.sugars,
      calcium: nutrition.calcium,
      iron: nutrition.iron,
      vitaminC: nutrition.vitaminC,
      potassium: nutrition.potassium,
      magnesium: nutrition.magnesium,
      sodium: nutrition.sodium,
      fiber: nutrition.fiber,
      nutritionSource: 'api'
    });
  }
  
  // Get food with nutrition
  const nutritionInfo = await NutritionInfo.findOne({ foodId: food._id }).lean();
  return {
    ...food.toObject(),
    nutrition: nutritionInfo
  };
}

/**
 * Record food search/scan with allergen detection
 * @param {String} userId - User ID
 * @param {Object} foodData - Food data
 * @param {Array} userAllergens - User's allergens
 * @returns {Promise<Object>} Detection result
 */
async function recordFoodDetection(userId, foodData, userAllergens = []) {
  // Get or create food
  const food = await getOrCreateFood(foodData);
  
  // Use comprehensive allergen detection system
  const detectedAllergenNames = checkForAllergens(
    food.name,
    food.ingredients || [],
    userAllergens
  );
  
  // Format detected allergens for database
  const detectedAllergens = detectedAllergenNames.map(allergen => ({
    allergen: allergen,
    source: 'ingredient'
  }));
  
  // Create detection record
  const detection = await UserFoodDetection.create({
    userId,
    foodId: food._id,
    allergenDetected: detectedAllergens.length > 0,
    detectedAllergens,
    searchContext: 'search',
    detectedAt: new Date()
  });
  
  return {
    food,
    detection,
    safe: detectedAllergens.length === 0
  };
}

/**
 * Get user's search history with food details
 * Backward compatible with old SearchHistory format
 * @param {String} userId - User ID
 * @param {Number} limit - Number of results
 * @returns {Promise<Array>} Search history
 */
async function getUserSearchHistory(userId, limit = 50) {
  const detections = await UserFoodDetection
    .find({ userId })
    .sort({ detectedAt: -1 })
    .limit(limit)
    .populate('foodId')
    .lean();
  
  const history = [];
  for (const detection of detections) {
    // Skip if foodId is null or undefined
    if (!detection.foodId) continue;
    
    const nutrition = await NutritionInfo.findOne({ 
      foodId: detection.foodId._id 
    }).lean();
    
    // Format to match old SearchHistory schema for backward compatibility
    history.push({
      _id: detection._id,
      user: detection.userId,
      foodName: detection.foodId.name,
      foodId: detection.foodId.externalId,
      calories: nutrition?.calories || 0,
      protein: nutrition?.protein || 0,
      carbs: nutrition?.carbohydrates || 0,
      fats: nutrition?.fat || 0,
      allergenDetected: detection.allergenDetected,
      detectedAllergens: detection.detectedAllergens.map(a => a.allergen),
      searchedAt: detection.detectedAt
    });
  }
  
  return history;
}

/**
 * Get food analytics for a user
 * @param {String} userId - User ID
 * @returns {Promise<Object>} Analytics data
 */
async function getUserFoodAnalytics(userId) {
  const totalSearches = await UserFoodDetection.countDocuments({ userId });
  const dangerousSearches = await UserFoodDetection.countDocuments({ 
    userId, 
    allergenDetected: true 
  });
  
  const recentDetections = await UserFoodDetection
    .find({ userId, allergenDetected: true })
    .sort({ detectedAt: -1 })
    .limit(10)
    .populate('foodId')
    .lean();
  
  return {
    totalSearches,
    safeSearches: totalSearches - dangerousSearches,
    dangerousSearches,
    safetyRate: totalSearches > 0 ? ((totalSearches - dangerousSearches) / totalSearches * 100).toFixed(1) : 100,
    recentDangerousDetections: recentDetections
  };
}

module.exports = {
  getUserWithAllergies,
  addUserAllergy,
  removeUserAllergy,
  getOrCreateFood,
  recordFoodDetection,
  getUserSearchHistory,
  getUserFoodAnalytics
};
