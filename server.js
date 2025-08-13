// Import necessary packages
const express = require('express');
const axios = require('axios');
const rateLimit = require('express-rate-limit');
const { logger } = require('./utils/logger.js');

// Load environment variables from .env file
require('dotenv').config();

// Initialize Express app
const app = express();
app.use(express.json());

// Define third-party service URLs
const ENDPOINT_SF_API = process.env.ENDPOINT_SF_API;
const ENDPOINT_N8N_API = process.env.ENDPOINT_N8N_API;

// Rate limiter middleware to prevent overloading the API
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // Limit each IP to 100 requests per window
  message: 'Too many requests, please try again later',
});

// Apply rate limiting globally
app.use(limiter);

// Middleware to handle request logging
app.use((req, res, next) => {
    logger.info(`Request Headers:, ${JSON.stringify(req.headers)}`);
    logger.info(`Received request: ${req.method} ${req.url}`);
    next();
});

// Route to handle communication between systems
app.post('/api/transfer', async (req, res) => {
    try {
      const payload = req.body;

      if (!payload) {
        return res.status(400).json({ error: 'Payload is required' });
      }
      logger.info(`Incoming request payload: ${JSON.stringify(payload)}`);
  
      // Step 1: Forward the request to the second system (SERVICE_B)
      const n8NResponse = await axios.post(ENDPOINT_N8N_API, payload);
      logger.info(`Response from SERVICE_B: ${JSON.stringify(n8NResponse.data)}`);
  
      // Step 2: Send the response from SERVICE_B to SERVICE_A
      const sfResponse = await axios.post(ENDPOINT_SF_API, n8NResponse.data);
      logger.info(`Response from SERVICE_A:, ${JSON.stringify(sfResponse.data)}`);
  
      // Return the final response
      return res.status(200).json(sfResponse.data);
    } catch (error) {
      logger.error(`Error processing the request:, ${error.message}`);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  

// Start the server on port 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});
