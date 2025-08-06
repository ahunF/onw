const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const path = require('path');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// File filter function
const fileFilter = (req, file, cb) => {
  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, JPG, and PNG images are allowed.'), false);
  }
};

// Cloudinary storage configuration
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'media-gallery',
    allowed_formats: ['jpg', 'jpeg', 'png'],
    transformation: [
      { width: 1920, height: 1080, crop: 'limit', quality: 'auto' }
    ],
    public_id: (req, file) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      return `${file.fieldname}-${uniqueSuffix}`;
    }
  }
});

// Create multer upload middleware
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 10 // Maximum 10 files at once
  }
});

// Single file upload middleware
const uploadSingle = upload.single('media');

// Multiple files upload middleware
const uploadMultiple = upload.array('media', 10);

// Custom upload middleware with error handling
const uploadWithErrorHandling = (req, res, next) => {
  uploadSingle(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'File size too large. Maximum size is 5MB.'
        });
      }
      if (err.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({
          success: false,
          message: 'Too many files. Maximum 10 files allowed.'
        });
      }
      return res.status(400).json({
        success: false,
        message: `Upload error: ${err.message}`
      });
    } else if (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
    next();
  });
};

// Multiple files upload with error handling
const uploadMultipleWithErrorHandling = (req, res, next) => {
  uploadMultiple(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'One or more files are too large. Maximum size is 5MB per file.'
        });
      }
      if (err.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({
          success: false,
          message: 'Too many files. Maximum 10 files allowed.'
        });
      }
      return res.status(400).json({
        success: false,
        message: `Upload error: ${err.message}`
      });
    } else if (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
    next();
  });
};

// Validate file before upload
const validateFile = (file) => {
  const errors = [];
  
  // Check file size
  if (file.size > 5 * 1024 * 1024) {
    errors.push('File size exceeds 5MB limit');
  }
  
  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  if (!allowedTypes.includes(file.mimetype)) {
    errors.push('Invalid file type. Only JPEG, JPG, and PNG images are allowed');
  }
  
  // Check file extension
  const allowedExtensions = ['.jpg', '.jpeg', '.png'];
  const fileExtension = path.extname(file.originalname).toLowerCase();
  if (!allowedExtensions.includes(fileExtension)) {
    errors.push('Invalid file extension');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

// Generate thumbnail from Cloudinary URL
const generateThumbnail = (cloudinaryUrl) => {
  if (!cloudinaryUrl) return null;
  
  // Extract public ID from Cloudinary URL
  const matches = cloudinaryUrl.match(/\/v\d+\/(.+)\.(jpg|jpeg|png)/);
  if (!matches) return cloudinaryUrl;
  
  const publicId = matches[1];
  
  // Generate thumbnail URL with Cloudinary transformations
  return cloudinary.url(publicId, {
    width: 300,
    height: 300,
    crop: 'fill',
    quality: 'auto',
    format: 'auto'
  });
};

// Delete file from Cloudinary
const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return {
      success: result.result === 'ok',
      result
    };
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Get file info from Cloudinary
const getFileInfo = async (publicId) => {
  try {
    const result = await cloudinary.api.resource(publicId);
    return {
      success: true,
      info: {
        publicId: result.public_id,
        url: result.secure_url,
        format: result.format,
        width: result.width,
        height: result.height,
        bytes: result.bytes,
        createdAt: result.created_at
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Create ZIP archive of multiple images
const createImageZip = async (imageUrls, zipName = 'images') => {
  const archiver = require('archiver');
  const axios = require('axios');
  const stream = require('stream');
  
  return new Promise((resolve, reject) => {
    const archive = archiver('zip', {
      zlib: { level: 9 } // Compression level
    });
    
    const buffers = [];
    const passThrough = new stream.PassThrough();
    
    passThrough.on('data', (chunk) => buffers.push(chunk));
    passThrough.on('end', () => {
      const buffer = Buffer.concat(buffers);
      resolve(buffer);
    });
    
    archive.on('error', reject);
    archive.pipe(passThrough);
    
    // Add each image to the archive
    let completed = 0;
    const totalImages = imageUrls.length;
    
    if (totalImages === 0) {
      archive.finalize();
      return;
    }
    
    imageUrls.forEach(async (imageData, index) => {
      try {
        const response = await axios({
          method: 'GET',
          url: imageData.url,
          responseType: 'stream'
        });
        
        const filename = imageData.filename || `image-${index + 1}.${imageData.format || 'jpg'}`;
        archive.append(response.data, { name: filename });
        
        completed++;
        if (completed === totalImages) {
          archive.finalize();
        }
      } catch (error) {
        console.error(`Error downloading image ${index + 1}:`, error);
        completed++;
        if (completed === totalImages) {
          archive.finalize();
        }
      }
    });
  });
};

// Optimize image using Cloudinary transformations
const optimizeImage = (cloudinaryUrl, options = {}) => {
  if (!cloudinaryUrl) return null;
  
  const {
    width = 1920,
    height = 1080,
    quality = 'auto',
    format = 'auto',
    crop = 'limit'
  } = options;
  
  // Extract public ID from URL
  const matches = cloudinaryUrl.match(/\/v\d+\/(.+)\.(jpg|jpeg|png)/);
  if (!matches) return cloudinaryUrl;
  
  const publicId = matches[1];
  
  return cloudinary.url(publicId, {
    width,
    height,
    crop,
    quality,
    format
  });
};

module.exports = {
  upload,
  uploadSingle,
  uploadMultiple,
  uploadWithErrorHandling,
  uploadMultipleWithErrorHandling,
  validateFile,
  generateThumbnail,
  deleteFromCloudinary,
  getFileInfo,
  createImageZip,
  optimizeImage,
  cloudinary
};