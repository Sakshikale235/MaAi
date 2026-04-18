const Tesseract = require('tesseract.js');

const extractText = async (imageBuffer) => {
    try {
        const worker = await Tesseract.createWorker('eng', 1, {
            langPath: require('path').join(__dirname, '..'), // points to where eng.traineddata is
            gzip: false
        });
        
        const result = await worker.recognize(imageBuffer);
        await worker.terminate();

        const text = result.data.text;
        
        // Clean and parse the text slightly
        const cleanedText = text
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .join(' ');
            
        return cleanedText;
    } catch (error) {
        console.error('OCR Error:', error);
        throw new Error('Failed to perform OCR on the image');
    }
};

module.exports = {
    extractText
};
