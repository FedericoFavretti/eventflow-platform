const mongoose = require('mongoose');
const redis = require('redis');

class Database {
    constructor() {
        this.redisClient = null;
        this.mongoConnection = null;
    }

    // Conectar a Redis
    async connectRedis() {
        try {
            this.redisClient = redis.createClient({
                url: process.env.REDIS_URI || 'redis://localhost:6379'
            });

            this.redisClient.on('error', (err) => {
                console.error('Redis error:', err);
            });

            await this.redisClient.connect();
            console.log('Conectado a Redis');
            return this.redisClient;
        } catch (error) {
            console.error('Error conectando a Redis:', error);
            throw error;
        }
    }

    // Conectar a MongoDB
    async connectMongo() {
        try {
            const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/eventflow';
            this.mongoConnection = await mongoose.connect(mongoUri, {
                useNewUrlParser: true,
                useUnifiedTopology: true
            });
            console.log('Conectado a MongoDB');
            return this.mongoConnection;
        } catch (error) {
            console.error('Error conectando a MongoDB:', error);
            throw error;
        }
    }

    // Inicializar todas las conexiones
    async initialize() {
        await this.connectRedis();
        await this.connectMongo();
    }

    // Desconectar todas las conexiones
    async disconnect() {
        if (this.redisClient) {
            await this.redisClient.quit();
        }
        if (this.mongoConnection) {
            await mongoose.disconnect();
        }
    }
}

module.exports = new Database();