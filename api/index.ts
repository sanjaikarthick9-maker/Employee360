import app from '../backend/src/app';
import { connectDatabase } from '../backend/src/config/database';

export default async function handler(req: any, res: any) {
  try {
    await connectDatabase();
  } catch (error: any) {
    console.error('❌ Serverless Database connection error:', error.message);
    const hasUri = Boolean(process.env.MONGODB_URI);
    return res.status(500).json({
      success: false,
      message: hasUri 
        ? `Database connection error: ${error.message}. Please check MongoDB Atlas Network Access (0.0.0.0/0) and credentials.`
        : 'MONGODB_URI environment variable is missing in Vercel settings! Please add MONGODB_URI in Vercel Project Settings > Environment Variables.',
      error: error.message || 'DATABASE_CONNECTION_ERROR',
      debug: {
        hasMongoUri: hasUri,
        nodeEnv: process.env.NODE_ENV,
        errorDetail: error.message,
      }
    });
  }

  return app(req, res);
}
