const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { auth } = require('../middleware/auth');

// ==================
// GET MESSAGES WITH A USER
// ==================
router.get('/:userId', auth, async (req, res) => {
  try {
    const otherUserId = req.params.userId;
    const myId = req.user.id;

    const [messages] = await pool.query(
      `SELECT m.*, u.name as sender_name 
       FROM messages m 
       JOIN users u ON m.sender_id = u.id
       WHERE (m.sender_id = ? AND m.receiver_id = ?) 
          OR (m.sender_id = ? AND m.receiver_id = ?)
       ORDER BY m.created_at ASC`,
      [myId, otherUserId, otherUserId, myId]
    );

    res.json(messages);

  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================
// SEND MESSAGE
// ==================
router.post('/', auth, async (req, res) => {
  try {
    const { receiver_id, message } = req.body;

    if (!receiver_id || !message) {
      return res.status(400).json({ message: 'Receiver and message are required' });
    }

    const [result] = await pool.query(
      'INSERT INTO messages (sender_id, receiver_id, message) VALUES (?, ?, ?)',
      [req.user.id, receiver_id, message]
    );

    res.status(201).json({
      message: 'Message sent',
      data: {
        id: result.insertId,
        sender_id: req.user.id,
        receiver_id,
        message,
        created_at: new Date()
      }
    });

  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;