const mongoose = require('mongoose');
require('dotenv').config();

// Import old models (before migration)
const OldUser = require('./models/User');
const SearchHistory = require('./models/SearchHistory');

// Import new models
const Allergy = require('./models/Allergy');
const Food = require('./models/Food');
const NutritionInfo = require('./models/NutritionInfo');
const UserFoodDetection = require('./models/UserFoodDetection');

// Connect to database
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});

async function migrateData() {
  console.log('\n🔄 Starting data migration...\n');
  
  try {
    // Step 1: Migrate User Allergies to Allergy collection
    console.log('📋 Step 1: Migrating user allergies...');
    const users = await OldUser.find({});
    let allergiesCount = 0;
    
    for (const user of users) {
      if (user.allergies && user.allergies.length > 0) {
        for (const allergen of user.allergies) {
          try {
            await Allergy.findOneAndUpdate(
              { userId: user._id, allergen: allergen },
              { 
                userId: user._id,
                allergen: allergen,
                severity: 'unknown',
                addedAt: user.createdAt || new Date()
              },
              { upsert: true, new: true }
            );
            allergiesCount++;
          } catch (err) {
            console.log(`⚠️  Duplicate allergy skipped: ${allergen} for user ${user.email}`);
          }
        }
      }
    }
    console.log(`✅ Migrated ${allergiesCount} allergies from ${users.length} users\n`);

    // Step 2: Migrate SearchHistory to Food, NutritionInfo, and UserFoodDetection
    console.log('📋 Step 2: Migrating search history to Foods and Detections...');
    const searchHistories = await SearchHistory.find({}).sort({ searchedAt: 1 });
    let foodsCreated = 0;
    let nutritionCreated = 0;
    let detectionsCreated = 0;
    
    for (const history of searchHistories) {
      try {
        // Create or find Food
        let food = await Food.findOne({ 
          $or: [
            { externalId: history.foodId },
            { name: history.foodName }
          ]
        });
        
        if (!food) {
          food = await Food.create({
            name: history.foodName,
            externalId: history.foodId || undefined,
            ingredients: [], // Will be populated from API if available
            category: 'unknown',
            createdBy: history.user
          });
          foodsCreated++;
          
          // Create NutritionInfo for this food
          await NutritionInfo.create({
            foodId: food._id,
            calories: history.calories,
            protein: history.protein,
            carbohydrates: history.carbs,
            fat: history.fats,
            nutritionSource: 'api',
            lastUpdated: history.searchedAt
          });
          nutritionCreated++;
        }
        
        // Create UserFoodDetection
        await UserFoodDetection.create({
          userId: history.user,
          foodId: food._id,
          allergenDetected: history.allergenDetected || false,
          detectedAllergens: (history.detectedAllergens || []).map(a => ({
            allergen: a,
            source: 'ingredient'
          })),
          searchContext: 'search',
          detectedAt: history.searchedAt
        });
        detectionsCreated++;
        
      } catch (err) {
        console.error(`❌ Error migrating search history ${history._id}:`, err.message);
      }
    }
    
    console.log(`✅ Created ${foodsCreated} foods`);
    console.log(`✅ Created ${nutritionCreated} nutrition records`);
    console.log(`✅ Created ${detectionsCreated} food detections\n`);
    
    // Step 3: Summary
    console.log('📊 Migration Summary:');
    console.log(`   - Users: ${users.length}`);
    console.log(`   - Allergies: ${await Allergy.countDocuments()}`);
    console.log(`   - Foods: ${await Food.countDocuments()}`);
    console.log(`   - Nutrition Records: ${await NutritionInfo.countDocuments()}`);
    console.log(`   - Food Detections: ${await UserFoodDetection.countDocuments()}`);
    console.log(`   - Old Search Histories: ${await SearchHistory.countDocuments()}`);
    
    console.log('\n✅ Migration completed successfully!');
    console.log('⚠️  Note: Old SearchHistory collection is preserved. Review and delete manually if needed.');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 Database connection closed');
  }
}

// Run migration
migrateData();
