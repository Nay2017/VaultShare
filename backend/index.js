import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { connectDB } from './db.js';
import fileRoutes from './routes/files.js';

const app = express();
const PORT = process.env.PORT || 5000;

// 1. Increase Payload Limit (Essential for large files if not streaming directly)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 2. CORS Config - Allow your Vercel Frontend to talk to this Backend
app.use(cors({ 
  origin: [
    'http://localhost:5173',              // Local Vite Dev
    'https://vaultshare-inc.vercel.app',  // Your Vercel Frontend
    // Add any other frontend URLs here
  ], 
  credentials: true 
}));

// 3. Routes
app.use('/api/files', fileRoutes);

app.get('/', (req, res) => {
  res.send('VaultShare Backend is Running');
});

// 4. Start Server (Updated for Render/Railway support)
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();