import { createClient } from 'redis';
import { logger } from '../utils/logger.js';

let redisClient;

export const initRedis = async () => {
  try {
    redisClient = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
    });

    redisClient.on('error', (err) => {
      logger.error(`Redis Error: ${err}`);
    });

    redisClient.on('connect', () => {
      logger.info('Redis connected');
    });

    redisClient.on('reconnecting', () => {
      logger.warn('Redis reconnecting');
    });

    await redisClient.connect();
    
    return redisClient;
  } catch (error) {
    logger.error(`Redis connection error: ${error.message}`);
    // Don't exit process, as Redis is optional for core functionality
  }
};

export const getRedisClient = () => {
  if (!redisClient) {
    throw new Error('Redis client not initialized');
  }
  return redisClient;
};

// Cache middleware
export const cacheMiddleware = (duration) => {
  return async (req, res, next) => {
    if (!redisClient || !redisClient.isReady) {
      return next();
    }

    const key = `__express__${req.originalUrl || req.url}`;

    try {
      const cachedResponse = await redisClient.get(key);
      
      if (cachedResponse) {
        const parsedResponse = JSON.parse(cachedResponse);
        return res.json(parsedResponse);
      }

      // Store the original send function
      const originalSend = res.send;
      
      // Override the send function
      res.send = function(body) {
        if (res.statusCode === 200) {
          redisClient.set(key, body, {
            EX: duration,
          }).catch(err => logger.error(`Redis cache error: ${err}`));
        }
        
        // Call the original send function
        originalSend.call(this, body);
      };
      
      next();
    } catch (error) {
      logger.error(`Cache middleware error: ${error.message}`);
      next();
    }
  };
};

// Clear cache by pattern
export const clearCache = async (pattern) => {
  if (!redisClient || !redisClient.isReady) {
    return;
  }
  
  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
      logger.info(`Cleared cache for pattern: ${pattern}`);
    }
  } catch (error) {
    logger.error(`Error clearing cache: ${error.message}`);
  }
};