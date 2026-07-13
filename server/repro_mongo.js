const mongoose = require('mongoose');
require('dotenv').config({ path: '.env' });

async function testConnection() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI is not set in .env!");
    return;
  }
  
  console.log(`Connecting to: ${uri.replace(/:([^:@]{3,})@/, ':****@')}`);
  
  try {
    // Basic connection test
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000, 
    });
    console.log("✅ Main Connection Successful!");
    
    // Test a basic operation to ensure the socket isn't timing out after connection
    const User = mongoose.model('User', new mongoose.Schema({}), 'users');
    const userCount = await User.countDocuments();
    console.log(`✅ Queried users collection, found ${userCount} documents.`);
    
    await mongoose.disconnect();
    console.log("Disconnected.");
  } catch (error) {
    console.error("❌ Connection Test Failed:", error.message);
    if (error.name === 'MongooseServerSelectionError') {
      console.log("\nPossible solutions:");
      console.log("1. Add '&family=4' to your connection string in .env (if you have IPv6 DNS issues)");
      console.log("2. Use a different network (DNS might be blocked)");
    }
  }
}

testConnection();
