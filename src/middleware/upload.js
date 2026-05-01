
const multer = require('multer');
const path = require('path');
const { AppError } = require('../utils/AppError');

let sharp;
try {
  sharp = require('sharp');
} catch (error) {
  console.warn('⚠️ Sharp not installed');
}

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = process.env.ALLOWED_FILE_TYPES?.split(',') || 
    ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Invalid file type. Only images are allowed.', 400), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024,
  },
  fileFilter: fileFilter,
});

const processImage = async (file, width = 800, height = 800) => {
  if (!file || !sharp) return null;
  
  try {
    return await sharp(file.buffer)
      .resize(width, height, { fit: 'cover', withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();
  } catch (error) {
    console.error('Image processing error:', error.message);
    return null;
  }
};

const uploadMiddleware = {
  uploadSingle: (fieldName) => {
    return (req, res, next) => {
      upload.single(fieldName)(req, res, async (err) => {
        if (err) return next(new AppError(err.message, 400));
        
        if (req.file && sharp) {
          try {
            req.file.processed = await processImage(req.file);
          } catch (error) {
            return next(new AppError('Error processing image', 500));
          }
        }
        next();
      });
    };
  },

  uploadMultiple: (fieldName, maxCount = 5) => {
    return (req, res, next) => {
      upload.array(fieldName, maxCount)(req, res, async (err) => {
        if (err) return next(new AppError(err.message, 400));
        
        if (req.files && req.files.length && sharp) {
          try {
            for (let file of req.files) {
              file.processed = await processImage(file);
            }
          } catch (error) {
            return next(new AppError('Error processing images', 500));
          }
        }
        next();
      });
    };
  },

  // ✅ NEW: Accept ANY field name
  uploadAny: (maxCount = 5) => {
    return (req, res, next) => {
      upload.any()(req, res, async (err) => {
        if (err) return next(new AppError(err.message, 400));
        
        console.log('📥 Files received:', req.files?.length || 0);
        if (req.files) {
          req.files.forEach(f => console.log('  📎', f.fieldname, '→', f.originalname));
        }
        
        if (req.files && req.files.length && sharp) {
          try {
            for (let file of req.files) {
              file.processed = await processImage(file);
            }
          } catch (error) {
            return next(new AppError('Error processing images', 500));
          }
        }
        next();
      });
    };
  }
};

module.exports = uploadMiddleware;