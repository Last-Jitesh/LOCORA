import mongoose from 'mongoose';
import { env } from './env';

export const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    // Drop legacy index tokenHash_1 from previous session model to prevent E11000 duplicate key errors
    try {
      await mongoose.connection.collection('sessions').dropIndex('tokenHash_1');
    } catch {
      // Ignore if index doesn't exist
    }

    // Clean up old session records that do not contain a refreshToken
    try {
      await mongoose.connection.collection('sessions').deleteMany({ refreshToken: { $exists: false } });
    } catch {
      // Ignore if collection doesn't exist
    }
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};
