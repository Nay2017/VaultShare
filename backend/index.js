import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './db.js';
import fileRoutes from './routes/files.js';

const app = express();

// Max Payload Limit (for metadata headers)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use(cors({ origin: '*', credentials: true }));

connectDB();

app.use('/api/files', fileRoutes);

// --- HYBRID HOSTING: Serve Frontend ---
// This makes the backend act as the web server too
const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use(express.static(path.join(__dirname, 'public')));

// Any request not starting with /api goes to React
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => console.log(`SERVER RUNNING ON PORT ${PORT}`));

// --- CRITICAL 4 HOUR TIMEOUT (For 15GB uploads) ---
const TIMEOUT_MS = 4 * 60 * 60 * 1000; // 4 Hours
server.timeout = TIMEOUT_MS; 
server.keepAliveTimeout = TIMEOUT_MS;
server.headersTimeout = TIMEOUT_MS + 5000;