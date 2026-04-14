const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { auth, adminAuth } = require('../middleware/auth');

// ==================
// GET ALL MANDI PRICES
// ==================
router.get('/', async (req, res) => {
  try {
    const { city } = req.query;

    let query = 'SELECT * FROM mandi_prices';
    const params = [];

    if (city) {
      query += ' WHERE location LIKE ?';
      params.push(`%${city}%`);
    }

    query += ' ORDER BY date DESC';

    const [prices] = await pool.query(query, params);
    res.json(prices);

  } catch (error) {
    console.error('Get prices error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================
// ADD PRICE (Admin)
// ==================
router.post('/', auth, adminAuth, async (req, res) => {
  try {
    const { crop_name, price, location, date } = req.body;

    if (!crop_name || !price) {
      return res.status(400).json({ message: 'Crop name and price required' });
    }

    const [result] = await pool.query(
      'INSERT INTO mandi_prices (crop_name, price, location, date) VALUES (?, ?, ?, ?)',
      [
        crop_name,
        price,
        location || null,
        date || new Date()
      ]
    );

    res.status(201).json({
      message: 'Price added',
      id: result.insertId
    });

  } catch (error) {
    console.error('Add price error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================
// UPDATE PRICE (Admin)
// ==================
router.put('/:id', auth, adminAuth, async (req, res) => {
  try {
    const { crop_name, price, location, date } = req.body;

    const [result] = await pool.query(
      'UPDATE mandi_prices SET crop_name = ?, price = ?, location = ?, date = ? WHERE id = ?',
      [
        crop_name,
        price,
        location || null,
        date || new Date(),
        req.params.id
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Price not found' });
    }

    res.json({ message: 'Price updated' });

  } catch (error) {
    console.error('Update price error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================
// DELETE PRICE (Admin)
// ==================
router.delete('/:id', auth, adminAuth, async (req, res) => {
  try {
    const [result] = await pool.query(
      'DELETE FROM mandi_prices WHERE id = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Price not found' });
    }

    res.json({ message: 'Price deleted' });

  } catch (error) {
    console.error('Delete price error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;