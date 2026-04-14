const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { auth, adminAuth } = require('../middleware/auth');

// ==================
// GET ALL CROP DISEASES
// ==================
router.get('/', async (req, res) => {
  try {
    const { crop_id } = req.query;

    let query = `
      SELECT cd.*, c.name AS crop_name 
      FROM crop_diseases cd 
      LEFT JOIN crops c ON cd.crop_id = c.id
    `;
    let params = [];

    if (crop_id) {
      query += ' WHERE cd.crop_id = ?';
      params.push(crop_id);
    }

    query += ' ORDER BY cd.name';

    const [diseases] = await pool.query(query, params);
    res.json(diseases);

  } catch (error) {
    console.error('Get crop diseases error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================
// GET SINGLE DISEASE
// ==================
router.get('/:id', async (req, res) => {
  try {
    const [diseases] = await pool.query(
      `SELECT cd.*, c.name AS crop_name 
       FROM crop_diseases cd 
       LEFT JOIN crops c ON cd.crop_id = c.id 
       WHERE cd.id = ?`,
      [req.params.id]
    );

    if (diseases.length === 0) {
      return res.status(404).json({ message: 'Disease not found' });
    }

    res.json(diseases[0]);

  } catch (error) {
    console.error('Get disease error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================
// ADD CROP DISEASE (Admin)
// ==================
router.post('/', auth, adminAuth, async (req, res) => {
  try {
    const { crop_id, name, symptoms, treatment, prevention, severity, image_url } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Disease name is required' });
    }

    const [result] = await pool.query(
      'INSERT INTO crop_diseases (crop_id, name, symptoms, treatment, prevention, severity, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        crop_id || null,
        name,
        symptoms || null,
        treatment || null,
        prevention || null,
        severity || 'medium',
        image_url || null
      ]
    );

    res.status(201).json({
      message: 'Disease entry added',
      id: result.insertId
    });

  } catch (error) {
    console.error('Add disease error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================
// UPDATE CROP DISEASE (Admin)
// ==================
router.put('/:id', auth, adminAuth, async (req, res) => {
  try {
    const { crop_id, name, symptoms, treatment, prevention, severity, image_url } = req.body;

    const [result] = await pool.query(
      'UPDATE crop_diseases SET crop_id = ?, name = ?, symptoms = ?, treatment = ?, prevention = ?, severity = ?, image_url = ? WHERE id = ?',
      [
        crop_id || null,
        name,
        symptoms || null,
        treatment || null,
        prevention || null,
        severity || 'medium',
        image_url || null,
        req.params.id
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Disease not found' });
    }

    res.json({ message: 'Disease updated' });

  } catch (error) {
    console.error('Update disease error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================
// DELETE CROP DISEASE (Admin)
// ==================
router.delete('/:id', auth, adminAuth, async (req, res) => {
  try {
    const [result] = await pool.query(
      'DELETE FROM crop_diseases WHERE id = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Disease not found' });
    }

    res.json({ message: 'Disease deleted' });

  } catch (error) {
    console.error('Delete disease error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;