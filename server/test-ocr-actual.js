const fs = require('fs');
const https = require('https');
const { extractText } = require('./services/ocrService');

// A sample prescription image from the web
const url = 'https://raw.githubusercontent.com/tesseract-ocr/tessdata/main/eng.traineddata'; 
// Wait, no. Let's just create a simple image with text using canvas? 
// No, I will use a publicly available sample medical receipt or just standard text.
// Better yet, I will create a base64 string of a simple image that has "Patient: Jane Doe. BP: 140/90. Risk: High"
const base64Image = "iVBORw0KGgoAAAANSUhEUgAAAQAAAAEAAQMAAABFq/NOAAAAA1BMVEUAAACnej3aAAAAAXRSTlMAQObYZgAAACNJREFUeNrtwTEBAAAAwiD7p7bGDmAAAAAAAAAAAAAAAAAAbwx2AAHoH0rZAAAAAElFTkSuQmCC"; 
// wait, this is just a blank image.

// I will write python to generate a test image!
