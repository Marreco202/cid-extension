import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.GOOGLE_API_KEY; // set this in your environment

if (!API_KEY) {
  console.error("Missing GOOGLE_API_KEY environment variable");
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export async function testingGemini() {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      // many libs accept `input`, `prompt` or `contents` — log response for debugging
      contents: "Explain how AI works in a few words",
    });

    console.log("Full response:", JSON.stringify(response, null, 2));
    // If the library returns text in a different field, inspect the JSON above
    // console.log(response.text ?? response.outputText ?? response[0]?.content);
  } catch (err) {
    console.error("Gemini request failed:", err);
    process.exitCode = 1;
  }
}