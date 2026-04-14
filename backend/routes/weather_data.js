const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { auth, adminAuth } = require('../middleware/auth');

// ==================
// GET WEATHER DATA (with filter)
// ==================
router.get('/', async (req, res) => {
  try {
    const { location, limit } = req.query;

    let query = 'SELECT * FROM weather';
    let params = [];

    if (location) {
      query += ' WHERE location LIKE ?';
      params.push(`%${location}%`);
    }

    query += ' ORDER BY forecast_date DESC';

    // safer limit handling
    const safeLimit = limit ? parseInt(limit) : 30;
    query += ' LIMIT ?';
    params.push(safeLimit);

    const [data] = await pool.query(query, params);

    res.json(data);

  } catch (error) {
    console.error('Get weather data error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================
// GET SINGLE WEATHER RECORD
// ==================
router.get('/:id', async (req, res) => {
  try {
    const [data] = await pool.query(
      'SELECT * FROM weather WHERE id = ?',
      [req.params.id]
    );

    if (data.length === 0) {
      return res.status(404).json({ message: 'Weather record not found' });
    }

    res.json(data[0]);

  } catch (error) {
    console.error('Get weather record error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================
// ADD WEATHER DATA (Admin)
// ==================
router.post('/', auth, adminAuth, async (req, res) => {
  try {
    const { location, temperature, humidity, wind_speed, condition_text, pressure, visibility, uv_index, forecast_date } = req.body;

    if (!location || !temperature) {
      return res.status(400).json({
        message: 'Location and temperature are required'
      });
    }

    const [result] = await pool.query(
      'INSERT INTO weather (location, temperature, humidity, wind_speed, condition_text, pressure, visibility, uv_index, forecast_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        location,
        temperature,
        humidity || null,
        wind_speed || null,
        condition_text || null,
        pressure || null,
        visibility || null,
        uv_index || null,
        forecast_date || new Date()
      ]
    );

    res.status(201).json({
      message: 'Weather data added',
      id: result.insertId
    });

  } catch (error) {
    console.error('Add weather data error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================
// UPDATE WEATHER DATA (Admin)
// ==================
router.put('/:id', auth, adminAuth, async (req, res) => {
  try {
    const { location, temperature, humidity, wind_speed, condition_text, pressure, visibility, uv_index, forecast_date } = req.body;

    const [result] = await pool.query(
      'UPDATE weather SET location = ?, temperature = ?, humidity = ?, wind_speed = ?, condition_text = ?, pressure = ?, visibility = ?, uv_index = ?, forecast_date = ? WHERE id = ?',
      [
        location,
        temperature,
        humidity || null,
        wind_speed || null,
        condition_text || null,
        pressure || null,
        visibility || null,
        uv_index || null,
        forecast_date || new Date(),
        req.params.id
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Weather record not found' });
    }

    res.json({ message: 'Weather data updated' });

  } catch (error) {
    console.error('Update weather data error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================
// DELETE WEATHER DATA (Admin)
// ==================
router.delete('/:id', auth, adminAuth, async (req, res) => {
  try {
    const [result] = await pool.query(
      'DELETE FROM weather WHERE id = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Weather record not found' });
    }

    res.json({ message: 'Weather data deleted' });

  } catch (error) {
    console.error('Delete weather data error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;