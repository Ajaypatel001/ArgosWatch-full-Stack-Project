const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { auth } = require('../middleware/auth');

// ==================
// GET ALL GROUPS
// ==================
router.get('/', async (req, res) => {
  try {
    let groups = [];

    try {
      const [data] = await pool.query('SELECT * FROM farmer_groups');
      groups = data;
    } catch (e) {
      console.log('farmer_groups table not found, using default data');
      
      groups = [
        {
          id: 1,
          name: "Punjab Wheat Farmers",
          description: "Farmers sharing wheat farming tips",
          location: "Punjab",
          crop: "Wheat"
        },
        {
          id: 2,
          name: "Maharashtra Cotton Growers",
          description: "Cotton farmers community",
          location: "Maharashtra",
          crop: "Cotton"
        }
      ];
    }

    res.json(groups);

  } catch (error) {
    console.error('Get groups error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================
// CREATE GROUP
// ==================
router.post('/', auth, async (req, res) => {
  try {
    const { name, description, location, crop, members } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Group name is required' });
    }

    const [result] = await pool.query(
      'INSERT INTO farmer_groups (name, description, location, crop, members, creator_id) VALUES (?, ?, ?, ?, ?, ?)',
      [
        name,
        description || null,
        location || null,
        crop || null,
        members || null,
        req.user.id
      ]
    );

    res.status(201).json({
      message: 'Group created',
      id: result.insertId
    });

  } catch (error) {
    console.error('Create group error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;