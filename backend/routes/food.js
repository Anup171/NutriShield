const express = require('express');
const router = express.Router();
const axios = require('axios');
const User = require('../models/User');
const SearchHistory = require('../models/SearchHistory');
const { protect } = require('../middleware/auth');

// STANDARDIZED ALLERGEN KEYWORDS - Perfectly matched with signup form
const ALLERGEN_KEYWORDS = {
  // Major Allergens
  'milk': [
    'milk', 'dairy', 'cream', 'butter', 'cheese', 'yogurt', 'yoghurt', 
    'whey', 'casein', 'lactose', 'curd', 'ghee', 'paneer', 'buttermilk', 
    'ice cream', 'icecream', 'frozen yogurt', 'custard', 'pudding',
    'condensed milk', 'evaporated milk', 'half and half', 'half-and-half',
    'sour cream', 'cottage cheese', 'ricotta', 'mozzarella', 'cheddar', 
    'parmesan', 'gouda', 'brie', 'feta', 'swiss', 'provolone',
    'cream cheese', 'mascarpone', 'blue cheese', 'goat cheese',
    'milk chocolate', 'white chocolate', 'milk powder', 'whey protein',
    'lactoglobulin', 'lactalbumin'
  ],
  
  'eggs': [
    'egg', 'eggs', 'albumin', 'mayonnaise', 'mayo', 'meringue', 
    'eggnog', 'omelet', 'omelette', 'scrambled', 'fried egg', 
    'boiled egg', 'poached egg', 'egg white', 'egg yolk',
    'ovalbumin', 'ovomucoid', 'egg substitute', 'hollandaise'
  ],
  
  'peanuts': [
    'peanut', 'peanuts', 'groundnut', 'groundnuts', 
    'peanut butter', 'peanut oil', 'arachis', 'goober'
  ],
  
  'tree nuts': [
    'almond', 'almonds', 'cashew', 'cashews', 'walnut', 'walnuts', 
    'pecan', 'pecans', 'pistachio', 'pistachios', 'macadamia', 
    'hazelnut', 'hazelnuts', 'nut', 'nuts', 'pine nut', 'pine nuts',
    'brazil nut', 'brazil nuts', 'chestnut', 'chestnuts',
    'hickory nut', 'beechnut', 'butternut', 'chinquapin',
    'praline', 'marzipan', 'nougat', 'gianduja', 'nut butter'
  ],
  
  'fish': [
    'fish', 'salmon', 'tuna', 'cod', 'bass', 'flounder', 
    'anchovy', 'anchovies', 'trout', 'halibut', 'sardine', 'sardines',
    'mackerel', 'tilapia', 'catfish', 'seafood', 'haddock',
    'pollock', 'mahi', 'snapper', 'perch', 'pike', 'herring',
    'swordfish', 'grouper', 'sole', 'sea bass', 'seabass'
  ],
  
  'shellfish': [
    'shrimp', 'shrimps', 'prawn', 'prawns', 'crab', 'lobster', 
    'crayfish', 'crawfish', 'shellfish', 'clam', 'clams',
    'mussel', 'mussels', 'oyster', 'oysters', 'scallop', 'scallops',
    'squid', 'octopus', 'cuttlefish', 'snail', 'abalone',
    'sea urchin', 'barnacle'
  ],
  
  'wheat': [
    'wheat', 'flour', 'bread', 'pasta', 'semolina', 'bulgur', 
    'couscous', 'seitan', 'spelt', 'kamut', 'farina', 'durum',
    'noodle', 'noodles', 'macaroni', 'spaghetti', 'fettuccine',
    'penne', 'rigatoni', 'tortilla', 'pita', 'bagel', 'baguette',
    'croissant', 'biscuit', 'cracker', 'graham', 'matzo', 'matzah',
    'wheat germ', 'wheat bran', 'whole wheat', 'wholewheat'
  ],
  
  'soy': [
    'soy', 'soya', 'tofu', 'edamame', 'tempeh', 'miso', 
    'soybean', 'soybeans', 'soy sauce', 'tamari', 'soy milk', 'soymilk',
    'soy protein', 'textured vegetable protein', 'tvp', 'natto',
    'soy lecithin', 'soy flour', 'soy oil'
  ],
  
  'gluten': [
    'gluten', 'wheat', 'barley', 'rye', 'malt', 'beer', 'ale', 'lager',
    'bread', 'pasta', 'flour', 'seitan', 'spelt', 'kamut',
    'triticale', 'bulgur', 'couscous', 'farina', 'semolina'
  ],
  
  'sesame': [
    'sesame', 'tahini', 'sesame oil', 'sesame seed', 'sesame seeds',
    'sesamol', 'sesamum', 'benne', 'gingelly', 'til', 'simsim'
  ],
  
  // Additional allergens
  'mustard': ['mustard', 'mustard seed', 'dijon', 'yellow mustard'],
  
  'corn': [
    'corn', 'maize', 'cornmeal', 'cornstarch', 'corn starch',
    'corn syrup', 'high fructose corn syrup', 'hfcs', 'hominy',
    'polenta', 'grits', 'popcorn', 'corn oil', 'cornflour',
    'masa', 'tortilla', 'corn flour'
  ],
  
  'chickpeas': [
    'chickpea', 'chickpeas', 'garbanzo', 'garbanzos', 'garbanzo bean',
    'chana', 'hummus', 'houmous', 'falafel', 'besan', 'gram flour'
  ],
  
  'lentils': [
    'lentil', 'lentils', 'dal', 'dhal', 'daal', 'lentil soup',
    'red lentil', 'green lentil', 'brown lentil', 'masoor', 'moong'
  ],
  
  'peas': [
    'pea', 'peas', 'green pea', 'garden pea', 'split pea',
    'snow pea', 'snap pea', 'sugar snap', 'pea protein'
  ],
  
  'beans': [
    'bean', 'beans', 'kidney bean', 'black bean', 'pinto bean',
    'navy bean', 'lima bean', 'butter bean', 'cannellini',
    'great northern', 'fava bean', 'broad bean', 'adzuki',
    'mung bean', 'refried beans'
  ],
  
  'crustaceans': [
    'crustacean', 'crab', 'lobster', 'crawfish', 'crayfish',
    'shrimp', 'prawn', 'langoustine', 'krill'
  ],
  
  'mollusks': [
    'mollusk', 'mollusc', 'clam', 'oyster', 'mussel', 'scallop',
    'squid', 'octopus', 'cuttlefish', 'snail', 'escargot',
    'abalone', 'conch', 'whelk', 'periwinkle'
  ],
  
  'banana': ['banana', 'plantain', 'banana bread'],
  
  'avocado': ['avocado', 'guacamole', 'avo'],
  
  'kiwi': ['kiwi', 'kiwifruit', 'chinese gooseberry'],
  
  'strawberry': ['strawberry', 'strawberries'],
  
  'tomato': [
    'tomato', 'tomatoes', 'tomato sauce', 'marinara', 'salsa',
    'ketchup', 'catsup', 'tomato paste', 'roma tomato',
    'cherry tomato', 'sun dried tomato'
  ],
  
  'potato': [
    'potato', 'potatoes', 'french fries', 'french fry', 'fries',
    'mashed potato', 'baked potato', 'hash brown', 'tater tot',
    'potato chip', 'chips', 'crisps'
  ],
  
  'garlic': ['garlic', 'garlic powder', 'garlic salt', 'aioli'],
  
  'onion': [
    'onion', 'onions', 'scallion', 'green onion', 'shallot',
    'leek', 'chive', 'onion powder', 'red onion', 'white onion',
    'yellow onion', 'sweet onion'
  ],
  
  'oats': [
    'oat', 'oats', 'oatmeal', 'oat flour', 'oat milk', 'oat bran',
    'rolled oats', 'steel cut oats', 'oat cereal', 'granola'
  ],
  
  'rice': [
    'rice', 'brown rice', 'white rice', 'wild rice', 'basmati',
    'jasmine rice', 'rice flour', 'rice milk', 'rice paper',
    'rice noodle', 'rice cake', 'risotto', 'sushi rice'
  ],
  
  'barley': ['barley', 'barley malt', 'malt', 'malted barley'],
  
  'rye': ['rye', 'rye bread', 'rye flour', 'pumpernickel'],
  
  'quinoa': ['quinoa', 'quinoa flour'],
  
  'buckwheat': ['buckwheat', 'buckwheat flour', 'soba', 'soba noodle'],
  
  'gelatin': [
    'gelatin', 'gelatine', 'jello', 'jell-o', 'marshmallow',
    'gummy', 'gummies'
  ],
  
  'cocoa': [
    'cocoa', 'cacao', 'chocolate', 'dark chocolate', 'milk chocolate',
    'white chocolate', 'hot chocolate', 'cocoa powder', 'cocoa butter'
  ],
  
  'red meat': [
    'beef', 'pork', 'lamb', 'veal', 'venison', 'bison', 'buffalo',
    'red meat', 'steak', 'hamburger', 'bacon', 'ham', 'sausage',
    'salami', 'pepperoni', 'prosciutto', 'alpha-gal', 'alpha gal'
  ],
  
  'lupin': ['lupin', 'lupine', 'lupin flour', 'lupini bean']
};

// Helper function to check for allergens with PERFECT detection
const checkForAllergens = (foodLabel, ingredients, healthLabels, category, userAllergies) => {
  const detectedAllergens = [];
  
  // Create comprehensive search text from ALL available sources
  const searchComponents = [
    foodLabel || '',
    category || '',
    ...(ingredients || []),
    ...(healthLabels || [])
  ];
  
  // Clean and prepare search text
  const searchText = searchComponents
    .join(' ')
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ') // Replace special chars with spaces
    .replace(/\s+/g, ' '); // Collapse multiple spaces
  
  console.log('\n=== ALLERGEN DETECTION ===');
  console.log('Food:', foodLabel);
  console.log('Search text:', searchText);
  console.log('User allergies:', userAllergies);

  userAllergies.forEach(allergy => {
    const allergyLower = allergy.toLowerCase().trim();
    
    // Get keywords for this allergy
    const keywords = ALLERGEN_KEYWORDS[allergyLower] || [allergyLower];
    
    console.log(`\nChecking allergy: "${allergy}"`);
    console.log(`Keywords to check: ${keywords.slice(0, 5).join(', ')}... (${keywords.length} total)`);
    
    // Check if any keyword matches
    let found = false;
    let matchedKeyword = '';
    
    for (const keyword of keywords) {
      const keywordLower = keyword.toLowerCase();
      
      // Method 1: Exact word boundary match
      const wordBoundaryRegex = new RegExp(`\\b${keywordLower}\\b`, 'i');
      if (wordBoundaryRegex.test(searchText)) {
        found = true;
        matchedKeyword = keyword;
        break;
      }
      
      // Method 2: Part of compound word (e.g., "icecream", "soymilk")
      if (searchText.includes(keywordLower)) {
        found = true;
        matchedKeyword = keyword;
        break;
      }
    }

    if (found) {
      console.log(`✓ DETECTED via keyword: "${matchedKeyword}"`);
      if (!detectedAllergens.includes(allergy)) {
        detectedAllergens.push(allergy);
      }
    } else {
      console.log(`✗ Not detected`);
    }
  });

  console.log('\n✓ Final detected allergens:', detectedAllergens);
  console.log('==========================\n');

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
    const { foodId, quantity = 100, measureURI, searchQuery } = req.body;

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

    // Get food name - PRIORITIZE USER'S SEARCH QUERY
    let foodName = searchQuery || foodData?.label || parsedFood?.foodMatch || 'Food Item';
    
    // Clean up the food name (capitalize properly)
    foodName = foodName
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');

    // Extract ALL possible ingredient information
    const ingredients = [];
    const healthLabels = data.healthLabels || [];
    const category = foodData?.category || 'General Food';
    
    if (foodData) {
      if (foodData.label) ingredients.push(foodData.label);
      if (foodData.knownAs) ingredients.push(...foodData.knownAs);
      if (foodData.foodContentsLabel) ingredients.push(foodData.foodContentsLabel);
    }
    
    // Add the food name itself to ingredients for better detection
    if (!ingredients.includes(foodName)) {
      ingredients.unshift(foodName);
    }

    // ENHANCED allergen detection with ALL available information
    const detectedAllergens = checkForAllergens(
      foodName,
      ingredients,
      healthLabels,
      category,
      user.allergies
    );

    const foodDetails = {
      foodId: foodId,
      label: foodName,
      category: category,
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
      ingredients: ingredients,
      healthLabels: healthLabels,
      allergenDetected: detectedAllergens.length > 0,
      detectedAllergens: detectedAllergens
    };

    // Save to search history with USER'S ORIGINAL SEARCH QUERY
    await SearchHistory.create({
      user: req.user.id,
      foodName: foodName,
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
