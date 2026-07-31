require('dotenv').config();
const axios = require('axios');
const app = require('./app');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);

  // Self-ping every 10 minutes in production to keep Render instance active & eliminate 3s cold start delays
  if (process.env.NODE_ENV === 'production') {
    setInterval(() => {
      const liveUrl = process.env.RENDER_EXTERNAL_URL || 'https://restaurant-backend-bgnk.onrender.com';
      axios.get(`${liveUrl}/api/health`).catch(() => {});
    }, 10 * 60 * 1000);
  }
});
