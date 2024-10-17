const jwt = require('jsonwebtoken');
const User = require('../models/Customer');

// Middleware to protect routes
const protect = async (req, res, next) => {
    let token;

    // Check if token exists in the authorization header or cookies
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Find the user by ID from the decoded token
            req.user = await User.findById(decoded.id).select('-password'); // Remove password from response

            next(); // Continue to the next middleware or route handler
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    } else {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

// Middleware to allow access to admin users only
const admin = (req, res, next) => {
    if (req.user && req.user.isAdmin) {
        next(); // Continue if user is admin
    } else {
        res.status(403).json({ message: 'Access denied. Admins only.' });
    }
};

module.exports = { protect, admin };
