const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

// Load environment variables
dotenv.config();

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

// Sample users with different allergy profiles
const sampleUsers = [
  {
    name: 'John Doe',
    email: 'john@test.com',
    password: 'password123',
    allergies: ['milk', 'peanuts']
  },
  {
    name: 'Jane Smith',
    email: 'jane@test.com',
    password: 'password123',
    allergies: ['eggs', 'soy', 'wheat']
  },
  {
    name: 'Bob Wilson',
    email: 'bob@test.com',
    password: 'password123',
    allergies: ['shellfish', 'fish']
  },
  {
    name: 'Alice Brown',
    email: 'alice@test.com',
    password: 'password123',
    allergies: ['tree nuts', 'sesame']
  },
  {
    name: 'Test User',
    email: 'test@test.com',
    password: 'password123',
    allergies: []
  }
];

// Create sample users
async function createSampleUsers() {
  try {
    console.log('\n🌱 Creating sample users...\n');
    
    for (const userData of sampleUsers) {
      // Check if user already exists
      const existingUser = await User.findOne({ email: userData.email });
      
      if (existingUser) {
        console.log(`⚠️  User ${userData.email} already exists, skipping...`);
        continue;
      }
      
      // Create new user
      const user = await User.create(userData);
      console.log(`✅ Created user: ${user.name} (${user.email})`);
      
      if (user.allergies.length > 0) {
        console.log(`   Allergies: ${user.allergies.join(', ')}`);
      } else {
        console.log(`   No allergies`);
      }
    }
    
    console.log('\n✨ Sample users created successfully!\n');
    console.log('📝 Login credentials:');
    console.log('   Email: any of the emails above');
    console.log('   Password: password123\n');
    
  } catch (error) {
    console.error('❌ Error creating users:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
}

// Run the script
(async () => {
  await connectDB();
  await createSampleUsers();
})();
