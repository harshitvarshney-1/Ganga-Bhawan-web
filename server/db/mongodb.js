import mongoose from 'mongoose';

const ConnectDB = () => {
  mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB Connected Successfully'))
    .catch(err => console.log('❌ MongoDB Connection Error:', err));
}

export default ConnectDB;
