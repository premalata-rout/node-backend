const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const app = express();
const PORT = process.env.PORT || 3000;
const fs = require('fs');

app.use(cors());
app.use(express.json());
const authRoutes = require('./auth');
app.use('/auth', authRoutes);
app.get('/', (req, res) => {
  res.json({ message: 'Backend is running!' });
});

let products = JSON.parse(fs.readFileSync('./products.json', 'utf8'));

app.get('/products', (req, res) => {
  res.json(products);
});

app.get('/products/:id', (req, res) => {
  const productId = parseInt(req.params.id);
  const product = products.find(p => p.id === productId);
  if(product) res.json(product);
  else res.status(404).json({ message: 'Product not found' });
});

// --- ADMIN APIS ---
app.post('/products', (req, res) => {
  const newProduct = {
    id: products.length > 0? Math.max(...products.map(p=>p.id)) + 1 : 1,
    name: req.body.title || req.body.name,
    price: Number(req.body.price),
    category: req.body.category,
    image: req.body.image,
    desc: req.body.desc || 'New Product'
  };
  products.push(newProduct);
  fs.writeFileSync('./products.json', JSON.stringify(products, null, 2));
  res.json(newProduct);
});

app.put('/products/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = products.findIndex(p => p.id === id);
  if(index!== -1){
    products[index] = {...products[index],...req.body, id: id, price: Number(req.body.price) };
    fs.writeFileSync('./products.json', JSON.stringify(products, null, 2));
    res.json(products[index]);
  } else {
    res.status(404).json({ message: 'Product not found' });
  }
});

app.delete('/products/:id', (req, res) => {
  const id = parseInt(req.params.id);
  products = products.filter(p => p.id!== id);
  fs.writeFileSync('./products.json', JSON.stringify(products, null, 2));
  res.json({ message: 'Deleted' });
});

let users = [];
if (fs.existsSync('./users.json')) {
  users = JSON.parse(fs.readFileSync('./users.json', 'utf8'));
}
const JWT_SECRET = "secret123";

app.post('/register', async (req, res) => {
  const { email, password } = req.body;
  if(users.find(u => u.email === email)) return res.status(400).json({message:'Already exists'});
  const hash = await bcrypt.hash(password, 10);
  users.push({id: users.length+1, email, password: hash});
  fs.writeFileSync('./users.json', JSON.stringify(users, null, 2));
  res.json({message:'Registered!'});
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email);
  if(!user) return res.status(400).json({message:'Not found'});
  const ok = await bcrypt.compare(password, user.password);
  if(!ok) return res.status(400).json({message:'Wrong password'});
  const token = jwt.sign({email: email}, JWT_SECRET);
  res.json({token, message:'Login Success'});
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});