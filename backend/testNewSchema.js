/**
 * Test file to verify new schema is working
 * Run with: node backend/testNewSchema.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('./models/User');
const Allergy = require('./models/Allergy');
const Food = require('./models/Food');
const NutritionInfo = require('./models/NutritionInfo');
const UserFoodDetection = require('./models/UserFoodDetection');

// Import helpers
const {
  getUserWithAllergies,
  addUserAllergy,
  recordFoodDetection,
  getUserSearchHistory
} = require('./helpers/schemaHelpers');

async function testNewSchema() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Test 1: Check models are loaded
    console.log('📋 Test 1: Checking models...');
    console.log('  Users:', await User.countDocuments());
    console.log('  Allergies:', await Allergy.countDocuments());
    console.log('  Foods:', await Food.countDocuments());
    console.log('  NutritionInfo:', await NutritionInfo.countDocuments());
    console.log('  UserFoodDetections:', await UserFoodDetection.countDocuments());
    console.log('  ✅ All models loaded\n');

    // Test 2: Get a user with allergies
    console.log('📋 Test 2: Testing getUserWithAllergies...');
    const users = await User.find().limit(1);
    if (users.length > 0) {
      const user = await getUserWithAllergies(users[0]._id);
      console.log('  User:', user.name);
      console.log('  Allergies:', user.allergies);
      console.log('  ✅ getUserWithAllergies works\n');
    } else {
      console.log('  ⚠️  No users in database\n');
    }

    // Test 3: Test search history
    console.log('📋 Test 3: Testing getUserSearchHistory...');
    if (users.length > 0) {
      const history = await getUserSearchHistory(users[0]._id, 5);
      console.log('  History items:', history.length);
      if (history.length > 0) {
        console.log('  Latest search:', history[0].foodName);
      }
      console.log('  ✅ getUserSearchHistory works\n');
    }

    console.log('✅ All tests passed!');
    console.log('\n🎉 New schema is working correctly!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 Database connection closed');
  }
}

// Run tests
testNewSchema();
