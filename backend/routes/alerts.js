const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { auth, adminAuth } = require('../middleware/auth');

// ==================
// GET ALERTS (for logged-in user)
// ==================
router.get('/', auth, async (req, res) => {
  try {
    const [alerts] = await pool.query(
      'SELECT * FROM alerts WHERE user_id = ? OR user_id IS NULL ORDER BY created_at DESC',
      [req.user.id]
    );

    res.json(alerts);

  } catch (error) {
    console.error('Get alerts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================
// CREATE ALERT (Admin)
// ==================
router.post('/', auth, adminAuth, async (req, res) => {
  try {
    const { user_id, type, title, message, severity } = req.body;

    if (!title || !message) {
      return res.status(400).json({ message: 'Title and message are required' });
    }

    const [result] = await pool.query(
      'INSERT INTO alerts (user_id, type, title, message, severity) VALUES (?, ?, ?, ?, ?)',
      [
        user_id || null,
        type || 'general',
        title,
        message,
        severity || 'medium'
      ]
    );

    res.status(201).json({
      message: 'Alert created',
      id: result.insertId
    });

  } catch (error) {
    console.error('Create alert error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================
// MARK ALERT AS READ
// ==================
router.put('/:id/read', auth, async (req, res) => {
  try {
    const [result] = await pool.query(
      'UPDATE alerts SET is_read = TRUE WHERE id = ? AND (user_id = ? OR user_id IS NULL)',
      [req.params.id, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Alert not found or not allowed' });
    }

    res.json({ message: 'Alert marked as read' });

  } catch (error) {
    console.error('Mark alert read error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================
// DELETE ALERT (Admin)
// ==================
router.delete('/:id', auth, adminAuth, async (req, res) => {
  try {
    const [result] = await pool.query(
      'DELETE FROM alerts WHERE id = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Alert not found' });
    }

    res.json({ message: 'Alert deleted' });

  } catch (error) {
    console.error('Delete alert error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;