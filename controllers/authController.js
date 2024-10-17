
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/Customer');

// Register user
exports.register = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: "User already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({ name, email, password: hashedPassword });

        const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.cookie('token', token).status(201).json({ message: "User registered", token });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Login user
exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "Invalid credentials" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.cookie('token', token).json({ message: "Logged in", token });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get current user profile
exports.profile = async (req, res) => {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
};
