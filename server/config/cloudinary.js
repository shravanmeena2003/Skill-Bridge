import { v2 as cloudinary } from 'cloudinary'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const connectCloudinary = async () => {
    try {
        cloudinary.config({ 
            cloud_name: process.env.CLOUDINARY_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_SECRET_KEY
        });
        
        console.log('✅ Cloudinary Connected Successfully');
    } catch (error) {
        console.error('❌ Cloudinary Connection Error:', error);
    }
}

export default connectCloudinary