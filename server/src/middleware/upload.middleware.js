import e from 'express';
import multer from 'multer';

// Multer configuration for handling file uploads in memory (no disk storage)
// This middleware will be used in the scan creation route to handle image uploads

// Use memory storage (no disk writes)
const storage = multer.memoryStorage();

// File filter - only allow JPEG, JPG, PNG images
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png/;
  const extname = allowedTypes.test(file.originalname.toLowerCase());
  const mimetype = file.mimetype.startsWith('image/');

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files (JPEG, JPG, PNG) are allowed'));
  }
};

// Create multer upload instance
export const uploadScanToMemory = multer({
  storage: storage, // Memory storage
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
    files: 1,                   // Only allow one file per request
  },
  fileFilter: fileFilter,
});

// Error handler middleware
export const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 10MB',
      });
    }

    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: "Too many files. Only one file is allowed",
      });
    }

    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: "Unexpected file field. Only 'file' is allowed",
      });
    }
    
    return res.status(400).json({
      success: false,
      message: `Upload error: ${err.message}`,
    });
  } 
  
  else if (err) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  next();
};