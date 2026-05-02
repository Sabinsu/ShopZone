// server/routes/authRoutes.js  ← REPLACE
const express = require('express')
const router  = express.Router()
const ctrl    = require('../controllers/authController')
const { protect } = require('../middleware/authMiddleware')
const { authLimiter } = require('../middleware/rateLimiter')

router.post('/register', authLimiter, ctrl.register)
router.post('/login',    authLimiter, ctrl.login)
router.post('/google',   authLimiter, ctrl.googleLogin)

router.get ('/profile',              protect, ctrl.getProfile)
router.put ('/profile',              protect, ctrl.updateProfile)
router.post('/wishlist/:productId',  protect, ctrl.toggleWishlist)
router.put ('/notifications/read',   protect, ctrl.markNotificationsRead)
router.post('/become-seller',        protect, ctrl.becomeSeller)

module.exports = router
