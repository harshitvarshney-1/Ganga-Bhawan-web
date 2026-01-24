const mongoose = require('mongoose');

// Hardcoded for testing to bypass .env issues
const uri = "mongodb+srv://admin:C8nQDYIgiCroNyuy@cluster0.eafgzh.mongodb.net/tenant-system?retryWrites=true&w=majority&appName=Cluster0";

console.log('Testing Hardcoded URI...');

mongoose.connect(uri)
    .then(() => {
        console.log('✅ MongoDB Connected Successfully!');
        process.exit(0);
    })
    .catch(err => {
        console.error('❌ MongoDB Connection Error:', err.message);
        if (err.cause) console.error('Cause:', err.cause);
        process.exit(1);
    });
