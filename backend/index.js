import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { connectDB } from './db.js';
import fileRoutes from './routes/files.js';

const app = express();

// Vercel Limit
app.use(express.json({ limit: '4mb' }));
app.use(express.urlencoded({ extended: true, limit: '4mb' }));

app.use(cors({ origin: true, credentials: true }));

// Connect to DB per request (Serverless best practice)
const connectToDB = async () => {
  if (mongoose.connection.readyState === 0) {
    await connectDB();
  }
};
app.use(async (req, res, next) => {
  await connectToDB();
  next();
});

app.use('/api/files', fileRoutes);

// Vercel requires an exported function
export default app;

// Only listen if running locally on your computer
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`LOCAL DEV SERVER: ${PORT}`));
}