// Handle Windows DNS SRV record resolution for MongoDB Atlas
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

// 1. Load environment variables from .env file
const dotenv = require('dotenv');
dotenv.config();

// 2. Import required packages
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// 3. Initialize Express app
const app = express();

// 4. Middleware
// Allow requests from other origins (like our frontend)
app.use(cors());
// Parse incoming requests with JSON payloads (e.g., req.body)
app.use(express.json());

// 5. Routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// Basic test route
app.get('/', (req, res) => {
  res.send('API is running successfully!');
});

// 6. Define the port
const PORT = process.env.PORT || 5000;

// 7. Connect to MongoDB Atlas and start the server
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected successfully');
    // Start Express server only after database is connected
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
  });
