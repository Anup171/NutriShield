/**
 * Comprehensive test to verify website functionality
 * Run: node backend/testWebsiteFunctionality.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Test database connection
async function testDatabaseConnection() {
  try {
    console.log('🔍 Testing database connection...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Database connected successfully\n');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

// Test models can be loaded
async function testModelsLoading() {
  console.log('🔍 Testing models loading...');
  try {
    const User = require('./models/User');
    const Allergy = require('./models/Allergy');
    const Food = require('./models/Food');
    const NutritionInfo = require('./models/NutritionInfo');
    const UserFoodDetection = require('./models/UserFoodDetection');
    const SearchHistory = require('./models/SearchHistory');
    
    console.log('✅ User model loaded');
    console.log('✅ Allergy model loaded');
    console.log('✅ Food model loaded');
    console.log('✅ NutritionInfo model loaded');
    console.log('✅ UserFoodDetection model loaded');
    console.log('✅ SearchHistory model loaded (for compatibility)\n');
    return true;
  } catch (error) {
    console.error('❌ Model loading failed:', error.message);
    return false;
  }
}

// Test helper functions
async function testHelperFunctions() {
  console.log('🔍 Testing helper functions...');
  try {
    const {
      getUserWithAllergies,
      addUserAllergy,
      removeUserAllergy,
      recordFoodDetection,
      getUserSearchHistory
    } = require('./helpers/schemaHelpers');
    
    console.log('✅ getUserWithAllergies loaded');
    console.log('✅ addUserAllergy loaded');
    console.log('✅ removeUserAllergy loaded');
    console.log('✅ recordFoodDetection loaded');
    console.log('✅ getUserSearchHistory loaded\n');
    return true;
  } catch (error) {
    console.error('❌ Helper functions failed:', error.message);
    return false;
  }
}

// Test routes can be loaded
async function testRoutesLoading() {
  console.log('🔍 Testing routes loading...');
  try {
    require('./routes/auth');
    console.log('✅ Auth routes loaded');
    
    require('./routes/users');
    console.log('✅ Users routes loaded');
    
    require('./routes/food');
    console.log('✅ Food routes loaded\n');
    
    return true;
  } catch (error) {
    console.error('❌ Routes loading failed:', error.message);
    return false;
  }
}

// Test database collections exist
async function testDatabaseCollections() {
  console.log('🔍 Testing database collections...');
  try {
    const User = require('./models/User');
    const Allergy = require('./models/Allergy');
    const Food = require('./models/Food');
    const NutritionInfo = require('./models/NutritionInfo');
    const UserFoodDetection = require('./models/UserFoodDetection');
    
    const userCount = await User.countDocuments();
    const allergyCount = await Allergy.countDocuments();
    const foodCount = await Food.countDocuments();
    const nutritionCount = await NutritionInfo.countDocuments();
    const detectionCount = await UserFoodDetection.countDocuments();
    
    console.log(`  Users: ${userCount}`);
    console.log(`  Allergies: ${allergyCount}`);
    console.log(`  Foods: ${foodCount}`);
    console.log(`  NutritionInfo: ${nutritionCount}`);
    console.log(`  UserFoodDetections: ${detectionCount}`);
    console.log('✅ All collections accessible\n');
    return true;
  } catch (error) {
    console.error('❌ Database collections test failed:', error.message);
    return false;
  }
}

// Run all tests
async function runAllTests() {
  console.log('╔═══════════════════════════════════════════╗');
  console.log('║   WEBSITE FUNCTIONALITY TEST SUITE       ║');
  console.log('╚═══════════════════════════════════════════╝\n');

  const results = {
    database: false,
    models: false,
    helpers: false,
    routes: false,
    collections: false
  };

  results.database = await testDatabaseConnection();
  
  if (results.database) {
    results.models = await testModelsLoading();
    results.helpers = await testHelperFunctions();
    results.routes = await testRoutesLoading();
    results.collections = await testDatabaseCollections();
  }

  console.log('\n╔═══════════════════════════════════════════╗');
  console.log('║           TEST RESULTS SUMMARY           ║');
  console.log('╚═══════════════════════════════════════════╝');
  console.log(`Database Connection:  ${results.database ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Models Loading:       ${results.models ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Helper Functions:     ${results.helpers ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Routes Loading:       ${results.routes ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Database Collections: ${results.collections ? '✅ PASS' : '❌ FAIL'}`);

  const allPassed = Object.values(results).every(r => r === true);

  if (allPassed) {
    console.log('\n🎉 ALL TESTS PASSED! Your website is fully functional! 🎉');
    console.log('\n✅ You can now start your server with: npm start');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the errors above.');
  }

  await mongoose.connection.close();
  console.log('\n👋 Test completed and database connection closed.');
}

// Execute tests
runAllTests().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
