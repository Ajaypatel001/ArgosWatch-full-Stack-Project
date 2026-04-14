const express = require('express');
const router = express.Router();

// ==================
// POST CHATBOT MESSAGE
// ==================
router.post('/', async (req, res) => {
  try {
    const { message } = req.body;

    // validation
    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    // Simulated AI responses
    const responses = [
      "I'm analyzing your farm data. Soil moisture is good, but watch for pest attack next week.",
      "Cotton prices are rising by 5%. This could be a good time to sell.",
      "Heavy rain expected soon. Avoid spraying fertilizers today.",
      "Your crop irrigation is scheduled today evening.",
      "Weather is normal. You can proceed with pesticide spraying."
    ];

    const randomResponse =
      responses[Math.floor(Math.random() * responses.length)];

    res.json({
      userMessage: message,
      botReply: randomResponse
    });

  } catch (error) {
    console.error('Chatbot error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;