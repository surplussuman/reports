require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const atsRoutes = require('./routes/atsRoutes');
const reportsRoutes = require('./routes/reportsRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5055;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', atsRoutes);
app.use('/api', reportsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use(errorHandler);

// Connect to DB and start server
connectDB().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ATS Backend running on port ${PORT}`);
  });
});
