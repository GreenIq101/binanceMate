const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());

app.get('/api/openOrders', async (req, res) => {
  const API_KEY = 'DOHnM2KSFTwuXdi48VeeHFF9doA2eLfy4p9LhgVzh5VJOA4X4ssA30puMYORzIYt'; // Replace with your actual API key
  const endpoint = 'https://api.binance.com/api/v3/openOrders';

  try {
    const response = await axios.get(endpoint, {
      headers: {
        'X-MBX-APIKEY': API_KEY,
      },
    });
    res.json(response.data);
  } catch (err) {
    res.status(err.response ? err.response.status : 500).json({ message: 'Error fetching open orders' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
