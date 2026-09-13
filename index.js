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

app.use(cors());
app.use(express.json());

const authRoutes = require('./auth');
app.use('/auth', authRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Backend is running with MongoDB!' });
});

app.get('/seed', async (req, res) => {
  const products = [
  { "name": "Laptop", "price": 50000, "category": "Laptop", "image": "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=300", "desc": "16GB RAM, 512GB SSD" },
  { "name": "Mobile", "price": 20000, "category": "Mobile", "image": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300", "desc": "128GB Storage, 50MP Camera" },
  { "name": "Headphones", "price": 3000, "category": "Accessories", "image": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400", "desc": "Active Noise Cancelling" },
  { "name": "Mouse", "price": 800, "category": "Accessories", "image": "https://images.pexels.com/photos/2115256/pexels-photo-2115256.jpeg?auto=compress&w=400", "desc": "Wireless Gaming Mouse" },
  { "name": "Smart Watch", "price": 12000, "category": "Accessories", "image": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400", "desc": "Heart Rate Monitor" },
  { "name": "Monitor", "price": 12000, "category": "Laptop", "image": "https://images.pexels.com/photos/777001/pexels-photo-777001.jpeg?auto=compress&w=400", "desc": "27 inch 4K UHD" },
  { "name": "Keyboard", "price": 6200, "category": "Accessories", "image": "https://m.media-amazon.com/images/I/71-OuRhiE3L.jpg", "desc": "Mechanical RGB Keyboard" },
  { "name": "Pen Drive", "price": 800, "category": "Accessories", "image": "https://www.shutterstock.com/image-photo/white-usb-flash-drive-sits-260nw-2673499029.jpg", "desc": "128GB USB 3.0" },
  { "name": "Printer", "price": 8000, "category": "Accessories", "image": "https://t4.ftcdn.net/jpg/16/61/68/71/360_F_1661687147_8MHL4dlrmf15i9r4G3IWtSzXlxtHwnIH.jpg", "desc": "All-in-One Printer" },
  { "name": "Router", "price": 2200, "category": "Accessories", "image": "https://t4.ftcdn.net/jpg/20/81/04/75/360_F_2081047579_FusWiGjFgaZ85xg7ZnFLa9sQLxfbs2s4h.jpg", "desc": "WiFi 6 Router" },
  { "name": "Gaming Chair", "price": 15000, "category": "Gaming", "image": "https://heerravretail.in/wp-content/uploads/2024/02/1.jpg", "desc": "Ergonomic Gaming Chair" },
  { "name": "Webcam", "price": 1800, "category": "Accessories", "image": "https://thumbs.dreamstime.com/b/realistic-computer-web-camera-video-camera-technology-digital-illustration-webcam-devi-ce-92751166.jpg", "desc": "1080P Webcam" },
  { "name": "Microphone", "price": 3500, "category": "Gaming", "image": "https://t4.ftcdn.net/jpg/01/45/88/65/360_F_145886556_TvjCx6gsdpMqWTj03300ZpkCa0AKmuu5.jpg", "desc": "Condenser Microphone" },
  { "name": "Tablet", "price": 25000, "category": "Mobile", "image": "https://static.vecteezy.com/system/resources/previews/069/020/884/non_2x/sleek-tablet-device-design-for-business-and-education-projects-vector.jpg", "desc": "10.5 inch Display" },
  { "name": "Projector", "price": 40000, "category": "Gaming", "image": "https://cdn.mos.cms.futurecdn.net/pjJ5VivxrPhB6Dcdpn49JZ.jpg", "desc": "4K Projector" }
  ];
  await Product.deleteMany({});
  await Product.insertMany(products);
  res.send("15 Products Seeded to LIVE MongoDB!");
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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});