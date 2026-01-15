// Quick Test Script for Allergy Detection
// Run this in your browser console while on the food details page

const testCases = [
  {
    food: "Idli",
    ingredients: ["Idli"],
    userAllergies: ["milk", "gluten"],
    expectedAllergens: [],
    description: "Plain Idli should have NO allergens"
  },
  {
    food: "Milk Chocolate",
    ingredients: ["Milk Chocolate", "cocoa", "milk", "sugar"],
    userAllergies: ["milk", "gluten"],
    expectedAllergens: ["milk"],
    description: "Milk Chocolate should detect MILK"
  },
  {
    food: "Peanut Butter",
    ingredients: ["peanuts", "salt"],
    userAllergies: ["peanuts", "milk"],
    expectedAllergens: ["peanuts"],
    description: "Peanut Butter should detect PEANUTS"
  },
  {
    food: "Whole Wheat Bread",
    ingredients: ["wheat flour", "water", "yeast", "salt"],
    userAllergies: ["gluten", "milk"],
    expectedAllergens: ["gluten"],
    description: "Wheat Bread should detect GLUTEN"
  },
  {
    food: "Plain Rice",
    ingredients: ["rice"],
    userAllergies: ["milk", "gluten", "eggs"],
    expectedAllergens: [],
    description: "Plain Rice should have NO allergens"
  }
];

console.log("🧪 ALLERGY DETECTION TEST SUITE\n");
console.log("================================\n");

testCases.forEach((test, index) => {
  console.log(`Test ${index + 1}: ${test.description}`);
  console.log(`  Food: ${test.food}`);
  console.log(`  Ingredients: ${test.ingredients.join(', ')}`);
  console.log(`  User Allergies: ${test.userAllergies.join(', ')}`);
  console.log(`  Expected: ${test.expectedAllergens.length > 0 ? test.expectedAllergens.join(', ') : 'NONE'}`);
  console.log('');
});

console.log("\n✅ TO RUN THESE TESTS:");
console.log("1. Start your backend server");
console.log("2. Log into your application");
console.log("3. Search for each food above");
console.log("4. Verify the allergen warnings match expectations");
console.log("\n================================\n");
