import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { connectDB } from './db.js';
import fileRoutes from './routes/files.js';

const app = express();

// Limit config (Adjusted for Vercel)
app.use(express.json({ limit: '4mb' }));
app.use(express.urlencoded({ extended: true, limit: '4mb' }));

app.use(cors({ origin: true, credentials: true }));

// SERVERLESS LOGIC: Check connection on every request
const connectToDB = async () => {
  // 0 = disconnected, 1 = connected, 2 = connecting
  if (mongoose.connection.readyState === 0) {
    await connectDB();
  }
};

// Middleware: Connect to DB before handling API routes
app.use(async (req, res, next) => {
  await connectToDB();
  next();
});

app.use('/api/files', fileRoutes);

// Vercel Health Check
app.get('/', (req, res) => {
  res.send('VaultShare Vercel API is Active');
});

// Export for Vercel
export default app;

// --- LOCAL DEVELOPMENT SETUP ---
// Only run this block if we are NOT on Vercel
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  
  // 1. FORCE DB CONNECTION IMMEDIATELY ON START
  connectDB().then(() => {
    // 2. START SERVER ONLY AFTER DB IS READY
    app.listen(PORT, () => console.log(`✅ LOCAL DEV SERVER RUNNING ON PORT: ${PORT}`));
  });
}