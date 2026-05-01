// // config/cloudinary.js
// const cloudinary = require('cloudinary').v2;
// const { CloudinaryStorage } = require('multer-storage-cloudinary');

// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// const storage = new CloudinaryStorage({
//   cloudinary: cloudinary,
//   params: {
//     folder: 'ecommerce/products',
//     allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
//     transformation: [{ width: 800, height: 800, crop: 'limit', quality: 'auto' }],
//   },
// });

// module.exports = { cloudinary, storage };









//V2

// config/cloudinary.js
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload image buffer to Cloudinary
 * @param {Buffer} buffer - Image buffer
 * @param {String} folder - Cloudinary folder name
 * @returns {Object} - { url, public_id }
 */
const uploadToCloudinary = (buffer, folder = 'ecommerce/products') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        resource_type: 'image',
        transformation: [
          { width: 800, height: 800, crop: 'limit', quality: 'auto' }
        ],
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve({
            url: result.secure_url,
            public_id: result.public_id,
          });
        }
      }
    );
    
    // Pipe the buffer to Cloudinary
    const Readable = require('stream').Readable;
    const stream = new Readable();
    stream.push(buffer);
    stream.push(null);
    stream.pipe(uploadStream);
  });
};

module.exports = { cloudinary, uploadToCloudinary };




