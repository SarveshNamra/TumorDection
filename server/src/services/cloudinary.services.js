import { v2 as cloudinary } from 'cloudinary';
import fs, { truncateSync } from 'fs';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const cloudinaryService = {
  // Upload an image to Cloudinary
  // filePath: local path to the image file
  // folder: destination folder in Cloudinary
  // Returns as a Promise the URL of the uploaded image
  async uploadImage(filePath, folder = 'neurogenai/scans') {
    try {
      const result = await cloudinary.uploader.upload(filePath, {
        folder: folder,
        resource_type: 'image',
        transformation: [
          {width: 1000, height: 1000, crop: 'limit'},
          {quality: 'auto'},
        ],
      });

      fs.unlinkSync(filePath); // Remove the local file after upload

      return {
        url: result.secure_url,
        publicId: result.public_id,
      };
    } catch (error) {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath); // Ensure local file is removed on error
      }
      throw new Error(`Cloudinary upload failed: ${error.message}`);
    }
  },

  // Delete an image from Cloudinary using its public ID
  async deleteImage(publicId) {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      console.error(`Cloudinary deletion failed: ${error.message}`);
    }
  },
};