import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { config } from './index';
import { User } from '../models/User';
import { seedDatabase } from '../database/seed';

let mongoMemoryServer: MongoMemoryServer | null = null;

// Global cache for serverless environments (e.g., Vercel)
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose | null> | null;
}

let cached: MongooseCache = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export const connectDatabase = async (): Promise<typeof mongoose | null> => {
  // If already connected, reuse existing connection
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    const isProduction = process.env.NODE_ENV === 'production' || !!process.env.VERCEL;
    const timeoutMs = isProduction ? 8000 : 2500;
    
    // Mask password in logs to protect credentials
    const maskedUri = config.mongoUri.replace(/:([^:@]{3,})@/, ':****@');
    console.log(`🔌 Attempting connection to MongoDB at: ${maskedUri}...`);

    cached.promise = mongoose
      .connect(config.mongoUri, {
        serverSelectionTimeoutMS: timeoutMs,
      })
      .then(async (m) => {
        console.log('✅ Connected to MongoDB successfully.');

        // Auto-seed if database is empty
        try {
          const userCount = await User.countDocuments();
          if (userCount === 0) {
            console.log('ℹ️ No existing users found. Initializing seed data...');
            await seedDatabase(false);
          }
        } catch (seedErr: any) {
          console.warn('⚠️ Seeding check skipped:', seedErr.message);
        }

        return m;
      })
      .catch(async (error: any) => {
        cached.promise = null;

        // In production/Vercel, do NOT attempt in-memory server (not supported in serverless)
        if (isProduction) {
          console.error(`❌ MongoDB connection failed in production/Vercel (${error.message}).`);
          console.error('👉 Please verify your MONGODB_URI in Vercel Environment Variables and ensure MongoDB Atlas Network Access allows connections from 0.0.0.0/0.');
          throw error;
        }

        // Local development fallback
        console.warn(`⚠️ Could not connect to local/external MongoDB (${error.message}).`);
        console.log('🚀 Starting embedded in-memory MongoDB server fallback...');

        try {
          mongoMemoryServer = await MongoMemoryServer.create({
            instance: {
              dbName: 'employee360',
            },
          });
          const memoryUri = mongoMemoryServer.getUri();
          console.log('✅ In-memory MongoDB server started successfully at:', memoryUri);

          const m = await mongoose.connect(memoryUri);
          console.log('✅ Connected Mongoose to in-memory MongoDB.');

          console.log('🌱 Seeding embedded database with default accounts & records...');
          await seedDatabase(false);
          console.log('✨ Embedded database ready for immediate login!');
          return m;
        } catch (memError) {
          console.error('❌ Failed to start in-memory MongoDB fallback:', memError);
          return null;
        }
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null;
    throw err;
  }

  return cached.conn;
};
