const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { auth, adminAuth } = require('../middleware/auth');

// ==================
// GET ALL CROPS
// ==================
router.get('/', async (req, res) => {
  try {
    const [crops] = await pool.query('SELECT * FROM crops ORDER BY name');
    res.json(crops);
  } catch (error) {
    console.error('Get crops error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================
// ADD CROP (Admin)
// ==================
router.post('/', auth, adminAuth, async (req, res) => {
  try {
    const { name, season, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Crop name is required' });
    }

    const [result] = await pool.query(
      'INSERT INTO crops (name, season, description) VALUES (?, ?, ?)',
      [name, season || null, description || null]
    );

    res.status(201).json({
      message: 'Crop added',
      id: result.insertId
    });

  } catch (error) {
    console.error('Add crop error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================
// UPDATE CROP (Admin)
// ==================
router.put('/:id', auth, adminAuth, async (req, res) => {
  try {
    const { name, season, description } = req.body;

    const [result] = await pool.query(
      'UPDATE crops SET name = ?, season = ?, description = ? WHERE id = ?',
      [name, season || null, description || null, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Crop not found' });
    }

    res.json({ message: 'Crop updated' });

  } catch (error) {
    console.error('Update crop error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================
// DELETE CROP (Admin)
// ==================
router.delete('/:id', auth, adminAuth, async (req, res) => {
  try {
    const [result] = await pool.query(
      'DELETE FROM crops WHERE id = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Crop not found' });
    }

    res.json({ message: 'Crop deleted' });

  } catch (error) {
    console.error('Delete crop error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;