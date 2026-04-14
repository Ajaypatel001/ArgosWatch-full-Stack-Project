const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { auth } = require('../middleware/auth');

// ==================
// GET ALL FARMERS
// ==================
router.get('/', async (req, res) => {
  try {
    const [farmers] = await pool.query(
      `SELECT id, name, location, primary_crop, created_at 
       FROM users WHERE role = 'user' ORDER BY created_at DESC`
    );

    res.json(farmers);

  } catch (error) {
    console.error('Get farmers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================
// GET SINGLE FARMER
// ==================
router.get('/:id', async (req, res) => {
  try {
    const [farmers] = await pool.query(
      `SELECT id, name, location, primary_crop, created_at 
       FROM users WHERE id = ?`,
      [req.params.id]
    );

    if (farmers.length === 0) {
      return res.status(404).json({ message: 'Farmer not found' });
    }

    const farmer = farmers[0];

    // followers safe handling
    let followers = 0;
    let following = 0;

    try {
      const [followerCount] = await pool.query(
        'SELECT COUNT(*) as count FROM followers WHERE following_id = ?',
        [req.params.id]
      );

      const [followingCount] = await pool.query(
        'SELECT COUNT(*) as count FROM followers WHERE follower_id = ?',
        [req.params.id]
      );

      followers = followerCount[0].count;
      following = followingCount[0].count;

    } catch (e) {
      console.log('Followers table not found (ignore)');
    }

    res.json({
      ...farmer,
      followers,
      following
    });

  } catch (error) {
    console.error('Get farmer error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================
// UPDATE PROFILE
// ==================
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, location, farm_size, primary_crop, is_public, hide_location } = req.body;

    await pool.query(
      `UPDATE users 
       SET name = ?, location = ?, farm_size = ?, primary_crop = ?, is_public = ?, hide_location = ? 
       WHERE id = ?`,
      [
        name,
        location,
        farm_size,
        primary_crop,
        is_public ?? true,
        hide_location ?? false,
        req.user.id
      ]
    );

    const [updated] = await pool.query(
      'SELECT id, name, email, location, farm_size, primary_crop FROM users WHERE id = ?',
      [req.user.id]
    );

    res.json({ message: 'Profile updated', user: updated[0] });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================
// DELETE PROFILE
// ==================
router.delete('/profile', auth, async (req, res) => {
  try {
    await pool.query('DELETE FROM users WHERE id = ?', [req.user.id]);
    res.json({ message: 'Profile deleted successfully' });
  } catch (error) {
    console.error('Delete profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================
// FOLLOW / UNFOLLOW
// ==================
router.post('/:id/follow', auth, async (req, res) => {
  try {
    const followingId = parseInt(req.params.id);
    const followerId = req.user.id;

    if (followerId === followingId) {
      return res.status(400).json({ message: 'You cannot follow yourself' });
    }

    const [existing] = await pool.query(
      'SELECT id FROM followers WHERE follower_id = ? AND following_id = ?',
      [followerId, followingId]
    );

    if (existing.length > 0) {
      await pool.query(
        'DELETE FROM followers WHERE follower_id = ? AND following_id = ?',
        [followerId, followingId]
      );

      return res.json({ message: 'Unfollowed', isFollowing: false });
    }

    await pool.query(
      'INSERT INTO followers (follower_id, following_id) VALUES (?, ?)',
      [followerId, followingId]
    );

    res.json({ message: 'Followed', isFollowing: true });

  } catch (error) {
    console.error('Follow error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;