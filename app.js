const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const session = require('express-session');
const fetch = require('node-fetch'); 

const app = express();
const Order = require('./models/Order'); 
const Customer = require('./models/Customer'); 
const Product = require('./models/Product'); 
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const MEALDB_API_URL = 'https://www.themealdb.com/api/json/v1/1/';

// Middleware to parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set up session management
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true
}));

// Set up EJS view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware to serve static files
app.use(express.static('public'));

// Root route
app.get('/', (req, res) => {
    res.redirect('/dashboard'); 
});

const fetchMeals = async (category) => {
    try {
        const response = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${category}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data.meals; 
    } catch (error) {
        console.error('Error fetching meals:', error);
        return []; 
    }
};



// Function to fetch random meal from the MealDB API
async function fetchAllCategories() {
    try {
        const response = await fetch(`${MEALDB_API_URL}categories.php`);
        const data = await response.json();
        return data.categories || []; 
    } catch (error) {
        console.error('Error fetching categories:', error);
        return []; 
    }
}

// Fetch meals by category (or other criteria if needed)
const fetchMealsByCategory = async (category) => {
    try {
        const response = await fetch(`${MEALDB_API_URL}filter.php?c=${category}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        return data.meals || []; 
    } catch (error) {
        console.error('Error fetching meals by category:', error); 
        return []; 
    }
};


app.get('/dashboard', async (req, res) => {
    try {
        
        const selectedCategory = req.query.category || 'Chicken'; 
        console.log(`Selected category from query: ${selectedCategory}`); 

        const meals = await fetchMealsByCategory(selectedCategory); 

        // Check if user is defined
        const userName = req.user ? req.user.name : 'Guest'; 
        if (!req.session.cart) {
            req.session.cart = [];
        }
       

        res.render('dashboard', {
            meals: meals || [], 
            selectedCategory: selectedCategory,
            
            userName: userName, 
        });
    } catch (error) {
        console.error('Error fetching data for dashboard:', error);
        res.status(500).send('Server error');
    }
});





// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

app.use(cors());
app.use(cookieParser());

// Other routes remain unchanged...

app.get('/login', (req, res) => {
    res.render('login2');
});

app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error during logout:', err);
            return res.status(500).send('Error during logout');
        }
        res.redirect('/login');
    });
});

app.get('/register', (req, res) => {
    res.render('register1');
});

app.get('/cart', (req, res) => {
    const cartItems = req.session.cart || [];
    res.render('cart', { cartItems });
});

app.get('/orders', async (req, res) => {
    const orders = []; 
    res.render('orders', { orders });
});

app.get('/home', (req, res) => {
    res.render('home');
});

app.get('/product/:id', async (req, res) => {
    try {
        const productId = req.params.id;
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).send('Product not found');
        }
        res.render('product', { product });
    } catch (err) {
        console.error('Error fetching product:', err);
        return res.status(500).send('Error fetching product');
    }
});

app.get('/payment', (req, res) => {
    res.render('payment');
});

app.post('/place-order', (req, res) => {
    const { name, address, phone } = req.body;
    console.log('Order placed:', { name, address, phone });
    res.redirect('/notification');
});

app.get('/notification', (req, res) => {
    res.render('notification');
});



app.get('/admin/login', (req, res) => {
    res.render('adminLogin');
});

app.post('/admin/login', (req, res) => {
    const { username, password } = req.body;
    if (username === 'admin' && password === 'password') {
        req.session.isAdmin = true;
        res.redirect('/admin/dashboard');
    } else {
        res.render('adminLogin', { error: 'Invalid credentials' });
    }
});

app.get('/admin/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error during admin logout:', err);
            return res.status(500).send('Error during logout');
        }
        res.redirect('/admin/login');
    });
});

// Middleware to check if the user is an admin
function adminAuth(req, res, next) {
    if (req.session.isAdmin) {
        return next();
    } else {
        res.redirect('/admin/login');
    }
}

// Protect admin routes
app.get('/admin/dashboard', adminAuth, async (req, res) => {
    try {
        const products = await Product.find({});
        res.render('adminDashboard', { products });
    } catch (err) {
        console.error('Error fetching products:', err);
        return res.status(500).send('Error fetching products');
    }
});

// Add Product Page
app.get('/admin/add-product', adminAuth, (req, res) => {
    res.render('addProduct');
});

app.post('/admin/add-product', adminAuth, async (req, res) => {
    try {
        console.log(req.body);
        const { name, price, description } = req.body;
        
       
        if (!name || !price || !description) {
            console.error('Missing required fields');
            return res.status(400).send('Missing required fields');
        }

        const newProduct = new Product({
            name,
            price,
            description
        });

        await newProduct.save();
        res.redirect('/admin/dashboard'); 
    } catch (err) {
        console.error('Error adding product:', err);
        res.status(500).send('Error adding product');
    }
});

// View Orders Page
app.get('/admin/view-orders', adminAuth, async (req, res) => {
    const orders = []; 
    res.render('viewOrders', { orders });
});

// View Customers Page
app.get('/admin/view-customers', adminAuth, async (req, res) => {
    try {
        const customers = await Customer.find({});
        res.render('viewCustomers', { customers });
    } catch (err) {
        console.error('Error fetching customers:', err);
        return res.status(500).send('Error fetching customers');
    }
});

app.post('/add-to-cart', (req, res) => {
    const { id, name, price, image } = req.body;

    
    if (!req.session.cart) {
        req.session.cart = [];
    }

    
    req.session.cart.push({ id, name, price, image });

    
    res.json({ message: `${name} added to cart!` });
});

app.post('/remove-from-cart', (req, res) => {
    const { id } = req.body;

    
    if (req.session.cart) {
        const cart = req.session.cart;
        const index = cart.findIndex(item => item.id === id);
        if (index !== -1) {
            cart.splice(index, 1); 
            req.session.cart = cart;
            return res.json({ success: true, message: 'Item removed from cart successfully!' });
        }
    }

    res.json({ success: false, message: 'Item not found in cart.' });
});







const mongoURI = 'mongodb://localhost:27017/uvi';

mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log('MongoDB connected');
    app.listen(3000, () => {
        console.log('Server is running on http://localhost:3000');
    });
})
.catch(err => console.error('MongoDB connection error:', err));


mongoose.set('debug', true);
