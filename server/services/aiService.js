const axios = require('axios');

const analyzeWithAI = async (text) => {
    try {
        const prompt = `You are a clinical decision support system. Analyze the given patient OCR data and return risk level, reasons, and recommendation in short and clear format.
        Return EXCLUSIVELY a json object with this exact structure, nothing else:
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
        ONLY if the data is completely empty or mathematically impossible to read, set risk to "MEDIUM", reason to "Unreadable or missing medical data", and recommendation to "Please re-upload a clearer document".
        
        Patient OCR Data:
        """${text}"""
        `;

        const response = await axios.post(
            'https://api.groq.com/openai/v1/chat/completions',
            {
                model: 'llama-3.3-70b-versatile',
                messages: [
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.1,
                response_format: { type: "json_object" }
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const aiResponseContent = response.data.choices[0].message.content;
        return JSON.parse(aiResponseContent);
    } catch (error) {
        console.error('AI Service Error:', error.response ? error.response.data : error.message);
        throw new Error('Failed to analyze data with AI');
    }
};

module.exports = {
    analyzeWithAI
};
