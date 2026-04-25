// server/utils/cloudinary.js  ← NEW FILE
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload a buffer (from multer memory storage) to Cloudinary
 * @param {Buffer} buffer
 * @param {string} folder  e.g. 'products', 'avatars'
 * @returns {Promise<string>} secure_url
 */
const uploadToCloudinary = (buffer, folder = 'products') =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image', transformation: [{ quality: 'auto', fetch_format: 'auto' }] },
      (err, result) => (err ? reject(err) : resolve(result.secure_url))
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });

module.exports = { uploadToCloudinary };
