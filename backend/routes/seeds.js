const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// ==================
// GET SEED RECOMMENDATIONS (with filter)
// ==================
router.get('/', async (req, res) => {
  try {
    const { crop_type } = req.query;

    let query = 'SELECT * FROM seeds';
    let params = [];

    if (crop_type) {
      query += ' WHERE crop_type LIKE ?';
      params.push(`%${crop_type}%`);
    }

    query += ' ORDER BY id ASC';

    const [seeds] = await pool.query(query, params);

    res.json(seeds);

  } catch (error) {
    console.error('Get seeds error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;