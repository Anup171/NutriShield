const { ALLERGEN_KEYWORDS, SAFE_COMPOUNDS } = require('../config/allergenConfig');

/**
 * CHECK FOR ALLERGENS
 * Detects allergens in food labels and ingredients using comprehensive keyword matching
 * 
 * @param {string} foodLabel - The name/label of the food item
 * @param {array} ingredients - Array of ingredient strings
 * @param {array} userAllergens - Array of user's allergens (from signup form)
 * @returns {array} - Array of detected allergens
 */
function checkForAllergens(foodLabel, ingredients, userAllergens) {
  const detectedAllergens = [];
  const ingredientsList = Array.isArray(ingredients) ? ingredients : [];
  
  console.log('\n=== ALLERGEN DETECTION START ===');
  console.log('Food:', foodLabel);
  console.log('Ingredients:', ingredientsList);
  console.log('User allergies:', userAllergens);

  // Normalize user allergens to lowercase for comparison
  userAllergens.forEach(allergy => {
    const allergyLower = allergy.toLowerCase().trim();
    
    // Get keywords for this allergen
    const keywords = ALLERGEN_KEYWORDS[allergyLower];
    
    if (!keywords) {
      console.log(`⚠️  WARNING: No keywords found for allergen "${allergy}"`);
      // Still check using the allergen name itself as fallback
      const fallbackKeywords = [allergyLower];
      const found = searchForKeywords(foodLabel, ingredientsList, fallbackKeywords, allergy);
      if (found.detected) {
        detectedAllergens.push(allergy);
      }
      return;
    }
    
    console.log(`\n🔍 Checking allergy: "${allergy}"`);
    
    const result = searchForKeywords(foodLabel, ingredientsList, keywords, allergy);
    
    if (result.detected) {
      console.log(`✅ DETECTED "${result.matchedKeyword}" in "${result.matchedIn}"`);
      if (!detectedAllergens.includes(allergy)) {
        detectedAllergens.push(allergy);
      }
    } else {
      console.log(`❌ Not detected`);
    }
  });

  console.log('\n📋 FINAL DETECTED ALLERGENS:', detectedAllergens);
  console.log('=== ALLERGEN DETECTION END ===\n');

  return detectedAllergens;
}

/**
 * SEARCH FOR KEYWORDS
 * Helper function that searches for allergen keywords in text
 * 
 * @param {string} foodLabel - Food name
 * @param {array} ingredients - List of ingredients
 * @param {array} keywords - Keywords to search for
 * @param {string} allergyName - Name of the allergy being checked
 * @returns {object} - Detection result with details
 */
function searchForKeywords(foodLabel, ingredients, keywords, allergyName) {
  const searchItems = [foodLabel, ...ingredients].filter(item => item && item.length > 0);
  
  for (const searchItem of searchItems) {
    const searchText = searchItem.toLowerCase().trim();
    
    for (const keyword of keywords) {
      const keywordLower = keyword.toLowerCase().trim();
      
      // Skip very short keywords (less than 3 characters)
      if (!keywordLower || keywordLower.length < 2) continue;
      
      // Check if this keyword should be excluded for this compound word
      if (isExcludedCompound(searchText, keywordLower)) {
        continue;
      }
      
      // Use word boundary regex for precise matching
      const escapedKeyword = keywordLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const wordBoundaryRegex = new RegExp(`\\b${escapedKeyword}\\b`, 'i');
      
      if (wordBoundaryRegex.test(searchText)) {
        return {
          detected: true,
          matchedKeyword: keyword,
          matchedIn: searchItem,
          allergyName: allergyName
        };
      }
    }
  }
  
  return { detected: false };
}

/**
 * IS EXCLUDED COMPOUND
 * Checks if a keyword should be excluded because it's part of a safe compound word
 * 
 * @param {string} searchText - The text being searched
 * @param {string} keyword - The keyword being checked
 * @returns {boolean} - True if should be excluded
 */
function isExcludedCompound(searchText, keyword) {
  for (const [compound, excludedKeywords] of Object.entries(SAFE_COMPOUNDS)) {
    const compoundLower = compound.toLowerCase();
    
    // If the search text contains this compound word
    if (searchText.includes(compoundLower)) {
      // And the keyword is in the exclusion list for this compound
      if (excludedKeywords.some(excluded => excluded.toLowerCase() === keyword)) {
        console.log(`   ℹ️  Skipping "${keyword}" - part of safe compound "${compound}"`);
        return true;
      }
    }
  }
  return false;
}

/**
 * NORMALIZE ALLERGEN NAME
 * Converts allergen names to the standardized format used in the system
 * 
 * @param {string} allergen - Allergen name from user input
 * @returns {string} - Normalized allergen name
 */
function normalizeAllergenName(allergen) {
  const normalized = allergen.toLowerCase().trim();
  
  // Map common variations to standard names
  const variations = {
    'dairy': 'milk',
    'lactose': 'milk',
    'egg': 'eggs',
    'peanut': 'peanuts',
    'nut': 'tree nuts',
    'nuts': 'tree nuts',
    'gluten-free': 'gluten',
    'shellfish': 'shellfish',
    'crustacean': 'crustaceans',
    'mollusk': 'mollusks',
    'mollusc': 'mollusks',
    'bean': 'beans',
    'lentil': 'lentils',
    'chickpea': 'chickpeas',
    'garbanzo': 'chickpeas'
  };
  
  return variations[normalized] || normalized;
}

/**
 * GET ALLERGEN DETAILS
 * Returns detailed information about a specific allergen
 * 
 * @param {string} allergen - Allergen name
 * @returns {object} - Allergen details including category and severity info
 */
function getAllergenDetails(allergen) {
  const allergyLower = allergen.toLowerCase().trim();
  
  const categories = {
    'major': ['milk', 'eggs', 'peanuts', 'tree nuts', 'fish', 'shellfish', 'wheat', 'soy', 'sesame'],
    'legumes': ['chickpeas', 'lentils', 'peas', 'beans'],
    'grains': ['wheat', 'gluten', 'oats', 'rice', 'barley', 'rye', 'quinoa', 'buckwheat', 'corn'],
    'fruits': ['banana', 'avocado', 'kiwi', 'strawberry'],
    'vegetables': ['tomato', 'potato', 'garlic', 'onion'],
    'seafood': ['fish', 'shellfish', 'crustaceans', 'mollusks'],
    'other': ['gelatin', 'cocoa', 'red meat', 'lupin', 'mustard']
  };
  
  let category = 'other';
  for (const [cat, allergens] of Object.entries(categories)) {
    if (allergens.includes(allergyLower)) {
      category = cat;
      break;
    }
  }
  
  return {
    name: allergen,
    normalizedName: allergyLower,
    category: category,
    isMajorAllergen: categories.major.includes(allergyLower),
    keywordCount: ALLERGEN_KEYWORDS[allergyLower]?.length || 0
  };
}

/**
 * VALIDATE ALLERGEN
 * Checks if an allergen name is recognized by the system
 * 
 * @param {string} allergen - Allergen name to validate
 * @returns {boolean} - True if allergen is recognized
 */
function validateAllergen(allergen) {
  const allergyLower = allergen.toLowerCase().trim();
  return ALLERGEN_KEYWORDS.hasOwnProperty(allergyLower);
}

/**
 * GET ALL SUPPORTED ALLERGENS
 * Returns a list of all allergens supported by the system
 * 
 * @returns {array} - Array of supported allergen names
 */
function getAllSupportedAllergens() {
  return Object.keys(ALLERGEN_KEYWORDS).map(key => {
    // Capitalize first letter of each word
    return key.split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  });
}

module.exports = {
  checkForAllergens,
  normalizeAllergenName,
  getAllergenDetails,
  validateAllergen,
  getAllSupportedAllergens
};
