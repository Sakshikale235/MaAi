const { analyzeWithOllama } = require('./services/ollamaService');
const axios = require('axios');

async function test() {
    const prompt = `You are a clinical decision support system working offline. Analyze the patient data and return risk level, reasons, and recommendation.
        Return EXCLUSIVELY a JSON object with this exact structure, nothing else:
        {
          "risk": "HIGH" | "LOW" | "EMERGENCY" | "MEDIUM",
          "reason": "Short reason",
          "recommendation": "Short actionable recommendation",
          "patient_name": "Name extracted from data, or 'Unknown Patient'",
          "age": "Age in years from data, or null",
          "gestation_weeks": "Gestation weeks from data, or null",
          "confidence": "A percentage number from 0 to 100 representing your confidence in this analysis"
        }
        
        Patient OCR Data:
        """Name: Test Patient. Age 24. bp 120/80."""
        `;
    try {
        const response = await axios.post(
            'http://localhost:11434/api/generate',
            {
                model: 'mistral',
                prompt: prompt,
                stream: false,
                format: 'json'
            },
            {
                timeout: 180000 
            }
        );
        console.log("Raw output length:", response.data.response.length);
        console.log("Raw output preview:", response.data.response.substring(0, 100));
        console.log("Attempting to parse:", JSON.stringify(JSON.parse(response.data.response)));
    } catch (e) {
        console.log("Error parsing:", e.message);
    }
}
test();
