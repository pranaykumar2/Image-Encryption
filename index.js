const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const encryptImage = require('./js/encrypt');
const decryptImage = require('./js/decrypt');

const app = express();
const PORT = process.env.PORT || 3000;

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage });

app.use(express.static(path.join(__dirname, 'public')));

app.post('/encrypt', upload.single('photo'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  const imagePath = req.file.path;
  const uploadsDir = path.join(__dirname, 'uploads');

  encryptImage(imagePath, uploadsDir, (err, encryptedImagePath, keyFilePath) => {
    if (err) {
      return res.status(500).send('Error encrypting image.');
    }

    res.send('Image encrypted successfully.');
  });
});

app.post('/decrypt', upload.fields([{ name: 'encrypted-photo' }, { name: 'key' }]), (req, res) => {
  if (!req.files['encrypted-photo'] || !req.files['key']) {
    return res.status(400).send('Both encrypted image and key file are required.');
  }

  const encryptedImagePath = req.files['encrypted-photo'][0].path;
  const keyFilePath = req.files['key'][0].path;
  const uploadsDir = path.join(__dirname, 'uploads');

  decryptImage(encryptedImagePath, keyFilePath, uploadsDir, (err, decryptedImagePath) => {
    if (err) {
      return res.status(500).send('Error decrypting image.');
    }

    const decryptedImage = fs.readFileSync(decryptedImagePath);
    console.log(decryptedImage);
    res.send('Image decrypted successfully.');
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
