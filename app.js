const path = require('path');
const express = require('express');
const multer = require('multer');
const mongoose = require('mongoose');

const GridFsStorage = require('./lib/GridFsStorage');

const app = express();
const upload = multer();

mongoose.connect(process.env.DB_URI || 'mongodb://localhost');

mongoose.connection.on('connected', () => {
  console.log('Database connected');
});
mongoose.connection.on('disconnected', () => {
  console.warn('Database disconnected');
});
mongoose.connection.on('error', (err) => {
  console.error('Database error', err);
});

app.get('/', (_req, res) => {
  return res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/files/:filename', async (req, res) => {
  const { filename } = req.params;
  const gridFs = new GridFsStorage();
  let file;
  try {
    file = await gridFs.getFileDescriptor(filename);
  } catch (err) {
    return res.status(404).send(err.message);
  }
  try {
    const readStream = await gridFs.createReadStream(file._id);
    readStream.pipe(res);
  } catch (err) {
    return res.status(500).send(err.message);
  }
});

app.post('/upload', upload.single('file'), async (req, res) => {
  const { buffer, originalname, mimetype } = req.file;
  const gridFs = new GridFsStorage();
  try {
    const fileId = await gridFs.uploadFile(buffer, originalname, mimetype);
    return res.redirect(`/files/${originalname}?id=${fileId}`);
  } catch (err) {
    return res.status(500).send(err.message);
  }
});

app.delete('/files', async (_req, res) => {
  const gridFs = new GridFsStorage();
  try {
    const result = await gridFs.deleteAll();
    return res.status(200).send(result);
  } catch (err) {
    return res.status(500).send(err.message);
  }
});

app.delete('/files/:id', async (req, res) => {
  const gridFs = new GridFsStorage();
  try {
    const result = await gridFs.deleteFile(req.params.id);
    return res.status(200).send(result);
  } catch (err) {
    return res.status(500).send(err.message);
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));
