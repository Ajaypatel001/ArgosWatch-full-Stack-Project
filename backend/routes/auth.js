const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { auth } = require('../middleware/auth');
// optional (future use)
const sendEmail = require('../utils/sendEmail');

// ==================
// REGISTER
// ==================
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, mobile, location } = req.body;

    // validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password required' });
    }

    // check existing
    const [existing] = await pool.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // insert user
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, mobile, location) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashedPassword, mobile || null, location || null]
    );

    // generate token
    const token = jwt.sign(
      { id: result.insertId, email, role: 'user' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // OPTIONAL EMAIL SEND
    try {
      await sendEmail(
        email,
        "AgroWatch Welcome 🌾",
        `Hello ${name},
Welcome to AgroWatch!

Aapke area (${location || 'your location'}) me kheti ke liye updates aapko milte rahenge.

Thank you 🌱`
      );
    } catch (e) {
      console.log('Email failed (ignore for now)');
    }

    res.status(201).json({
      message: 'Registered successfully',
      token
    });

  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});


// ==================
// LOGIN
// ==================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    // find user
    const [users] = await pool.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(400).json({ message: 'User not found' });
    }

    const user = users[0];

    // check password
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    // generate token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});


// ==================
// GET PROFILE
// ==================
router.get('/me', auth, async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT id, name, email, mobile, location, role, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(users[0]);

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;