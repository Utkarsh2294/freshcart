import Redis from 'ioredis';
import { config } from './index.js';

export const redisClient = new Redis(config.REDIS_URL || 'redis://localhost:6379');

redisClient.on('error', (err) => {
  console.error('Redis Client Error', err);
});
