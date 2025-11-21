import express from 'express';
import multer from 'multer';
import { GridFsStorage } from 'multer-gridfs-storage';
import crypto from 'crypto';
import path from 'path';
import bcrypt from 'bcryptjs';
import { getGridFS } from '../db.js';
import FileMetadata from '../models/File.js';

const router = express.Router();

// Storage Engine
const storage = new GridFsStorage({
  url: process.env.MONGO_URI,
  file: (req, file) => {
    return new Promise((resolve) => {
      const filename = crypto.randomBytes(16).toString('hex') + path.extname(file.originalname);
      resolve({ filename, bucketName: 'uploads' });
    });
  }
});

// 16GB UPLOAD LIMIT CONFIGURATION
const upload = multer({ 
  storage,
  limits: { fileSize: 16 * 1024 * 1024 * 1024 } 
});

// 1. Upload
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'File missing or too large.' });

    const { password, expiryHours } = req.body;
    
    let hashedPassword = null;
    if (password) hashedPassword = await bcrypt.hash(password, 10);

    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + parseInt(expiryHours || 24));

    const fileData = new FileMetadata({
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      type: req.file.mimetype,
      fileId: req.file.id,
      password: hashedPassword,
      expiresAt: expiryDate
    });

    await fileData.save();
    res.status(201).json({ fileId: fileData._id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server Upload Error' });
  }
});

// 2. Metadata Info
router.get('/:id', async (req, res) => {
  try {
    const file = await FileMetadata.findById(req.params.id);
    if (!file) return res.status(404).json({ error: 'Expired' });
    res.json({
      name: file.originalName,
      size: file.size,
      createdAt: file.createdAt,
      expiresAt: file.expiresAt,
      hasPassword: !!file.password
    });
  } catch {
    res.status(404).json({ error: 'Link Invalid' });
  }
});

// 3. Secure Download
router.post('/download/:id', async (req, res) => {
  try {
    const file = await FileMetadata.findById(req.params.id);
    if (!file) return res.status(404).json({ error: 'Expired' });

    if (file.password) {
      if (!req.body.password) return res.status(401).json({ error: 'Password required' });
      if (!await bcrypt.compare(req.body.password, file.password)) return res.status(403).json({ error: 'Access Denied' });
    }

    file.downloads++;
    await file.save();

    const { gridfsBucket } = getGridFS();
    res.set({
      'Content-Type': file.type,
      'Content-Disposition': `attachment; filename="${file.originalName}"`,
      'Content-Length': file.size
    });

    const readStream = gridfsBucket.openDownloadStream(file.fileId);
    readStream.pipe(res);
  } catch {
    res.status(500).json({ error: 'Download Error' });
  }
});

export default router;