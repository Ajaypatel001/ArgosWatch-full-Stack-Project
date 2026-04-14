const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// ==================
// GET ALL TESTIMONIALS (with filter)
// ==================
router.get('/', async (req, res) => {
  try {
    const { crop, limit } = req.query;

    let query = 'SELECT * FROM testimonials';
    let params = [];

    if (crop) {
      query += ' WHERE crop LIKE ?';
      params.push(`%${crop}%`);
    }

    query += ' ORDER BY id DESC';

    if (limit) {
      query += ' LIMIT ?';
      params.push(parseInt(limit));
    }

    const [testimonials] = await pool.query(query, params);

    res.json(testimonials);

  } catch (error) {
    console.error('Get testimonials error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================
// ADD TESTIMONIAL
// ==================
router.post('/', async (req, res) => {
  try {
    const { name, location, crop, rating, comment, user_id } = req.body;

    if (!name || !comment || !rating) {
      return res.status(400).json({
        message: 'Name, rating, and comment are required'
      });
    }

    const [result] = await pool.query(
      'INSERT INTO testimonials (user_id, name, location, crop, rating, comment) VALUES (?, ?, ?, ?, ?, ?)',
      [
        user_id || null,
        name,
        location || null,
        crop || null,
        rating,
        comment
      ]
    );

    res.status(201).json({
      message: 'Testimonial added',
      id: result.insertId
    });

  } catch (error) {
    console.error('Add testimonial error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;