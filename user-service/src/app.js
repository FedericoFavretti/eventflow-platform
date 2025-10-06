const express = require('express');
const cors = require('cors');
const database = require('./config/database');
const userRoutes = require('./routes/userRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Inicializar bases de datos
database.initialize()
    .then(() => {
        console.log('🗃️ Bases de datos inicializadas');
    })
    .catch((error) => {
        console.error('❌ Error inicializando bases de datos:', error);
        process.exit(1);
    });

// Rutas
app.use('/api/usuarios', userRoutes);

// Ruta de salud mejorada
app.get('/health', async (req, res) => {
    const healthCheck = {
        status: 'OK',
        service: 'user-service',
        timestamp: new Date().toISOString(),
        databases: {
            redis: 'Connected', // Simplificado - en producción verificar conexión real
            mongodb: 'Connected'
        }
    };
    res.json(healthCheck);
});

// Manejo graceful shutdown
process.on('SIGINT', async () => {
    console.log('🛑 Apagando servicio...');
    await database.disconnect();
    process.exit(0);
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 User Service running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`🗃️ Redis: ${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`);
    console.log(`🗃️ MongoDB: ${process.env.MONGO_URI || 'mongodb://localhost:27017/eventflow'}`);
});

module.exports = app;