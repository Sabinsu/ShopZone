// server/routes/uploadRoutes.js
const express = require('express')
const router  = express.Router()
const { protect } = require('../middleware/authMiddleware')
const { upload, handleUpload } = require('../middleware/uploadMiddleware')

// POST /api/upload  — authenticated users only
// Accepts up to 5 images in field "images"
router.post('/', protect, upload.array('images', 5), handleUpload)

module.exports = router
