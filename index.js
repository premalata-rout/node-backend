const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());
app.get('/',(req,res)=>res.json({message:'Backend is running!'}));

let products = [
  { id: 1, name: 'Laptop', price: 50000, category: 'Laptop', image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=300', desc: '16GB RAM, 512GB SSD, Intel i7 Processor. Perfect for work and gaming.' },
  { id: 2, name: 'Mobile', price: 20000, category: 'Mobile', image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300', desc: '128GB Storage, 50MP Camera, 5000mAh Battery. 6.7 inch AMOLED Display.' },
  { id: 3, name: 'Headphones', price: 3000, category: 'Accessories', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400', desc: 'Active Noise Cancelling, 40 Hours Battery Life, Bluetooth 5.2' },
  { id: 4, name: 'Mouse', price: 800, category: 'Accessories', image: 'https://images.pexels.com/photos/2115256/pexels-photo-2115256.jpeg?auto=compress&w=400', desc: 'Wireless Gaming Mouse with RGB Lights and 16000 DPI' },
  { id: 5, name: 'Smart Watch', price: 12000, category: 'Accessories', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400', desc: 'Heart Rate Monitor, GPS, SpO2 Sensor, 7 Days Battery' },
  { id: 6, name: 'Monitor', price: 12000, category: 'Laptop', image: 'https://images.pexels.com/photos/777001/pexels-photo-777001.jpeg?auto=compress&w=400', desc: '27 inch 4K UHD Display, 144Hz Refresh Rate' },
  { id: 7, name: 'Keyboard', price: 6200, category: 'Accessories', image: 'https://m.media-amazon.com/images/I/71-OuRhiE3L.jpg', desc: 'Mechanical RGB Gaming Keyboard, Blue Switches' },
  { id: 8, name: 'Pen Drive', price: 800, category: 'Accessories', image: 'https://www.shutterstock.com/image-photo/white-usb-flash-drive-sits-260nw-2673499029.jpg', desc: '128GB USB 3.0 High Speed Pen Drive' },
  { id: 9, name: 'Printer', price: 8000, category: 'Accessories', image: 'https://t4.ftcdn.net/jpg/16/61/68/71/360_F_1661687147_8MHL4dlrmf15i9r4G3IWtSzXlxtHwnIH.jpg', desc: 'All-in-One Wireless Printer with Scanner' },
  { id: 10, name: 'Router', price: 2200, category: 'Accessories', image: 'https://t4.ftcdn.net/jpg/20/81/04/75/360_F_2081047579_FusWiGjFgaZ85xg7ZnFLa9sQLxfbs2s4h.jpg', desc: 'WiFi 6 Dual Band Router, 3000 Mbps Speed' },
  { id: 11, name: 'Gaming Chair', price: 15000, category: 'Gaming', image: 'https://heerravretail.in/wp-content/uploads/2024/02/1.jpg', desc: 'Ergonomic Gaming Chair with Lumbar Support' },
  { id: 12, name: 'Webcam', price: 1800, category: 'Accessories', image: 'https://thumbs.dreamstime.com/b/realistic-computer-web-camera-video-camera-technology-digital-illustration-webcam-devi-ce-92751166.jpg', desc: '1080P Full HD Webcam with Microphone' },
  { id: 13, name: 'Microphone', price: 3500, category: 'Gaming', image: 'https://t4.ftcdn.net/jpg/01/45/88/65/360_F_145886556_TvjCx6gsdpMqWTj03300ZpkCa0AKmuu5.jpg', desc: 'Condenser Microphone for Streaming and Podcast' },
  { id: 14, name: 'Tablet', price: 25000, category: 'Mobile', image: 'https://static.vecteezy.com/system/resources/previews/069/020/884/non_2x/sleek-tablet-device-design-for-business-and-education-projects-vector.jpg', desc: '10.5 inch Display, 256GB Storage, Stylus Included' },
  { id: 15, name: 'Projector', price: 40000, category: 'Gaming', image: 'https://cdn.mos.cms.futurecdn.net/pjJ5VivxrPhB6Dcdpn49JZ.jpg', desc: '4K Home Theater Projector, 5000 Lumens' }
];

app.get('/products',(req,res)=>res.json(products));
app.post('/products',(req,res)=>{const p={id:products.length+1,name:req.body.name,price:req.body.price,category:req.body.category,image:req.body.image,desc:req.body.desc};products.push(p);res.json(p);});
app.delete('/products/:id',(req,res)=>{products=products.filter(p=>p.id!=req.params.id);res.json({message:'Deleted'});});
app.listen(process.env.PORT||10000,()=>console.log('running'));
