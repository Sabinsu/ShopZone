const express = require('express');
const router = express.Router();

// ─────────────────────────────
// MOCK PAYMENT ROUTES
// ─────────────────────────────

// create payment
router.post('/', async (req, res) => {
  try {
    res.json({
      success: true,
      message: "Payment initiated",
      data: req.body
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// payment status
router.get('/:id', async (req, res) => {
  try {
    res.json({
      success: true,
      paymentId: req.params.id,
      status: "pending"
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;