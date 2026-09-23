require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB Connect
mongoose.connect(process.env.MONGO_URI)
.then(()=> console.log("MongoDB Connected!"))
.catch(err => console.log(err));

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

const userSchema = new mongoose.Schema({
  email: String,
  password: String
});
const User = mongoose.model('User', userSchema);

const orderSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  products: { type: Array, required: true },
  total: { type: Number, required: true },
  address: { type: String, required: true },
  paymentMethod: { type: String, default: "COD" },
  date: { type: Date, default: Date.now }
});
const Order = mongoose.model('Order', orderSchema);

app.use(cors());
app.use(express.json());

const authRoutes = require('./auth');
app.use('/auth', authRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Backend is running with MongoDB!' });
});

app.get('/products', async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

app.get('/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if(product) res.json(product);
    else res.status(404).json({ message: 'Product not found' });
  } catch(e) {
    res.status(404).json({ message: 'Product not found' });
  }
});

app.post('/products', async (req, res) => {
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
  res.json(newProduct);
});

app.put('/products/:id', async (req, res) => {
  const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
});

app.delete('/products/:id', async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

const JWT_SECRET = "secret123";

app.post('/register', async (req, res) => {
  const { email, password } = req.body;
  const exists = await User.findOne({ email });
  if(exists) return res.status(400).json({message:'Already exists'});
  const hash = await bcrypt.hash(password, 10);
  const user = new User({ email, password: hash });
  await user.save();
  res.json({message:'Registered!'});
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if(!user) return res.status(400).json({message:'Not found'});
  const ok = await bcrypt.compare(password, user.password);
  if(!ok) return res.status(400).json({message:'Wrong password'});
  const token = jwt.sign({email: email}, JWT_SECRET);
  res.json({token, message:'Login Success'});
});

// Order APIs
app.post('/api/order/place', async (req, res) => {
  try {
    const order = new Order(req.body);
    await order.save();
    res.json({ message: "Order Placed Successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/order/:userId', async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId }).sort({ date: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/order/:id', async (req, res) => {
  try {
    console.log("Deleting Order:", req.params.id);
    const deleted = await Order.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: "Order not found" });
    }
    res.json({ message: "Order Deleted Successfully", orderId: req.params.id });
  } catch (err) {
    console.error("Delete Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
