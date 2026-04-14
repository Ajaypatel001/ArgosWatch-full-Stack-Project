const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// ==================
// GET SOIL METRICS (with filter)
// ==================
router.get('/', async (req, res) => {
  try {
    const { location, limit } = req.query;

    let query = 'SELECT * FROM soil_data';
    let params = [];

    if (location) {
      query += ' WHERE location LIKE ?';
      params.push(`%${location}%`);
    }

    query += ' ORDER BY id DESC';

    if (limit) {
      query += ' LIMIT ?';
      params.push(parseInt(limit));
    } else {
      query += ' LIMIT 5';
    }

    const [metrics] = await pool.query(query, params);

    res.json(metrics);

  } catch (error) {
    console.error('Get soil metrics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;