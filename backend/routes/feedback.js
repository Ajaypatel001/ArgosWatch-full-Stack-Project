const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { auth, adminAuth } = require('../middleware/auth');

// ==================
// SUBMIT FEEDBACK
// ==================
router.post('/', async (req, res) => {
  try {
    const { name, message, type, user_id } = req.body;

    if (!name || !message) {
      return res.status(400).json({ message: 'Name and message are required' });
    }

    const [result] = await pool.query(
      'INSERT INTO feedback (user_id, name, message, type) VALUES (?, ?, ?, ?)',
      [
        user_id || null,
        name,
        message,
        type || 'suggestion'
      ]
    );

    res.status(201).json({
      message: 'Feedback submitted',
      id: result.insertId
    });

  } catch (error) {
    console.error('Submit feedback error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================
// GET ALL FEEDBACK (Admin)
// ==================
router.get('/', auth, adminAuth, async (req, res) => {
  try {
    const [feedbacks] = await pool.query(
      'SELECT * FROM feedback ORDER BY created_at DESC'
    );

    res.json(feedbacks);

  } catch (error) {
    console.error('Get feedback error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================
// RESOLVE FEEDBACK (Admin)
// ==================
router.put('/:id/resolve', auth, adminAuth, async (req, res) => {
  try {
    const [result] = await pool.query(
      'UPDATE feedback SET is_resolved = TRUE WHERE id = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    res.json({ message: 'Feedback resolved' });

  } catch (error) {
    console.error('Resolve feedback error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;