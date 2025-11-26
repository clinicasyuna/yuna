const redis = require('redis');

let client;

const connectRedis = async () => {
  try {
    client = redis.createClient({
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD || undefined,
    });

    client.on('error', (err) => {
      console.error('Redis error:', err);
    });

    client.on('connect', () => {
      console.log('Connected to Redis');
    });

    await client.connect();
    return client;
  } catch (error) {
    console.error('Redis connection error:', error);
    return null;
  }
};

const getRedisClient = () => {
  return client;
};

module.exports = {
  connectRedis,
  getRedisClient,
};