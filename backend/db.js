import mongoose from 'mongoose';
import Grid from 'gridfs-stream';

let gfs, gridfsBucket;

export const connectDB = async () => {
  try {
    // If already connected, do nothing
    if (mongoose.connection.readyState >= 1) return;

    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Init GridFS
    gridfsBucket = new mongoose.mongo.GridFSBucket(conn.connection.db, {
      bucketName: 'uploads'
    });
    
    gfs = Grid(conn.connection.db, mongoose.mongo);
    gfs.collection('uploads');

    return { gfs, gridfsBucket };
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export const getGridFS = () => ({ gfs, gridfsBucket });