const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { auth, adminAuth } = require('../middleware/auth');

// ==================
// GET ADMIN DASHBOARD STATS
// ==================
router.get('/stats', auth, adminAuth, async (req, res) => {
  try {
    const [totalUsers] = await pool.query(
      "SELECT COUNT(*) as count FROM users WHERE role = 'user'"
    );

    const [activeUsers] = await pool.query(
      "SELECT COUNT(*) as count FROM users WHERE role = 'user' AND status = 'active'"
    );

    const [totalCrops] = await pool.query(
      'SELECT COUNT(*) as count FROM crops'
    );

    const [openFeedback] = await pool.query(
      'SELECT COUNT(*) as count FROM feedback WHERE is_resolved = FALSE'
    );

    // testimonials table ho bhi sakti hai ya nahi
    let totalTestimonials = [{ count: 0 }];
    try {
      [totalTestimonials] = await pool.query(
        'SELECT COUNT(*) as count FROM testimonials'
      );
    } catch (e) {}

    const [recentUsers] = await pool.query(
      "SELECT id, name, location, farm_size, created_at, status FROM users WHERE role = 'user' ORDER BY created_at DESC LIMIT 10"
    );

    res.json({
      totalUsers: totalUsers[0].count,
      activeUsers: activeUsers[0].count,
      totalCrops: totalCrops[0].count,
      openFeedback: openFeedback[0].count,
      totalTestimonials: totalTestimonials[0].count,
      recentUsers
    });

  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================
// GET ALL USERS (Admin)
// ==================
router.get('/users', auth, adminAuth, async (req, res) => {
  try {
    const [users] = await pool.query(
      "SELECT id, name, email, location, farm_size, primary_crop, status, created_at FROM users WHERE role = 'user' ORDER BY created_at DESC"
    );

    res.json(users);

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================
// UPDATE USER STATUS (Admin)
// ==================
router.put('/users/:id/status', auth, adminAuth, async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: 'Status required' });
    }

    await pool.query(
      'UPDATE users SET status = ? WHERE id = ?',
      [status, req.params.id]
    );

    res.json({ message: 'User status updated' });

  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;