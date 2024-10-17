const express = require('express');
const { createProduct, getAllProducts, getProductById } = require('../controllers/productController');
const { protect, admin } = require('../middleware/authMiddleware');
const router = express.Router();

// Product routes
router.post('/', protect, admin, createProduct);
router.get('/', getAllProducts);
router.get('/:id', getProductById);

module.exports = router;

