// server/routes/productRoutes.js  ← REPLACE
const express = require('express')
const router  = express.Router()
const ctrl    = require('../controllers/productController')
const { protect } = require('../middleware/authMiddleware')

router.get ('/',    ctrl.getProducts)
router.get ('/:id', ctrl.getProduct)
router.post('/',    protect, ctrl.createProduct)
router.put ('/:id', protect, ctrl.updateProduct)
router.delete('/:id', protect, ctrl.deleteProduct)

module.exports = router
