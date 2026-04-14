const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { auth } = require('../middleware/auth');

// ==================
// GET ALL FARMS
// ==================
router.get('/', auth, async (req, res) => {
  try {
    const [data] = await pool.query(
      'SELECT * FROM farms WHERE user_id = ?',
      [req.user.id]
    );

    res.json(data);

  } catch (error) {
    console.error('Get farms error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================
// CREATE FARM
// ==================
router.post('/', auth, async (req, res) => {
  try {
    const { name, location } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Farm name is required' });
    }

    const [result] = await pool.query(
      'INSERT INTO farms (user_id, name, location) VALUES (?, ?, ?)',
      [req.user.id, name, location || null]
    );

    res.status(201).json({
      message: 'Farm created',
      id: result.insertId
    });

  } catch (error) {
    console.error('Create farm error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================
// UPDATE FARM
// ==================
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, location } = req.body;

    const [result] = await pool.query(
      'UPDATE farms SET name = ?, location = ? WHERE id = ? AND user_id = ?',
      [name, location || null, req.params.id, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Farm not found' });
    }

    res.json({ message: 'Farm updated' });

  } catch (error) {
    console.error('Update farm error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================
// DELETE FARM
// ==================
router.delete('/:id', auth, async (req, res) => {
  try {
    const [result] = await pool.query(
      'DELETE FROM farms WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Farm not found' });
    }

    res.json({ message: 'Farm deleted' });

  } catch (error) {
    console.error('Delete farm error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;