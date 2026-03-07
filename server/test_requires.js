try {
    console.log('Requiring express...');
    require('express');
    console.log('Requiring mongoose...');
    require('mongoose');
    console.log('Requiring path...');
    require('path');
    console.log('Requiring dotenv...');
    require('dotenv').config();
    console.log('Requiring routes/payment...');
    require('./routes/payment');
    console.log('Requiring routes/auth...');
    require('./routes/auth');
    console.log('Requiring routes/tenant...');
    require('./routes/tenant');
    console.log('Requiring routes/admin...');
    require('./routes/admin');
    console.log('✅ All modules required successfully!');
} catch (err) {
    console.error('❌ Module load error:', err);
    process.exit(1);
}
