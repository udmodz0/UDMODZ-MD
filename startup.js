const fs = require('fs');
const https = require('https');
const AdmZip = require('adm-zip');
const { exec } = require('child_process');
const path = require('path');
const passkey = 'aHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL3VkbW9kejAvZGF0YWJhc2VzL21haW4vbXVsdGlkZXZpY2Uuemlw';
const zipPath = path.join(__dirname, 'udmodz.zip');
const extractPath = __dirname;
function downloadZip(url, dest, callback) {
       console.log('Decrypting Files 👻 ...');
  const file = fs.createWriteStream(dest);
  https.get(url, (response) => {
    if (response.statusCode !== 200) {
      fs.unlink(dest, () => {}); 
      return callback(new Error(`📍 Failed to get Files ❌(${response.statusCode})`));
    }
    response.pipe(file);
    file.on('finish', () => {
      file.close(callback);
    });
    file.on('error', (err) => {
      fs.unlink(dest, () => callback(err));
    });
  }).on('error', (err) => {
    fs.unlink(dest, () => callback(err));
  });
}
const apidec = Buffer.from(passkey, 'base64').toString('utf-8');
function extractZip(zipFilePath, extractTo, callback) {
    console.log('Extracting Files 👻 ...');
  try {
    const zip = new AdmZip(zipFilePath);
    zip.extractAllTo(extractTo, true);
    callback(null);
  } catch (err) {
    callback(err);
  }
}
function startWithPM2(scriptPath, callback) {
  exec(`pm2 start ${scriptPath} --deep-monitoring --attach --name UDMODZ`);
  exec(`pm2 logs UDMODZ`);
}
downloadZip(apidec, zipPath, (err) => {
  if (err) {
    return console.error('Error downloading files ❌:', err);
  }
  console.log('Files downloaded successfully. ✅');
  extractZip(zipPath, extractPath, (err) => {
    if (err) {
      return console.error('Error extracting files ❌:', err);
    }
    console.log('Files extracted successfully. 😇');
    fs.unlink(zipPath, (err) => {
      if (err) console.warn('Failed to delete source file ❌:', err);
      else console.log('Source file deleted after extraction.✅');
    });
    startWithPM2(path.join(extractPath, 'udmodz.js'), (err) => {
      if (err) {
          console.error('Starting bot with pm2👻 ... ');
        return console.error('Error starting app with PM2 ❌:', err);
      }
      console.log('App started successfully with PM2. ✅');
    });
  });
});