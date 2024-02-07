const express = require('express');
const multer = require('multer');
const fs = require('fs');
const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');
const path = require('path');

const app = express();

const upload = multer({ dest: 'uploads/' });
let bucket;

const dbConnection = mongoose.createConnection(
  process.env.DB_URI || 'mongodb://localhost'
);
dbConnection.once('open', () => {
  bucket = new GridFSBucket(mongoose.connection.db, {
    bucketName: 'uploads',
  });
  console.log('Connection to MongoDB opened');
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.get('/file/:filename', async (req, res) => {
  const filename = req.params.filename;
  console.log(`Requesting file ${filename}`);
  const cursor = bucket.find({ filename });
  const files = await cursor.toArray();
  if (!files || files.length === 0) {
    return res.status(404).json({
      err: 'No file found',
    });
  }
  const readStream = bucket.openDownloadStreamByName(filename);
  readStream.on('error', function (err) {
    res.status(500).send('An error occurred!');
  });
  readStream.pipe(res);
});

// Upload Route
app.post('/upload', upload.single('file'), (req, res) => {
  const filename = req.file.originalname;
  const stream = bucket.openUploadStream(filename, {
    metadata: { contentType: req.file.mimetype },
  });
  const readStream = fs.createReadStream(path.join(__dirname, req.file.path));
  readStream.pipe(stream);
  stream.on('error', (err) => {
    console.error(err);
    return res.status(500).send('Error uploading file');
  });
  stream.on('finish', () => {
    fs.unlink(path.join(__dirname, req.file.path), (err) => {
      if (err) return console.error(err);
      console.log('Temp file deleted');
    });
    res.redirect(`/file/${filename}`);
  });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));
