const { createClient } = require('redis');
require('dotenv').config();

const redisClient = createClient({
    url: process.env.REDIS_URL
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));
redisClient.on('connect', () => console.log('Redis conectado'));

const connectRedis = async () => {
    if (!redisClient.isOpen) {
        await redisClient.connect();
    }
};

module.exports = {
    redisClient,
    connectRedis
};
