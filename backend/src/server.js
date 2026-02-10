const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
require('dotenv').config();

const { initDb } = require('./database/db');
const authRoutes = require('./routes/auth.routes');
const radicacionRoutes = require('./routes/radicacionRoutes');

const app = express();
const PORT = process.env.PORT || 4000; // Standardize port

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Init DB on startup
initDb().catch(err => console.error('DB Init Error:', err));

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/radicar', radicacionRoutes);

// Health Check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
