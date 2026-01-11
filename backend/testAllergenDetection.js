/**
 * ALLERGEN DETECTION SYSTEM - TEST SUITE
 * 
 * Run this script to verify the allergen detection system works correctly
 * Usage: node testAllergenDetection.js
 */

const { checkForAllergens, getAllSupportedAllergens } = require('./helpers/allergenDetector');

console.log('╔════════════════════════════════════════════════════════════════╗');
console.log('║     ALLERGEN DETECTION SYSTEM - COMPREHENSIVE TEST SUITE       ║');
console.log('╚════════════════════════════════════════════════════════════════╝\n');

// Test counter
let testsPassed = 0;
let testsFailed = 0;

function runTest(testName, foodLabel, ingredients, userAllergens, expectedAllergens) {
  console.log(`\n🧪 TEST: ${testName}`);
  console.log(`   Food: ${foodLabel}`);
  console.log(`   Ingredients: ${ingredients.join(', ') || 'None'}`);
  console.log(`   User Allergies: ${userAllergens.join(', ')}`);
  console.log(`   Expected Detection: ${expectedAllergens.join(', ') || 'None'}`);
  
  const detected = checkForAllergens(foodLabel, ingredients, userAllergens);
  const detectedSorted = detected.sort();
  const expectedSorted = expectedAllergens.sort();
  
  const passed = JSON.stringify(detectedSorted) === JSON.stringify(expectedSorted);
  
  if (passed) {
    console.log(`   ✅ PASSED - Detected: ${detected.join(', ') || 'None'}`);
    testsPassed++;
  } else {
    console.log(`   ❌ FAILED - Detected: ${detected.join(', ') || 'None'}`);
    console.log(`   Expected: ${expectedAllergens.join(', ') || 'None'}`);
    testsFailed++;
  }
}

console.log('\n┌─────────────────────────────────────────────────────────────┐');
console.log('│  TEST CATEGORY 1: Basic Allergen Detection                 │');
console.log('└─────────────────────────────────────────────────────────────┘');

runTest(
  'Milk in Cheese',
  'Cheddar Cheese',
  [],
  ['Milk'],
  ['Milk']
);

runTest(
  'Eggs in Omelet',
  'Scrambled Eggs',
  [],
  ['Eggs'],
  ['Eggs']
);

runTest(
  'Peanuts in Peanut Butter',
  'Peanut Butter',
  [],
  ['Peanuts'],
  ['Peanuts']
);

runTest(
  'Tree Nuts in Almonds',
  'Roasted Almonds',
  [],
  ['Tree Nuts'],
  ['Tree Nuts']
);

runTest(
  'Fish in Salmon',
  'Grilled Salmon',
  [],
  ['Fish'],
  ['Fish']
);

console.log('\n┌─────────────────────────────────────────────────────────────┐');
console.log('│  TEST CATEGORY 2: False Positive Prevention                │');
console.log('└─────────────────────────────────────────────────────────────┘');

runTest(
  'Milk NOT in Peanut Butter (butter exception)',
  'Peanut Butter',
  [],
  ['Milk'],
  [] // Should NOT detect milk
);

runTest(
  'Milk NOT in Almond Butter',
  'Almond Butter',
  [],
  ['Milk'],
  [] // Should NOT detect milk
);

runTest(
  'Milk NOT in Cocoa Butter',
  'Cocoa Butter',
  [],
  ['Milk'],
  [] // Should NOT detect milk
);

runTest(
  'Tree Nuts NOT in Butternut Squash',
  'Butternut Squash',
  [],
  ['Tree Nuts', 'Milk'],
  [] // Should NOT detect either
);

runTest(
  'Tree Nuts NOT in Water Chestnuts',
  'Water Chestnuts',
  [],
  ['Tree Nuts'],
  [] // Should NOT detect
);

runTest(
  'Tree Nuts NOT in Nutmeg',
  'Nutmeg',
  [],
  ['Tree Nuts'],
  [] // Should NOT detect
);

console.log('\n┌─────────────────────────────────────────────────────────────┐');
console.log('│  TEST CATEGORY 3: Multiple Allergen Detection              │');
console.log('└─────────────────────────────────────────────────────────────┘');

runTest(
  'Multiple allergens in Pizza',
  'Cheese Pizza',
  ['wheat flour', 'mozzarella cheese', 'tomato sauce'],
  ['Milk', 'Wheat', 'Tomato'],
  ['Milk', 'Wheat', 'Tomato']
);

runTest(
  'Shellfish and Fish in Paella',
  'Seafood Paella',
  ['shrimp', 'mussels', 'fish', 'rice'],
  ['Fish', 'Shellfish'],
  ['Fish', 'Shellfish']
);

runTest(
  'Eggs and Milk in Cake',
  'Chocolate Cake',
  ['flour', 'eggs', 'milk', 'butter'],
  ['Eggs', 'Milk', 'Wheat'],
  ['Eggs', 'Milk', 'Wheat']
);

console.log('\n┌─────────────────────────────────────────────────────────────┐');
console.log('│  TEST CATEGORY 4: Regional and Processed Foods             │');
console.log('└─────────────────────────────────────────────────────────────┘');

runTest(
  'Milk in Indian Paneer',
  'Paneer Tikka',
  ['paneer', 'spices'],
  ['Milk'],
  ['Milk']
);

runTest(
  'Chickpeas in Hummus',
  'Hummus',
  ['chickpeas', 'tahini'],
  ['Chickpeas', 'Sesame'],
  ['Chickpeas', 'Sesame']
);

runTest(
  'Wheat in Italian Pasta',
  'Spaghetti Carbonara',
  ['pasta', 'eggs', 'bacon'],
  ['Wheat', 'Eggs'],
  ['Wheat', 'Eggs']
);

runTest(
  'Soy in Tofu',
  'Grilled Tofu',
  ['tofu', 'soy sauce'],
  ['Soy'],
  ['Soy']
);

console.log('\n┌─────────────────────────────────────────────────────────────┐');
console.log('│  TEST CATEGORY 5: Derivative Products                      │');
console.log('└─────────────────────────────────────────────────────────────┘');

runTest(
  'Milk in Whey Protein',
  'Whey Protein Powder',
  ['whey protein isolate'],
  ['Milk'],
  ['Milk']
);

runTest(
  'Eggs in Mayonnaise',
  'Mayonnaise',
  ['egg yolk', 'oil'],
  ['Eggs'],
  ['Eggs']
);

runTest(
  'Soy in Soy Lecithin',
  'Chocolate Bar',
  ['cocoa', 'sugar', 'soy lecithin'],
  ['Soy'],
  ['Soy']
);

console.log('\n┌─────────────────────────────────────────────────────────────┐');
console.log('│  TEST CATEGORY 6: No Allergen Detection (Safe Foods)       │');
console.log('└─────────────────────────────────────────────────────────────┘');

runTest(
  'Apple with Milk allergy',
  'Fresh Apple',
  [],
  ['Milk'],
  [] // Should NOT detect
);

runTest(
  'Rice with Wheat allergy',
  'White Rice',
  [],
  ['Wheat', 'Gluten'],
  [] // Should NOT detect
);

runTest(
  'Chicken with Shellfish allergy',
  'Grilled Chicken',
  [],
  ['Shellfish', 'Fish'],
  [] // Should NOT detect
);

console.log('\n┌─────────────────────────────────────────────────────────────┐');
console.log('│  TEST CATEGORY 7: Case Insensitivity                       │');
console.log('└─────────────────────────────────────────────────────────────┘');

runTest(
  'Lowercase allergen name',
  'Cheese Pizza',
  [],
  ['milk'],
  ['milk']
);

runTest(
  'Uppercase allergen name',
  'Cheese Pizza',
  [],
  ['MILK'],
  ['MILK']
);

runTest(
  'Mixed case allergen name',
  'Cheese Pizza',
  [],
  ['MiLk'],
  ['MiLk']
);

console.log('\n┌─────────────────────────────────────────────────────────────┐');
console.log('│  TEST CATEGORY 8: Edge Cases                               │');
console.log('└─────────────────────────────────────────────────────────────┘');

runTest(
  'Empty ingredients',
  'Mystery Food',
  [],
  ['Milk', 'Eggs'],
  []
);

runTest(
  'No user allergens',
  'Peanut Butter',
  ['peanuts'],
  [],
  []
);

runTest(
  'Allergen in food name but not ingredients',
  'Almond Milk',
  ['water', 'almonds'],
  ['Tree Nuts'],
  ['Tree Nuts']
);

runTest(
  'Allergen in ingredients but not food name',
  'Smoothie',
  ['banana', 'strawberry', 'milk'],
  ['Milk', 'Banana', 'Strawberry'],
  ['Milk', 'Banana', 'Strawberry']
);

// Summary
console.log('\n╔════════════════════════════════════════════════════════════════╗');
console.log('║                         TEST SUMMARY                           ║');
console.log('╚════════════════════════════════════════════════════════════════╝\n');

const total = testsPassed + testsFailed;
const passRate = total > 0 ? ((testsPassed / total) * 100).toFixed(1) : 0;

console.log(`   Total Tests: ${total}`);
console.log(`   ✅ Passed: ${testsPassed}`);
console.log(`   ❌ Failed: ${testsFailed}`);
console.log(`   📊 Pass Rate: ${passRate}%\n`);

if (testsFailed === 0) {
  console.log('   🎉 ALL TESTS PASSED! The allergen detection system is working perfectly! 🎉\n');
} else {
  console.log(`   ⚠️  ${testsFailed} test(s) failed. Please review the output above.\n`);
}

// Show supported allergens
console.log('╔════════════════════════════════════════════════════════════════╗');
console.log('║                   SUPPORTED ALLERGENS                          ║');
console.log('╚════════════════════════════════════════════════════════════════╝\n');

const supported = getAllSupportedAllergens();
console.log(`   Total: ${supported.length} allergens\n`);
console.log('   ' + supported.join(', ') + '\n');

console.log('════════════════════════════════════════════════════════════════\n');
