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

const PORT = process.env.PORT || 3001; // Sincronizado con Dockerfile

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
app.use('/api/v1/configuracion', require('./routes/configuracion.routes'));
app.use('/api/v1/ai', require('./routes/ai.routes'));
app.use('/api/v1/notificaciones', require('./routes/notificaciones.routes'));
app.use('/api/v1/dms', require('./routes/dms.routes'));
app.use('/api/v1/audit', require('./routes/audit.routes'));
app.get('/api/v1/search', searchController.searchAll);
app.use('/api/v1/stats', require('./routes/stats.routes'));




const http = require('http');
const { Server } = require('socket.io');

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*', // Permitir conexiones desde cualquier origen en desarrollo/producción controlada
        methods: ['GET', 'POST', 'PATCH', 'DELETE']
    }
});

// Adjuntar io a la app para usarlo en controladores
app.set('io', io);

io.on('connection', (socket) => {
    logger.info(`Cliente conectado: ${socket.id}`);

    socket.on('join', (userId) => {
        socket.join(`user_${userId}`);
        logger.debug(`Usuario ${userId} se unió a su canal privado`);
    });

    socket.on('disconnect', () => {
        logger.info(`Cliente desconectado: ${socket.id}`);
    });
});

// Health Check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
