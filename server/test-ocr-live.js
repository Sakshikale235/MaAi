const { extractText } = require('./services/ocrService');
const fs = require('fs');
const https = require('https');

const fileUrl = 'https://tesseract.projectnaptha.com/img/eng_bw.png';
const filePath = 'test-download.png';

const file = fs.createWriteStream(filePath);
https.get(fileUrl, function(response) {
  response.pipe(file);
  file.on('finish', async function() {
    file.close();
    console.log('Downloaded test image');
    try {
        const text = await extractText(filePath);
        console.log('--- OCR OUTPUT ---');
        console.log(text);
        console.log('------------------');
    } catch (e) {
        console.error('OCR Error:', e);
    }
  });
});
