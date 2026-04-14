const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { auth, adminAuth } = require('../middleware/auth');

// ==================
// GET MARKET HISTORY
// ==================
router.get('/', async (req, res) => {
  try {
    const { commodity, market } = req.query;

    let query = 'SELECT * FROM market_history';
    let conditions = [];
    let params = [];

    if (commodity) {
      conditions.push('commodity LIKE ?');
      params.push(`%${commodity}%`);
    }

    if (market) {
      conditions.push('market LIKE ?');
      params.push(`%${market}%`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY recorded_at DESC LIMIT 100';

    const [data] = await pool.query(query, params);
    res.json(data);

  } catch (error) {
    console.error('Get market history error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================
// GET SINGLE RECORD
// ==================
router.get('/:id', async (req, res) => {
  try {
    const [data] = await pool.query(
      'SELECT * FROM market_history WHERE id = ?',
      [req.params.id]
    );

    if (data.length === 0) {
      return res.status(404).json({ message: 'Record not found' });
    }

    res.json(data[0]);

  } catch (error) {
    console.error('Get market record error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================
// ADD MARKET HISTORY (Admin)
// ==================
router.post('/', auth, adminAuth, async (req, res) => {
  try {
    const { commodity, market, price, unit, recorded_at } = req.body;

    if (!commodity || !market || !price) {
      return res.status(400).json({
        message: 'Commodity, market and price are required'
      });
    }

    const [result] = await pool.query(
      'INSERT INTO market_history (commodity, market, price, unit, recorded_at) VALUES (?, ?, ?, ?, ?)',
      [
        commodity,
        market,
        price,
        unit || 'Quintal',
        recorded_at || new Date()
      ]
    );

    res.status(201).json({
      message: 'Market record added',
      id: result.insertId
    });

  } catch (error) {
    console.error('Add market history error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================
// DELETE MARKET HISTORY (Admin)
// ==================
router.delete('/:id', auth, adminAuth, async (req, res) => {
  try {
    const [result] = await pool.query(
      'DELETE FROM market_history WHERE id = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Record not found' });
    }

    res.json({ message: 'Market record deleted' });

  } catch (error) {
    console.error('Delete market history error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;