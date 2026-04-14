const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { auth } = require('../middleware/auth');

// ==================
// GET IRRIGATION SCHEDULES
// ==================
router.get('/', auth, async (req, res) => {
  try {
    let schedules = [];

    try {
      const [data] = await pool.query(
        'SELECT * FROM irrigation_schedules WHERE user_id = ? ORDER BY created_at DESC',
        [req.user.id]
      );
      schedules = data;
    } catch (e) {
      console.log('irrigation_schedules table not found, returning empty data');
    }

    res.json(schedules);

  } catch (error) {
    console.error('Get irrigation schedules error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;