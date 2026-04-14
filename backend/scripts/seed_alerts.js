const pool = require('../config/db');

async function seed() {
  try {
    const [createResult] = await pool.query(`
      CREATE TABLE IF NOT EXISTS alerts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NULL,
        type VARCHAR(50) DEFAULT 'general',
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        severity ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Table alerts ensured.');

    const [rows] = await pool.query('SELECT * FROM alerts');
    if (rows.length === 0) {
       await pool.query(`INSERT INTO alerts (type, title, message, severity, is_read) VALUES 
         ('weather', 'Heavy Rain Expected', 'Heavy rainfall is expected in your area tomorrow. Please ensure appropriate drainage.', 'high', false),
         ('pest', 'Pest Warning Active', 'High chance of locust activity in nearby regions. Keep pesticide ready.', 'critical', false),
         ('market', 'Mandi Prices Updated', 'Wheat prices have seen a 5% increase in your registered Mandi.', 'medium', false),
         ('irrigation', 'Irrigation Scheduled', 'Your next automated irrigation cycle starts at 6:00 AM.', 'low', true),
         ('general', 'Welcome to AgroWatch', 'Your farm profile has been successfully configured.', 'low', true)
       `);
       console.log('Inserted dummy alerts successfully.');
    } else {
       console.log('Alerts already exist:', rows.length);
    }
  } catch(e) {
    console.error('Error seeding alerts:', e);
  } finally {
    process.exit();
  }
}

seed();
