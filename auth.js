const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();

let users = [];

router.post('/register', async (req,res)=>{
  const {name,email,password} = req.body;
  if(users.find(u=>u.email===email)) return res.status(400).json({error:'User exists'});
  const hashed = await bcrypt.hash(password,10);
  const user = {id:Date.now(), name, email, password:hashed};
  users.push(user);
  res.json({token:'test-token', user:{name,email}});
});

router.post('/login', async (req,res)=>{
  const {email,password}=req.body;
  const user = users.find(u=>u.email===email);
  if(!user) return res.status(400).json({error:'User not found'});
  const ok = await bcrypt.compare(password, user.password);
  if(!ok) return res.status(400).json({error:'Wrong password'});
  res.json({token:'test-token', user:{name:user.name, email:user.email}});
});

module.exports = router;