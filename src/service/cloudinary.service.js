import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs';

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export const uploadToCloudinary = async (filePath) => {
    if(!filePath) throw new Error('File path is required for upload');
    try {
        const result = await cloudinary.uploader.upload(filePath, {
             resource_type: 'auto'
        });
        console.log("filwe uploaded to cloudinary");
        // Optionally delete the local file after upload
        fs.unlinkSync(filePath);
        return result.secure_url; // Return the URL of the uploaded image
    } catch (error) {
        fs.unlinkSync(filePath);
        throw new Error(`Cloudinary upload failed: ${error.message}`);
    }
}