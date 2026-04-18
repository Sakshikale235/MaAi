const multer = require('multer');
const { extractText } = require('../services/ocrService');
const { analyzeWithAI } = require('../services/aiService');
const { analyzeWithOllama } = require('../services/ollamaService');
const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');

const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
        cb(null, 'upload-' + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ 
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only images and PDFs are allowed'));
        }
    }
});

const analyzeDocument = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image file uploaded' });
        }

        console.log('File received, saved to:', req.file.path);
        
        try {
            let extractedText = '';
            if (req.file.mimetype === 'application/pdf') {
                const dataBuffer = fs.readFileSync(req.file.path);
                const data = await pdfParse(dataBuffer);
                extractedText = data.text;
                console.log('PDF Text Extract Length:', extractedText.length);
                
                if (extractedText.trim().length < 20) {
                    console.log('PDF appears scanned or empty. Rejecting...');
                    fs.unlinkSync(req.file.path);
                    return res.status(400).json({ error: 'This PDF appears to be a scanned image without text. Please upload the document as a standard Image (JPG/PNG) instead so our OCR engine can process it.' });
                }
            } else {
                extractedText = await extractText(req.file.path);
                console.log('OCR Extraction complete. Length:', extractedText.length);
            }
            
            // Clean up file
            fs.unlinkSync(req.file.path);
        
        if (!extractedText || extractedText.trim().length === 0) {
            return res.status(400).json({ error: 'Could not extract text from the image' });
        }

            const forceOffline = req.body.offline === 'true' || req.query.offline === 'true';
            let aiAnalysis;

            if (forceOffline) {
                console.log('Forced Offline mode, skipping online AI...');
                aiAnalysis = await analyzeWithOllama(extractedText);
                aiAnalysis.source = 'offline';
                console.log('AI Analysis complete (Offline - Ollama).');
            } else {
                console.log('Sending text to online AI (Groq)...');
                try {
                    aiAnalysis = await analyzeWithAI(extractedText);
                    aiAnalysis.source = 'online';
                    console.log('AI Analysis complete (Online).');
                } catch (aiErr) {
                    console.log('Online AI failed, falling back to local Ollama...', aiErr.message);
                    aiAnalysis = await analyzeWithOllama(extractedText);
                    aiAnalysis.source = 'offline';
                    console.log('AI Analysis complete (Offline - Ollama).');
                }
            }

            res.json(aiAnalysis);
        } catch (ocrErr) {
             // Clean up file if OCR fails
             if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
             throw ocrErr;
        }
    } catch (error) {
        console.error('Error in analyzeDocument:', error);
        next(error);
    }
};

const analyzeTextDirectly = async (req, res, next) => {
    try {
        const { text, offline } = req.body;
        if (!text) {
            return res.status(400).json({ error: 'No text provided for analysis' });
        }

        const forceOffline = offline === true || offline === 'true';
        let aiAnalysis;

        if (forceOffline) {
            console.log('Forced Offline mode (text), skipping online AI...');
            aiAnalysis = await analyzeWithOllama(text);
            aiAnalysis.source = 'offline';
            console.log('AI Analysis complete (Offline - Ollama).');
        } else {
            console.log('Sending text to online AI (Groq)...');
            try {
                aiAnalysis = await analyzeWithAI(text);
                aiAnalysis.source = 'online';
                console.log('AI Analysis complete (Online).');
            } catch (aiErr) {
                console.log('Online AI failed, falling back to local Ollama...', aiErr.message);
                aiAnalysis = await analyzeWithOllama(text);
                aiAnalysis.source = 'offline';
                console.log('AI Analysis complete (Offline - Ollama).');
            }
        }

        res.json(aiAnalysis);
    } catch (error) {
        console.error('Error in analyzeTextDirectly:', error);
        next(error);
    }
};

module.exports = {
    upload,
    analyzeDocument,
    analyzeTextDirectly
};
