const fs = require('fs');
const pdfImgConvert = require('pdf-img-convert');

async function testPdfImg() {
    try {
        console.log("pdf-img-convert imported safely");
    } catch(e) {
        console.error(e);
    }
}
testPdfImg();
