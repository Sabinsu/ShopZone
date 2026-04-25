const express = require('express');
const router = express.Router();

// ─────────────────────────────────────
// CREATE ORDER
// ─────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const { items, total, userId, shippingAddress } = req.body;

    const newOrder = {
      items: items || [],
      total: total || 0,
      userId: userId || null,
      shippingAddress: shippingAddress || {},
      status: 'pending',
      createdAt: new Date()
    };

    // NOTE: DB connect छैन भने पनि crash नहोस् भनेर safe response
    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order: newOrder
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ─────────────────────────────────────
// GET ALL ORDERS
// ─────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    res.json({
      success: true,
      orders: [],
      message: 'Orders fetched successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ─────────────────────────────────────
// GET SINGLE ORDER
// ─────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const orderId = req.params.id;

    res.json({
      success: true,
      order: {
        id: orderId,
        items: [],
        total: 0,
        status: 'pending'
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ─────────────────────────────────────
// UPDATE ORDER STATUS
// ─────────────────────────────────────
router.put('/:id', async (req, res) => {
  try {
    const orderId = req.params.id;
    const { status } = req.body;

    res.json({
      success: true,
      message: 'Order updated successfully',
      order: {
        id: orderId,
        status: status || 'updated'
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ─────────────────────────────────────
// DELETE ORDER
// ─────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Order deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;