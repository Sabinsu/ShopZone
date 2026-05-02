// server/routes/adminRoutes.js  ← REPLACE
const express = require('express')
const router  = express.Router()
const ctrl    = require('../controllers/adminController')
const { protect, admin } = require('../middleware/authMiddleware')

router.use(protect, admin)   // all admin routes require auth + admin role

// Stats
router.get('/stats', ctrl.getStats)

// Products
router.get   ('/products',     ctrl.getAllProducts)
router.post  ('/products',     ctrl.createProduct)
router.put   ('/products/:id', ctrl.updateProduct)
router.delete('/products/:id', ctrl.deleteProduct)

// Orders
router.get('/orders',              ctrl.getAllOrders)
router.put('/orders/:id/status',   ctrl.updateOrderStatus)

// Users
router.get   ('/users',                ctrl.getAllUsers)
router.put   ('/users/:id/role',       ctrl.updateUserRole)
router.delete('/users/:id',           ctrl.deleteUser)
router.put   ('/users/:id/approve-seller', ctrl.approveSeller)

module.exports = router
