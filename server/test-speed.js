const axios = require('axios');
async function test() {
    const start = Date.now();
    try {
        console.log("Sending query to Ollama Mistral...");
        const res = await axios.post('http://localhost:11434/api/generate', {
            model: 'mistral',
            prompt: 'Say exactly "hi"',
            stream: false
        }, { timeout: 300000 });
        console.log("Success! Time taken:", (Date.now() - start)/1000, "seconds");
        console.log("Response:", res.data.response);
    } catch(e) {
        console.error("Error:", e.message);
    }
}
test();
