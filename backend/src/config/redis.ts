import Redis from 'ioredis';
import { config } from './index';

let redisClient: Redis | null = null;
let isRedisConnected = false;

// In Vercel serverless functions, avoid attempting localhost connection if no remote Redis host is given
const shouldAttemptRedis = Boolean(process.env.REDIS_HOST) || (!process.env.VERCEL && config.nodeEnv !== 'production');

if (shouldAttemptRedis) {
  try {
    redisClient = new Redis({
      host: config.redis.host,
      port: config.redis.port,
      password: config.redis.password,
      connectTimeout: 2000,
      retryStrategy: (times) => {
        if (times > 2) {
          return null; // Stop retrying to prevent connection delays
        }
        return Math.min(times * 1000, 2000);
      },
      lazyConnect: true,
    });

    redisClient
      .connect()
      .then(() => {
        isRedisConnected = true;
        console.log('✅ Connected to Redis cache service.');
      })
      .catch((err) => {
        console.warn('⚠️ Redis connection skipped:', err.message);
      });

    redisClient.on('connect', () => {
      isRedisConnected = true;
    });
    redisClient.on('close', () => {
      isRedisConnected = false;
    });
    redisClient.on('error', () => {
      // Suppress unhandled error crashes
    });
  } catch (e) {
    console.warn('⚠️ Redis initialization skipped, running in in-memory cache mode.');
  }
} else {
  console.log('ℹ️ Running cache in high-performance in-memory mode.');
}

// In-memory cache fallback store for high availability
const memoryStore = new Map<string, { value: string; expiry: number }>();

export const cacheService = {
  async get<T>(key: string): Promise<T | null> {
    try {
      if (isRedisConnected && redisClient) {
        const data = await redisClient.get(key);
        return data ? JSON.parse(data) : null;
      }
    } catch {
      // Fallback to memory
    }
    const mem = memoryStore.get(key);
    if (mem && mem.expiry > Date.now()) {
      return JSON.parse(mem.value);
    }
    memoryStore.delete(key);
    return null;
  },

  async set(key: string, data: any, ttlSeconds: number = 60): Promise<void> {
    const val = JSON.stringify(data);
    try {
      if (isRedisConnected && redisClient) {
        await redisClient.set(key, val, 'EX', ttlSeconds);
        return;
      }
    } catch {
      // ignore
    }
    memoryStore.set(key, { value: val, expiry: Date.now() + ttlSeconds * 1000 });
  },

  async invalidateByPattern(pattern: string): Promise<void> {
    try {
      if (isRedisConnected && redisClient) {
        const keys = await redisClient.keys(pattern);
        if (keys.length > 0) {
          await redisClient.del(...keys);
        }
      }
    } catch {
      // ignore
    }
    // Clean memory store
    const regex = new RegExp(pattern.replace('*', '.*'));
    for (const key of memoryStore.keys()) {
      if (regex.test(key)) {
        memoryStore.delete(key);
      }
    }
  },

  isHealthy(): boolean {
    return isRedisConnected;
  },
};
