require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;

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

const orderSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  products: { type: Array, required: true },
  total: { type: Number, required: true },
  address: { type: String, required: true },
  paymentMethod: { type: String, default: "COD" },
  status: { type: String, default: "Placed" },
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

app.post('/api/order/place', async (req, res) => {
  try {
    const order = new Order(req.body);
    await order.save();
    res.json({ message: "Order Placed Successfully", order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/order/:userId', async (req, res) => {
  try {
    const userId = decodeURIComponent(req.params.userId);
    const orders = await Order.find({ userId: userId }).sort({ date: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/order/cancel/:id', async (req, res) => {
  try {
    const updated = await Order.findByIdAndUpdate(
      req.params.id,
      { status: "Cancelled" },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ error: "Order not found" });
    }
    res.json({ message: "Order Cancelled", order: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/order/:id', async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
