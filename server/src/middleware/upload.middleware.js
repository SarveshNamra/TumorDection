import multer from "multer";

// Multer configuration for in-memory file storage
// Files stored in req.file.buffer (not disk)
// This allows reusing same buffer for ML + Cloudinary

// Use memory storage (no disk I/O)
const storage = multer.memoryStorage();

// File filter - only allow JPEG, JPG, PNG images
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png'];

const fileFilter = (req, file, cb) => {
  const allowedExtensions = /\.(jpe?g|png)$/i;
  const hasValidExtension = allowedExtensions.test(file.originalname);
  const hasValidMimeType = ALLOWED_MIME_TYPES.includes(file.mimetype);

  if (hasValidExtension && hasValidMimeType) {
    return cb(null, true);
  } else {
    cb(new Error("Only image files (JPEG, JPG, PNG) are allowed"));
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
        message: "File too large. Maximum size is 10MB",
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