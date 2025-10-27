
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
require('dotenv').config();

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@kisii.go.ke';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@123';

router.post('/login', express.json(), async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'missing' });
  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    const token = jwt.sign({ email }, process.env.JWT_SECRET || 'devjwt', { expiresIn: '12h' });
    return res.json({ token, email });
  }
  return res.status(401).json({ error: 'invalid' });
});

module.exports = router;
