import app from '../backend/src/app';
import { connectDatabase } from '../backend/src/config/database';

export default async function handler(req: any, res: any) {
  try {
    await connectDatabase();
  } catch (error: any) {
    console.error('❌ Serverless Database connection error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to connect to MongoDB database. Please ensure MONGODB_URI is correctly configured in Vercel settings and MongoDB Atlas Network Access allows connections from 0.0.0.0/0.',
      error: 'DATABASE_CONNECTION_ERROR',
    });
  }

  return app(req, res);
}
