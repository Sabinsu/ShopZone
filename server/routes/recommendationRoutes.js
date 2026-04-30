const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  trackActivity,
  getForYou,
  getRelated,
  getTrending,
  getCollaborative,
} = require('../controllers/recommendationController');

// Public routes
router.get('/trending',             getTrending);
router.get('/related/:productId',   getRelated);
router.get('/collaborative/:productId', getCollaborative);

// Auth required
router.post('/track',   protect, trackActivity);
router.get('/for-you',  protect, getForYou);

module.exports = router;
