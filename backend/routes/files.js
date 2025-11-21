import express from 'express';
import multer from 'multer';
import { GridFsStorage } from 'multer-gridfs-storage';
import crypto from 'crypto';
import path from 'path';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { getGridFS } from '../db.js'; 

const router = express.Router();

// --- STORAGE ENGINE ---
const storage = new GridFsStorage({
  url: process.env.MONGO_URI,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) return reject(err);
        
        const filename = buf.toString('hex') + path.extname(file.originalname);
        
        // Create metadata object
        const fileInfo = {
          filename: filename,
          bucketName: 'uploads',
          metadata: {
             originalname: file.originalname,
             hasPassword: !!req.body.password,
             expiry: Date.now() + (parseInt(req.body.expiryHours || 24) * 60 * 60 * 1000)
          }
        };
        resolve(fileInfo);
      });
    });
  }
});

const upload = multer({ storage });

// --- UPLOAD ROUTE ---
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ msg: 'No file uploaded' });

    // Handle Password Hashing
    if (req.body.password) {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(req.body.password, salt);
        
        // USE NATIVE MONGOOSE CONNECTION TO UPDATE
        await mongoose.connection.db.collection('uploads.files').updateOne(
            { _id: req.file.id },
            { $set: { "metadata.password": hash } }
        );
    }

    res.json({ fileId: req.file.id });
  } catch (err) {
    console.error("Upload Error:", err);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// --- GET METADATA ROUTE ---
router.get('/:id', async (req, res) => {
    try {
        // Validate ID
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(404).json({ err: 'Invalid ID format' });
        }

        const _id = new mongoose.Types.ObjectId(req.params.id);

        // USE NATIVE MONGOOSE CONNECTION TO FIND
        // Note: GridFS stores files in 'uploads.files' collection because bucketName is 'uploads'
        const file = await mongoose.connection.db.collection('uploads.files').findOne({ _id });

        if (!file) {
            console.log("File not found in DB for ID:", req.params.id);
            return res.status(404).json({ err: 'File not found' });
        }

        // Check Expiry
        if (file.metadata && file.metadata.expiry < Date.now()) {
            return res.status(410).json({ err: 'Link Expired' });
        }

        res.json({
            name: file.metadata.originalname || file.filename,
            size: file.length,
            createdAt: file.uploadDate,
            hasPassword: !!file.metadata.password
        });
    } catch (err) {
        console.error("Get Metadata Error:", err);
        res.status(500).json({ err: 'Server Error' });
    }
});

// --- DOWNLOAD ROUTE ---
router.post('/download/:id', async (req, res) => {
    try {
        // We still need gridfsBucket for the stream
        const { gridfsBucket } = getGridFS();
        
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(404).json({ err: 'Invalid ID' });
        }

        const _id = new mongoose.Types.ObjectId(req.params.id);
        
        // 1. Get File Metadata manually first
        const file = await mongoose.connection.db.collection('uploads.files').findOne({ _id });

        if (!file) return res.status(404).json({ err: 'No file exists' });

        // 2. Check Expiry
        if (file.metadata && file.metadata.expiry < Date.now()) {
            return res.status(410).json({ err: 'Link Expired' });
        }

        // 3. Verify Password
        if (file.metadata && file.metadata.password) {
            if (!req.body.password) return res.status(401).json({ err: 'Password required' });
            
            const isMatch = await bcrypt.compare(req.body.password, file.metadata.password);
            if (!isMatch) return res.status(403).json({ err: 'Incorrect Password' });
        }

        // 4. Stream Response
        res.set({
            'Content-Type': file.contentType || 'application/octet-stream',
            'Content-Disposition': `attachment; filename="${file.metadata.originalname}"`,
            'Content-Length': file.length
        });

        const readStream = gridfsBucket.openDownloadStream(_id);
        readStream.pipe(res);

    } catch (err) {
        console.error("Download Error:", err);
        res.status(500).json({ err: 'Server Error' });
    }
});

export default router;