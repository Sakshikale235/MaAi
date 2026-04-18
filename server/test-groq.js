require('dotenv').config();
const { analyzeWithAI } = require('./services/aiService');

async function testGroq() {
    try {
        console.log("Testing Groq...");
        const result = await analyzeWithAI("Patient name is John Doe, complains of severe chest pain and breathlessness. Age 55.");
        console.log("Groq Result:", result);
    } catch (e) {
        console.error("Test Groq Error:", e.message);
    }
}
testGroq();
