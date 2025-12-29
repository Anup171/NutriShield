const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import models
const User = require('./models/User');
const SearchHistory = require('./models/SearchHistory');

// Database connection function
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected Successfully');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    process.exit(1);
  }
}

// Clear all data
async function clearAllData() {
  try {
    console.log('\n🗑️  Starting database cleanup...\n');
    
    // Clear Users
    const usersDeleted = await User.deleteMany({});
    console.log(`✅ Deleted ${usersDeleted.deletedCount} users`);
    
    // Clear Search History
    const historyDeleted = await SearchHistory.deleteMany({});
    console.log(`✅ Deleted ${historyDeleted.deletedCount} search history records`);
    
    console.log('\n✨ Database cleared successfully!\n');
  } catch (error) {
    console.error('❌ Error clearing database:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
}

// Run the script
(async () => {
  await connectDB();
  await clearAllData();
})();
