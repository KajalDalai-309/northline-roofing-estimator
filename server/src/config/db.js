import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

export async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/northline_roofing';
  try {
    const conn = await mongoose.connect(uri);
    console.log(`[MongoDB] Connected successfully to: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error('[MongoDB] Connection error:', error.message);
    process.exit(1);
  }
}
