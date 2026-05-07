// server/middleware/uploadMiddleware.js
const multer = require('multer')
const path   = require('path')
const fs     = require('fs')

// ── Local disk storage (fallback if Cloudinary not configured) ────────────────
const uploadDir = path.join(__dirname, '..', 'uploads')
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })

const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename:    (req, file, cb) => {
    const ext  = path.extname(file.originalname).toLowerCase()
    const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`
    cb(null, name)
  },
})

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|webp/
  if (allowed.test(file.mimetype) && allowed.test(path.extname(file.originalname).toLowerCase())) {
    cb(null, true)
  } else {
    cb(new Error('Only image files are allowed (jpg, png, gif, webp)'), false)
  }
}

const upload = multer({
  storage: diskStorage,
  limits:  { fileSize: 5 * 1024 * 1024 }, // 5MB per file
  fileFilter,
})

// ── Cloudinary upload helper (used when env vars are set) ────────────────────
const uploadToCloudinary = async (filePath) => {
  const cloudinary = require('cloudinary').v2
  const result = await cloudinary.uploader.upload(filePath, {
    folder:         'shopzone',
    transformation: [{ quality: 'auto', fetch_format: 'auto' }],
  })
  // Remove temp file
  fs.unlink(filePath, () => {})
  return result.secure_url
}

// ── Route handler: POST /api/upload ─────────────────────────────────────────
const handleUpload = async (req, res) => {
  try {
    if (!req.files?.length && !req.file) {
      return res.status(400).json({ message: 'No file uploaded' })
    }
    const files = req.files || [req.file]

    let urls
    if (process.env.CLOUDINARY_CLOUD_NAME) {
      // Upload to Cloudinary
      urls = await Promise.all(files.map(f => uploadToCloudinary(f.path)))
    } else {
      // Return local URL
      const base = `${req.protocol}://${req.get('host')}`
      urls = files.map(f => `${base}/uploads/${f.filename}`)
    }

    res.json({ urls, url: urls[0] })
  } catch (err) {
    res.status(500).json({ message: err.message || 'Upload failed' })
  }
}

module.exports = { upload, handleUpload }
