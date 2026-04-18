import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = "AIzaSyCkHCgCNfgZ0DyKx-Y_W8aC7gBkBO78ezc";
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export const getTextFromAudio = async (audioBase64: string): Promise<string> => {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-pro",
    });

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: "audio/wav",
          data: audioBase64,
        },
      },
      "Convert this audio into plain text only. No explanation.",
    ]);

    return result.response.text();
  } catch (error) {
    console.error("Gemini Error:", error);
    throw error;
  }
};
