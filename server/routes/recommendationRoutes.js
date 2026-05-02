// server/routes/recommendationRoutes.js  ← REPLACE
const express = require('express')
const router  = express.Router()
const ctrl    = require('../controllers/recommendationController')

router.get ('/:userId', ctrl.getRecommendations)
router.post('/track',   ctrl.trackAction)

module.exports = router
