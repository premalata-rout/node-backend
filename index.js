require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected!'))
  .catch(err => console.error('MongoDB connection failed:', err.message));

app.use(cors());
app.use(express.json());

// User authentication routes
const authRoutes = require('./auth');
app.use('/auth', authRoutes);

// Admin authentication middleware
function verifyAdmin(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Admin authentication required'
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.ADMIN_JWT_SECRET);

    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access only' });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      error: 'Invalid or expired admin token'
    });
  }
}

// Admin login — keep this route only once
app.post('/admin/login', (req, res) => {
  const { password } = req.body;

  if (!process.env.ADMIN_PASSWORD || !process.env.ADMIN_JWT_SECRET) {
    return res.status(500).json({
      error: 'Admin security is not configured'
    });
  }

  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Invalid admin password' });
  }

  const token = jwt.sign(
    { role: 'admin' },
    process.env.ADMIN_JWT_SECRET,
    { expiresIn: '2h' }
  );

  res.json({ token });
});

// Product schema
const productSchema = new mongoose.Schema({
  name: String,
  title: String,
  price: Number,
  category: String,
  image: String,
  desc: String,
  description: String
});

const Product = mongoose.model('Product', productSchema);

// Order schema
const orderSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  products: { type: Array, required: true },
  total: { type: Number, required: true },
  address: { type: String, required: true },
  paymentMethod: { type: String, default: 'COD' },
  status: { type: String, default: 'Placed' },
  date: { type: Date, default: Date.now }
});

const Order = mongoose.model('Order', orderSchema);

// Home route
app.get('/', (req, res) => {
  res.json({ message: 'Backend is running with MongoDB!' });
});

// Get all products
app.get('/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get product by ID
app.get('/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (err) {
    res.status(404).json({ message: 'Product not found' });
  }
});

// Add product — admin only
app.post('/products', verifyAdmin, async (req, res) => {
  try {
    const newProduct = new Product({
      name: req.body.title || req.body.name,
      title: req.body.title || req.body.name,
      price: Number(req.body.price),
      category: req.body.category,
      image: req.body.image,
      desc: req.body.desc || 'New Product',
      description: req.body.description || req.body.desc
    });

    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add product' });
  }
});

// Update product — admin only
app.put('/products/:id', verifyAdmin, async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// Delete product — admin only
app.delete('/products/:id', verifyAdmin, async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// Place order
app.post('/api/order/place', async (req, res) => {
  try {
    const order = new Order(req.body);
    await order.save();

    console.log('New Order Placed:', order._id);

    res.status(201).json({
      message: 'Order Placed Successfully',
      order
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get orders by user ID
app.get('/api/order/:userId', async (req, res) => {
  try {
    const userId = decodeURIComponent(req.params.userId);

    console.log('Fetching orders for:', userId);

    const orders = await Order.find({ userId }).sort({ date: -1 });

    console.log('Found orders:', orders.length);
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Cancel order
app.put('/api/order/cancel/:id', async (req, res) => {
  try {
    console.log('Cancel request:', req.params.id);

    const updated = await Order.findByIdAndUpdate(
      req.params.id,
      { status: 'Cancelled' },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: 'Order not found' });
    }

    console.log('Cancelled success:', updated._id);

    res.json({
      message: 'Order Cancelled',
      order: updated
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});