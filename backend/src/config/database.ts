import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { config } from './index';
import { User } from '../models/User';
import { seedDatabase } from '../database/seed';

let mongoMemoryServer: MongoMemoryServer | null = null;

export const connectDatabase = async (): Promise<void> => {
  try {
    console.log(`🔌 Attempting connection to MongoDB at: ${config.mongoUri}...`);
    await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 2500,
    });
    console.log('✅ Connected to external/local MongoDB successfully:', config.mongoUri);
    
    // Auto-seed if database is empty
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('ℹ️ No existing users found. Initializing seed data...');
      await seedDatabase(false);
    }
  } catch (error: any) {
    console.warn(`⚠️ Could not connect to local/external MongoDB (${error.message}).`);
    console.log('🚀 Starting embedded in-memory MongoDB server fallback...');
    
    try {
      mongoMemoryServer = await MongoMemoryServer.create({
        instance: {
          dbName: 'employee360',
        }
      });
      const memoryUri = mongoMemoryServer.getUri();
      console.log('✅ In-memory MongoDB server started successfully at:', memoryUri);
      
      await mongoose.connect(memoryUri);
      console.log('✅ Connected Mongoose to in-memory MongoDB.');
      
      console.log('🌱 Seeding embedded database with default accounts & records...');
      await seedDatabase(false);
      console.log('✨ Embedded database ready for immediate login!');
    } catch (memError) {
      console.error('❌ Failed to start in-memory MongoDB fallback:', memError);
    }
  }
};

