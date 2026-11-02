import Redis from 'ioredis';
import { config } from './index';

let redisClient: Redis | null = null;
let isRedisConnected = false;

try {
  redisClient = new Redis({
    host: config.redis.host,
    port: config.redis.port,
    password: config.redis.password,
    retryStrategy: (times) => {
      if (times > 3) {
        console.warn('⚠️  Redis unreachable after 3 attempts. Caching running in memory fallback / passthrough mode.');
        return null; // Stop retrying to prevent console spam
      }
      return Math.min(times * 1000, 3000);
    },
    lazyConnect: true,
  });

  redisClient.connect().then(() => {
    isRedisConnected = true;
    console.log('✅ Connected to Redis cache service.');
  }).catch((err) => {
    console.warn('⚠️  Redis connection skipped:', err.message);
  });

  redisClient.on('connect', () => { isRedisConnected = true; });
  redisClient.on('close', () => { isRedisConnected = false; });
  redisClient.on('error', (err) => {
    // Suppress unhandled error crashes
  });
} catch (e) {
  console.warn('⚠️  Redis initialization warning, running without cache.');
}

// In-memory cache fallback store for high availability even without Redis
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
  }
};
