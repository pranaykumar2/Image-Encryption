const path = require('path');
const { exec } = require('child_process');
const fs = require('fs');
const nodemailer = require('nodemailer');

function encryptImage(imagePath, uploadsDir, callback) {
  const imageName = path.basename(imagePath, path.extname(imagePath));
  const encryptedImageName = `${imageName}_encrypted${path.extname(imagePath)}`;
  const encryptedImagePath = path.join(uploadsDir, encryptedImageName);
  const keyFileName = `${imageName}_key.txt`;
  const keyFilePath = path.join(uploadsDir, keyFileName);

  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const relativeImagePath = path.relative(uploadsDir, imagePath);

  const command = `cd ${uploadsDir} && imcrypt -e ${relativeImagePath} -i ${encryptedImageName} -p ${keyFileName}`;

  const encryptionProcess = exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing imcrypt: ${error.message}`);
      return callback(error);
    }

    if (stderr) {
      console.error(`stderr: ${stderr}`);
      return callback(new Error(stderr));
    }

    console.log(`stdout: ${stdout}`);
  });

  encryptionProcess.stdin.write('y\n');
}


module.exports = encryptImage;
