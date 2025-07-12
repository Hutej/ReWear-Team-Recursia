const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { Readable } = require('stream');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Memory storage for multer (files will be processed in memory)
const storage = multer.memoryStorage();

// Configure multer for item images
const uploadItemImages = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 5 // Maximum 5 images per item
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Configure multer for profile photos
const uploadProfilePhoto = multer({
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB limit
    files: 1 // Only one profile photo
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Helper function to upload buffer to Cloudinary
const uploadToCloudinary = (buffer, options) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'image',
        ...options
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    const readableStream = new Readable();
    readableStream.push(buffer);
    readableStream.push(null);
    readableStream.pipe(uploadStream);
  });
};

// Upload item image to Cloudinary
const uploadItemImage = async (buffer, userId, originalName) => {
  const timestamp = Date.now();
  const publicId = `item_${userId}_${timestamp}`;
  
  const options = {
    folder: 'reware/items',
    public_id: publicId,
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 800, height: 800, crop: 'limit', quality: 'auto' },
      { format: 'webp' }
    ]
  };

  try {
    const result = await uploadToCloudinary(buffer, options);
    return {
      public_id: result.public_id,
      url: result.secure_url,
      alt: originalName || 'Item image'
    };
  } catch (error) {
    console.error('Error uploading item image:', error);
    throw error;
  }
};

// Upload profile photo to Cloudinary
const uploadProfileImage = async (buffer, userId) => {
  const timestamp = Date.now();
  const publicId = `profile_${userId}_${timestamp}`;
  
  const options = {
    folder: 'reware/profiles',
    public_id: publicId,
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 400, height: 400, crop: 'fill', gravity: 'face', quality: 'auto' },
      { format: 'webp' }
    ]
  };

  try {
    const result = await uploadToCloudinary(buffer, options);
    return {
      public_id: result.public_id,
      url: result.secure_url
    };
  } catch (error) {
    console.error('Error uploading profile image:', error);
    throw error;
  }
};

// Helper function to delete image from Cloudinary
const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    throw error;
  }
};

// Helper function to delete multiple images
const deleteMultipleImages = async (publicIds) => {
  try {
    const deletePromises = publicIds.map(publicId => deleteImage(publicId));
    const results = await Promise.all(deletePromises);
    return results;
  } catch (error) {
    console.error('Error deleting multiple images from Cloudinary:', error);
    throw error;
  }
};

// Helper function to get optimized image URL
const getOptimizedImageUrl = (publicId, options = {}) => {
  const {
    width = 'auto',
    height = 'auto',
    crop = 'scale',
    quality = 'auto',
    format = 'webp'
  } = options;

  return cloudinary.url(publicId, {
    width,
    height,
    crop,
    quality,
    format,
    fetch_format: 'auto'
  });
};

// Helper function to validate Cloudinary configuration
const validateCloudinaryConfig = () => {
  const requiredVars = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.warn(`Warning: Missing Cloudinary environment variables: ${missingVars.join(', ')}`);
    return false;
  }
  
  return true;
};

// Helper function to generate thumbnails
const generateThumbnails = async (publicId) => {
  try {
    const thumbnails = {
      small: cloudinary.url(publicId, {
        width: 150,
        height: 150,
        crop: 'fill',
        quality: 'auto',
        format: 'webp'
      }),
      medium: cloudinary.url(publicId, {
        width: 300,
        height: 300,
        crop: 'fill',
        quality: 'auto',
        format: 'webp'
      }),
      large: cloudinary.url(publicId, {
        width: 800,
        height: 800,
        crop: 'limit',
        quality: 'auto',
        format: 'webp'
      })
    };
    
    return thumbnails;
  } catch (error) {
    console.error('Error generating thumbnails:', error);
    throw error;
  }
};

// Process multiple files for item images
const processItemImages = async (files, userId) => {
  const uploadPromises = files.map(file => 
    uploadItemImage(file.buffer, userId, file.originalname)
  );
  
  try {
    const results = await Promise.all(uploadPromises);
    return results;
  } catch (error) {
    console.error('Error processing item images:', error);
    throw error;
  }
};

module.exports = {
  cloudinary,
  uploadItemImages,
  uploadProfilePhoto,
  uploadItemImage,
  uploadProfileImage,
  processItemImages,
  deleteImage,
  deleteMultipleImages,
  getOptimizedImageUrl,
  validateCloudinaryConfig,
  generateThumbnails
}; 