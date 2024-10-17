const express = require('express');
const { createOrder, getAllOrders, getUserOrders } = require('../controllers/orderController');
const { protect, admin } = require('../middleware/authMiddleware');
const router = express.Router();

// Order routes
router.post('/', protect, createOrder);
router.get('/', protect, admin, getAllOrders);
router.get('/user', protect, getUserOrders);

module.exports = router;

