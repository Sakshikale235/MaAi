const axios = require('axios');
require('dotenv').config();

async function testVision() {
    const prompt = `Return exclusively a JSON object with this shape: {"result": "success"}`;
    // very small 1pixel red transparent base64 image
    const base64Img = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

    try {
        const response = await axios.post(
            'https://api.groq.com/openai/v1/chat/completions',
            {
                model: 'llama-3.2-90b-vision-preview',
                messages: [
                    {
                        role: 'user',
                        content: [
                            { type: "text", text: prompt },
                            { type: "image_url", image_url: { url: `data:image/png;base64,${base64Img}` } }
                        ]
                    }
                ],
                temperature: 0.1
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        console.log("Vision response:", response.data.choices[0].message.content);
    } catch (e) {
        console.error("Vision Error:", e.response ? e.response.data : e.message);
    }
}
testVision();
