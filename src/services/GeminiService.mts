import { GoogleGenAI } from "@google/genai";
import { IModel } from "../interfaces/IModel.js";
import { IModelRequestData } from "../interfaces/IModelRequestData.js";

export class GeminiService implements IModel {
  
  private model : string
  private data : Partial<IModelRequestData>;
  private API_KEY : string;
  private googleGenAI : any;
  private mod : any;

  constructor(model: string, data: Partial<IModelRequestData>) {
    this.model = model;
    this.data = data; 

    const API_KEY = process.env.GOOGLE_API_KEY; // set this in your environment
    
    if (!API_KEY) {
      console.error("Missing GOOGLE_API_KEY environment variable");
      process.exit(1); //TODO : revisar isso. Verificar se não pode gerar crashes inesperados
    }
    
    this.googleGenAI = new GoogleGenAI({ apiKey: API_KEY });
    this.API_KEY = API_KEY;

  }

  async generateResponse(prompt: string): Promise<string> {
    try {
      const response = await this.googleGenAI.models.generateContent({
        model: this.model,
        contents: prompt,
      });

      // Extract the text content from the response
      const text = response.text ?? response.outputText ?? response.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
      //console.log(text);
      return text;

    } catch (err) {
      console.error("Gemini request failed:", err);
      throw new Error(`Gemini API error: ${err}`);
    }
  }

  
  async testingGemini() {
    try {
      const response = await this.googleGenAI.models.generateContent({
        model: "gemini-2.5-flash",
        // many libs accept `input`, `prompt` or `contents` — log response for debugging
        contents: "Explain how AI works in a few words",
      });
      
      console.log("Full response:", JSON.stringify(response, null, 2));
      // If the library returns text in a different field, inspect the JSON above
      // console.log(response.text ?? response.outputText ?? response[0]?.content);
    } catch (err) {
      console.error("Gemini request failed:", err);
      process.exitCode = 1; //TODO : verificar consequencias
    }
  }
  
  setData(data: Partial<IModelRequestData>): void {
    this.data = data;
  }
  
}