import cloudinary from '../config/cloudinary.config.js';
import { Readable } from 'stream';

export const cloudinaryService = {

// Upload image to Cloudinary and return URL and publicId
// imageBuffer: Buffer of the image to upload
// folder: Cloudinary folder path (default: 'neurogenai/scans')
// Returns: promise result with { url, publicId }

  async uploadImage(imageBuffer, folder = 'neurogenai/scans') {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folder,
          resource_type: 'image',
          transformation: [
            { width: 1000, height: 1000, crop: 'limit' },
            { quality: 'auto' },
          ],
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            reject(new Error(`Cloudinary upload failed: ${error.message}`));
          } else {
            console.log(`Uploaded to Cloudinary: ${result.public_id}`);
            resolve({
              url: result.secure_url,
              publicId: result.public_id,
            });
          }
        }
      );

      // Convert buffer to stream and pipe to Cloudinary
      const readableStream = Readable.from(imageBuffer);
      readableStream.pipe(uploadStream);
    });
  },


// Delete image from Cloudinary
// publicId: Cloudinary public ID of the image to delete
// Returns: promise result

  async deleteImage(publicId) {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      
      if (result.result === 'ok') {
        console.log(`Deleted from Cloudinary: ${publicId}`);
      } else {
        console.warn(`Cloudinary delete returned: ${result.result} for ${publicId}`);
      }
      
      return result;
    } catch (error) {
      console.error(`Cloudinary delete error for ${publicId}:`, error);
    }
  },
};