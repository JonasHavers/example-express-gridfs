const mongoose = require('mongoose');
const { Readable } = require('stream');

const { GridFSBucket } = mongoose.mongo;
const { ObjectId } = mongoose.Types;

class GridFsStorage {
  constructor(bucketName = 'files') {
    this.bucketName = bucketName;
    const { db } = mongoose.connection;
    this.bucket = new GridFSBucket(db, {
      bucketName: this.bucketName,
    });
  }

  async uploadFile(buffer, filename, mimetype) {
    return new Promise((resolve, reject) => {
      const uploadStream = this.bucket.openUploadStream(filename, {
        metadata: { contentType: mimetype },
      });
      // eslint-disable-next-line new-cap
      const readStream = new Readable.from(buffer);
      readStream.pipe(uploadStream);
      uploadStream.on('error', reject);
      uploadStream.on('finish', () => resolve(uploadStream.id));
    });
  }

  async getFileDescriptor(filename) {
    return new Promise((resolve, reject) => {
      const findCursor = this.bucket.find({ filename });
      findCursor
        .toArray()
        .then((files) => {
          if (!files[0] || files.length === 0) {
            throw new Error('File not found');
          }
          return files[0];
        })
        .then(resolve)
        .catch(reject);
    });
  }

  async createReadStream(id) {
    return new Promise((resolve, reject) => {
      try {
        const readStream = this.bucket.openDownloadStream(id);
        readStream.on('error', reject);
        resolve(readStream);
      } catch (err) {
        reject(err);
      }
    });
  }

  async deleteFile(id) {
    this.bucket.delete(new ObjectId(id));
  }

  async deleteAll() {
    return this.bucket.drop();
  }
}

module.exports = GridFsStorage;
