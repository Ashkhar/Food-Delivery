const Product = require('../models/Product');

// Create a product
exports.createProduct = async (req, res) => {
    const { name, description, price, category, image } = req.body;
    try {
        const newProduct = await Product.create({ name, description, price, category, image });
        res.status(201).json(newProduct);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all products
exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get product by ID
exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
