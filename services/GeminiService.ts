import { GoogleGenerativeAI } from '@google/generative-ai';

// Uses EXPO_PUBLIC... normally, fallback applied for hackathon ease
const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || "AIzaSyA7ugrnjS7DZ4CRA5tL5JssUa6OKKeCNX4";

let genAI: any = null;
if (API_KEY) {
  genAI = new GoogleGenerativeAI(API_KEY);
}

export async function explainRiskWithAI(factors: any[], riskLevel: string, data: any): Promise<string | null> {
  if (!genAI) {
     return null; // Force offline fallback
  }

  console.log("\n=== GEMINI API: INITIATING REQUEST ===");
  const mappedFactors = factors.map(f => `${f.name} (${f.implication})`).join(" | ");

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `You are a maternal healthcare clinical assistant.

Patient vitals: ${JSON.stringify(data)}
Risk Level: ${riskLevel}
Trigger Factors: ${mappedFactors}

Write a single clear paragraph that includes:
- Clinical interpretation of abnormal values
- Possible condition (e.g., pre-eclampsia, anemia, infection)
- Risk implication for mother and baby
- Recommended action

Rules:
- Be specific and use actual values
- Do not repeat input blindly
- Do not use bullet points
- Keep it concise (3–4 sentences)
- Tone: professional, calm, and reassuring

Also provide Hindi translation below.

Format:
English: <paragraph>

Hindi: <paragraph>`;
    
    console.log("PROMPT BOUNDS Awaiting LLM...");

    // 5-second resilient timeout
    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000));
    
    const result = await Promise.race([
      model.generateContent(prompt),
      timeoutPromise
    ]) as any;
    
    const text = result.response.text();
    console.log("=== GEMINI API: SUCCESS ===");
    return text;

  } catch (err: any) {
    console.error("=== GEMINI API: FAILED ===");
    console.error("Reason:", err.message);
    return null; // Force offline engine payload smoothly without breaking UI
  }
}
