import Redis from 'ioredis';

export const redis = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: Number(process.env.REDIS_PORT) || 6379,
    lazyConnect: true,
    enableOfflineQueue: false, // fail fast instead of queuing indefinitely
});

redis.on('error', (err) => {
    console.warn('Redis error (cache disabled):', err.message);
});
