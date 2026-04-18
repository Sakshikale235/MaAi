const { extractText } = require('./services/ocrService');
const fs = require('fs');
const testImage = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64'); // 1x1 transparent png
fs.writeFileSync('test.png', testImage);

async function test() {
    try {
        console.log('Testing OCR offline...');
        const text = await extractText('test.png');
        console.log('Extracted text:', text);
    } catch (e) {
        console.error('Test failed:', e);
    }
}
test();
