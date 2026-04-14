const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const axios = require('axios');

// ==================
// GET WEATHER FORECASTS
// ==================
router.get('/', async (req, res) => {
  try {
    const city = req.query.location || 'Bhopal';

    // ==================
    // 1. GEOCODING API
    // ==================
    let geoData;
    try {
      const geoRes = await axios.get(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`,
        { timeout: 5000 }
      );
      geoData = geoRes.data;
    } catch (err) {
      console.log('Geocoding API failed, using DB fallback');
    }

    // ==================
    // FALLBACK IF GEO FAIL
    // ==================
    if (!geoData || !geoData.results || geoData.results.length === 0) {
      const [dbForecasts] = await pool.query(
        'SELECT * FROM weather ORDER BY id DESC LIMIT 7'
      );

      if (dbForecasts.length > 0) {
        return res.json(dbForecasts);
      }

      return res.status(404).json({
        message: 'Location not found and no local data available'
      });
    }

    const { latitude, longitude, name } = geoData.results[0];

    // ==================
    // 2. WEATHER API
    // ==================
    const weatherRes = await axios.get(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,precipitation_probability_max,windspeed_10m_max&timezone=auto`,
      { timeout: 5000 }
    );

    const daily = weatherRes.data.daily;

    const forecasts = daily.time.map((timeStr, idx) => {
      let dayName = new Date(timeStr).toLocaleDateString('en-US', {
        weekday: 'long'
      });

      if (idx === 0) dayName = 'Today';
      else if (idx === 1) dayName = 'Tomorrow';

      return {
        id: idx + 1,
        location: name,
        day: dayName,
        temperature: daily.temperature_2m_max[idx],
        condition_text:
          daily.precipitation_probability_max[idx] > 50
            ? 'Rain'
            : daily.precipitation_probability_max[idx] > 20
            ? 'Cloudy'
            : 'Sunny',
        humidity: Math.floor(Math.random() * 30) + 50, // dynamic mock (50–80)
        wind_speed: daily.windspeed_10m_max[idx],
        precip_prob: daily.precipitation_probability_max[idx]
      };
    });

    res.json(forecasts);

  } catch (error) {
    console.error('Get weather error:', error.message);
    res.status(500).json({ message: 'Server error fetching weather' });
  }
});

module.exports = router;