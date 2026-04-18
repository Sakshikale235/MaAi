import fs from 'fs';
import { createCanvas } from 'canvas';

const canvas = createCanvas(400, 200);
const ctx = canvas.getContext('2d');

ctx.fillStyle = 'white';
ctx.fillRect(0, 0, 400, 200);

ctx.fillStyle = 'black';
ctx.font = '24px Arial';
ctx.fillText('Patient Name: Sarah Smith', 20, 50);
ctx.fillText('Age: 29', 20, 90);
ctx.fillText('Blood Pressure: 150/95', 20, 130);
ctx.fillText('Symptoms: Severe Headache', 20, 170);

const buffer = canvas.toBuffer('image/png');
fs.writeFileSync('test-med.png', buffer);
console.log('Image generated.');
