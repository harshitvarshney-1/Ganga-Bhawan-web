const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.MONGO_URI;

if (!uri) {
    console.error('❌ MONGO_URI not found in .env');
    process.exit(1);
}

console.log('Testing URI from .env...');

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

