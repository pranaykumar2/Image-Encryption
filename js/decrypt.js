const path = require('path');
const { exec } = require('child_process');
const fs = require('fs');

function decryptImage(encryptedImagePath, keyFilePath, uploadsDir, callback) {
  const imageName = path.basename(encryptedImagePath, path.extname(encryptedImagePath));
  const decryptedImageName = `${imageName}_decrypted${path.extname(encryptedImagePath)}`;
  const decryptedImagePath = path.join(uploadsDir, decryptedImageName);

  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const relativeEncryptedImagePath = path.relative(uploadsDir, encryptedImagePath);
  const relativeKeyFilePath = path.relative(uploadsDir, keyFilePath);

  const command = `cd ${uploadsDir} && imcrypt -d ${relativeEncryptedImagePath} -k ${relativeKeyFilePath} -i ${decryptedImageName}`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing imcrypt: ${error.message}`);
      return callback(error);
    }

    if (stderr) {
      console.error(`stderr: ${stderr}`);
      return callback(new Error(stderr));
    }

    console.log(`stdout: ${stdout}`);

    if (fs.existsSync(decryptedImagePath)) {
      callback(null, decryptedImagePath);
    } else {
      callback(new Error('Decrypted image file does not exist.'));
    }
  });
}

module.exports = decryptImage;
