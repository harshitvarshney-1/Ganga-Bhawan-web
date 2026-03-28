import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

console.log('Testing Cloudinary with:');
console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);
console.log('API Key:', process.env.CLOUDINARY_API_KEY);
// Don't log full secret for security
console.log('API Secret:', process.env.CLOUDINARY_API_SECRET ? '******' + process.env.CLOUDINARY_API_SECRET.slice(-4) : 'MISSING');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

async function testUpload() {
  try {
    console.log('Attempting test upload to Cloudinary...');
    const result = await cloudinary.uploader.upload('https://cloudinary-devs.github.io/res/cloudinary-logo-95x95.png', {
      folder: 'test-connection',
      timeout: 60000
    });
    console.log('✅ Upload Success!');
    console.log('URL:', result.secure_url);
    process.exit(0);
  } catch (error) {
    console.error('❌ Upload Failed!');
    console.error(error);
    process.exit(1);
  }
}

testUpload();
