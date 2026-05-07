// server/routes/adminRoutes.js
const express = require('express')
const router  = express.Router()
const ctrl    = require('../controllers/adminController')
const { protect, admin } = require('../middleware/authMiddleware')
const { upload, handleUpload } = require('../middleware/uploadMiddleware')

router.use(protect, admin)

// Stats
router.get('/stats', ctrl.getStats)

// Products
router.get   ('/products',     ctrl.getAllProducts)
router.post  ('/products',     ctrl.createProduct)
router.put   ('/products/:id', ctrl.updateProduct)
router.delete('/products/:id', ctrl.deleteProduct)

// Product image upload (admin)
router.post('/products/upload-image', upload.array('images', 5), handleUpload)

// Orders
router.get('/orders',            ctrl.getAllOrders)
router.put('/orders/:id/status', ctrl.updateOrderStatus)

// Users
router.get   ('/users',                        ctrl.getAllUsers)
router.put   ('/users/:id/role',               ctrl.updateUserRole)
router.delete('/users/:id',                    ctrl.deleteUser)

// Seller approval
router.get('/sellers/pending',              ctrl.getPendingSellers)
router.put('/sellers/:id/approve',          ctrl.approveSeller)
router.put('/sellers/:id/reject',           ctrl.rejectSeller)
// Legacy compat
router.put('/users/:id/approve-seller',     ctrl.approveSeller)

module.exports = router
