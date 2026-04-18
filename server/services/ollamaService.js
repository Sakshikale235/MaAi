const axios = require('axios');

const analyzeWithOllama = async (text) => {
    try {
        const prompt = `You are a clinical decision support system working offline. Analyze the patient data and return risk level, reasons, and recommendation.
        Return EXCLUSIVELY a JSON object with this exact structure, nothing else:
        {
          "risk": "HIGH" | "LOW" | "EMERGENCY" | "MEDIUM",
          "reason": "Short reason",
          "recommendation": "Short actionable recommendation",
          "patient_name": "Name extracted from data, or 'Unknown'",
          "age": "Age in years from data, or null",
          "gestation_weeks": "Gestation weeks from data, or null",
          "confidence": "A percentage number from 0 to 100 representing your confidence"
        }
        
        IMPORTANT: The OCR data might contain severe typos, misspelled words, or garbage characters. Please do your absolute best to piece together any clinical symptoms, blood pressure, or medical terms. Guess missing letters if necessary.
        ONLY if the data is completely empty or mathematically impossible to read, set risk to "MEDIUM", reason to "Unreadable text", and recommendation to "Re-upload a clear document".
        
        Patient OCR Data:
        """${text}"""
        `;

        const response = await axios.post(
            'http://localhost:11434/api/generate',
            {
                model: 'mistral',
                prompt: prompt,
                stream: false,
                format: 'json'
            },
            {
                timeout: 600000 // 10 minutes timeout for slow local machines
            }
        );

        let rawOutput = response.data.response || '';
        console.log('Ollama raw output length:', rawOutput.length);
        
        let jsonStr = rawOutput.replace(/```json/g, '').replace(/```/g, '').trim();
        const start = jsonStr.indexOf('{');
        const end = jsonStr.lastIndexOf('}');
        if (start !== -1 && end !== -1) {
             jsonStr = jsonStr.substring(start, end + 1);
        } else {
             // Fallback if Mistral didn't return JSON structure
             return {
                 risk: "MEDIUM",
                 reason: "Ollama returned an invalid response format.",
                 recommendation: "Please try again or use the online service.",
                 confidence: 0
             };
        }
        return JSON.parse(jsonStr);
    } catch (error) {
        console.error('Ollama Service Error:', error.message);
        // Fallback to avoid crashing the frontend with an unhandled analysis
        return {
             risk: "HIGH",
             reason: "Offline AI took too long to analyze this complex data or failed.",
             recommendation: "Please try the online mode for faster results.",
             confidence: 0
        };
    }
};

module.exports = {
    analyzeWithOllama
};
