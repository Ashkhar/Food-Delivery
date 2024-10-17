const Order = require('../models/Order');

// Create an order
exports.createOrder = async (req, res) => {
    const { items, totalPrice, deliveryAddress } = req.body;
    try {
        const newOrder = await Order.create({ user: req.user.id, items, totalPrice, deliveryAddress });
        res.status(201).json(newOrder);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all orders (Admin)
exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find().populate('user', 'name email');
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get orders by user
exports.getUserOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user.id });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
