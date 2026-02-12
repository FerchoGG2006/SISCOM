const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
require('dotenv').config();

const { initDb } = require('./database/db');
const authRoutes = require('./routes/auth.routes');
const radicacionRoutes = require('./routes/radicacionRoutes');
const expedientesRoutes = require('./routes/expedientes.routes');
const reportesRoutes = require('./routes/reportes.routes');
const personasRoutes = require('./routes/personas.routes');
const dashboardRoutes = require('./routes/dashboard.routes');

const app = express();

const PORT = process.env.PORT || 4000; // Standardize port

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Servir archivos estáticos (PDFs generados)
app.use('/documentos', express.static(path.join(__dirname, '../uploads/documentos')));


// Init DB on startup
initDb().catch(err => console.error('DB Init Error:', err));

const searchController = require('./controllers/searchController');

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/radicar', radicacionRoutes);
app.use('/api/v1/expedientes', expedientesRoutes);
app.use('/api/v1/reportes', reportesRoutes);
app.use('/api/v1/personas', personasRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.get('/api/v1/search', searchController.searchAll);




// Health Check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
