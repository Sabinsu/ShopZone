// server/routes/orderRoutes.js  ← REPLACE
const express = require('express')
const router  = express.Router()
const ctrl    = require('../controllers/orderController')
const { protect } = require('../middleware/authMiddleware')

router.post('/',             protect, ctrl.createOrder)
router.get ('/my-orders',    protect, ctrl.getMyOrders)
router.get ('/:id',          protect, ctrl.getOrder)
router.put ('/:id/cancel',   protect, ctrl.cancelOrder)

module.exports = router
