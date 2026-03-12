const express = require('express');
const dotenv = require('dotenv');
const apiRoutes = require('./routes/api');
const apiPoller = require('./ingestion/apiPoller');

dotenv.config();

const app = express();
app.use(express.json());

// Main Ingestion Routes
app.use('/api', apiRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`[GigShield Engine] Layer 1 Data Ingestion running on port ${PORT}`);
  
  // Start the Layer 1 API Poller for Weather Data
  apiPoller.start(600000); // Poll every 10 mins
});
