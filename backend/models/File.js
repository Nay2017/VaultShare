import mongoose from 'mongoose';

const fileSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  originalName: { type: String, required: true },
  size: { type: Number, required: true },
  type: { type: String, required: true },
  fileId: { type: mongoose.Schema.Types.ObjectId, required: true },
  password: { type: String },
  downloads: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
});

// Automatic Deletion when time is up
fileSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('FileMetadata', fileSchema);