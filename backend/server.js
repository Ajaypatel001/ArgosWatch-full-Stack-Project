const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// ==================
// MIDDLEWARE
// ==================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==================
// ROUTES
// ==================
app.use('/api/auth', require('./routes/auth'));
app.use('/api/farmers', require('./routes/farmers'));
app.use('/api/crops', require('./routes/crops'));
app.use('/api/mandi', require('./routes/mandi'));
app.use('/api/testimonials', require('./routes/testimonials'));
app.use('/api/feedback', require('./routes/feedback'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/soil', require('./routes/soil'));
app.use('/api/weather', require('./routes/weather'));
app.use('/api/seeds', require('./routes/seeds'));
app.use('/api/irrigation', require('./routes/irrigation'));
app.use('/api/chatbot', require('./routes/chatbot'));
app.use('/api/groups', require('./routes/groups'));
app.use('/api/farms', require('./routes/farms'));
app.use('/api/weather-data', require('./routes/weather_data'));
app.use('/api/market-history', require('./routes/market_history'));
app.use('/api/alerts', require('./routes/alerts'));
app.use('/api/crop-diseases', require('./routes/crop_diseases'));

// ==================
// HEALTH CHECK
// ==================
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'AgroWatch API is running 🌾' });
});

// ==================
// 404 HANDLER
// ==================
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// ==================
// ERROR HANDLER
// ==================
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});

// ==================
// START SERVER
// ==================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🌾 Server running on http://localhost:${PORT}`);
});