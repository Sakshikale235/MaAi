import { GoogleGenerativeAI } from '@google/generative-ai';

// Uses EXPO_PUBLIC... normally, fallback applied for hackathon ease
const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || "AIzaSyA7ugrnjS7DZ4CRA5tL5JssUa6OKKeCNX4";

let genAI: any = null;
if (API_KEY) {
  genAI = new GoogleGenerativeAI(API_KEY);
}

export async function explainRiskWithAI(factors: string[], riskLevel: string): Promise<string | null> {
  if (!genAI) {
     return null; // Force offline fallback smoothly
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `A rural maternal patient was assessed at ${riskLevel} risk. Trigger factors: ${factors.join(", ")}. Explain this maternal risk in 2 simple, friendly sentences for the patient. Provide it in English, followed by a Hindi translation. No extra formatting.`;

    // 5-second timeout mechanism simulating swift offline detection
    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000));
    
    const result = await Promise.race([
      model.generateContent(prompt),
      timeoutPromise
    ]) as any;
    
    return result.response.text();
  } catch (err) {
    console.warn("Gemini AI fetch failure (Offline/Error):", err);
    return null;
  }
}
