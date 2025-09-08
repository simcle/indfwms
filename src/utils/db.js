// src/utils/db.js
import'dotenv/config'
import mongoose from 'mongoose'

const MONGO_URI = process.env.MONGO_URI

export const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI)
    console.log('✅ MongoDB connected')
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message)
    process.exit(1)
  }
}