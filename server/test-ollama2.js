const axios = require('axios');
async function run() {
    try {
        console.log("Calling Ollama (180s timeout)...");
        const start = Date.now();
        const res = await axios.post('http://localhost:11434/api/generate', {
            model: 'mistral',
            prompt: 'Test prompt. Reply with {"risk": "HIGH", "reason": "test"} strictly.',
            stream: false,
            format: 'json'
        }, { timeout: 180000 });
        console.log("Success in", (Date.now() - start)/1000, "s:", res.data.response);
    } catch (e) {
        console.error("Error:", e.message);
    }
}
run();
