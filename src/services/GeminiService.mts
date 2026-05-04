import { GoogleGenAI } from "@google/genai";
import { IModel } from "../interfaces/IModel.js";
import { IModelRequestData } from "../interfaces/IModelRequestData.js";

export class GeminiService implements IModel {
  
  private model_name : string;
  private model_type : string;
  private data ?: Partial<IModelRequestData>;
  private api_key : string;
  private googleGenAI : any;
  private mod : any;

  constructor(model: string, api_key : string | undefined, data?: Partial<IModelRequestData>) {
    this.model_name = model;
    this.model_type = "Gemini";

    if(data) this.data = data; 
    
    if (!api_key) {
      throw new Error("Missing API Key for Gemini");
    }
    
    //Refactor this names. 3 different forms of saying "api keys". Confusing.
    this.googleGenAI = new GoogleGenAI({ apiKey: api_key });
    this.api_key = api_key;

  }

  private build_prompt() {
    const promptParts = [];
  
    if (this.data?.instructions) {
      promptParts.push(this.data?.instructions)
    }
    
    if (this.data?.file_tree) {
      promptParts.push("\n\n--- Project File Tree ---\n" + this.data?.file_tree);
    }
  
    if (this.data?.readme) {
      promptParts.push("\n\n--- README ---\n" + this.data?.readme);
    }
  
    if (this.data?.explanation){
      promptParts.push("\n\n--- Explanation ---\n" + this.data?.explanation);
    }
  
    if (this.data?.component_mapping){
      promptParts.push("\n\n--- Component Mapping ---\n" + this.data?.component_mapping);
    }

     if (this.data?.possiblyBrokenMermaid){
      promptParts.push("\n\n--- .mermaid file ---\n" + this.data?.possiblyBrokenMermaid);
    }
  
    // promptParts.push("\n\n--- User Request ---\n" + prompt);

    return promptParts.join('');
  }

  async generateResponse(prompt: string): Promise<string> { //TODO : needs to implement data!!!
    try {

      const finalPrompt = this.build_prompt() //Builds prompt 

      const response = await this.googleGenAI.models.generateContent({
        model: this.model_name,
        contents: finalPrompt,
        config: {
          systemInstruction : prompt
        }
      });

      // Extract the text content from the response
      const text = response.text ?? response.outputText ?? response.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
      console.log(text);
      return text;

    } catch (err) {
      console.error("Gemini request failed:", err);
      throw new Error(`Gemini API error: ${err}`);
    }
  }

  
  async testingGemini() {
    try {
      const response = await this.googleGenAI.models.generateContent({
        model: "gemini-2.5-pro",
        // many libs accept `input`, `prompt` or `contents` — log response for debugging
        contents: "Explain how AI works in a few words",
      });
      
      console.log("Full response:", JSON.stringify(response, null, 2));
      // If the library returns text in a different field, inspect the JSON above
      // console.log(response.text ?? response.outputText ?? response[0]?.content);
    } catch (err) {
      console.error("Gemini request failed:", err);
    }
  }


  async streamChatResponse(prompt: string) {

    try {
        const streamResponse = await this.googleGenAI.models.generateContentStream({
            model : this.model_name,
            contents : [{
              role : "user",
              parts : [{text : prompt}],
            },
          ],
            // contents : [{role: "user", content: prompt}],
        });
        return streamResponse;
    } catch (err) {
        console.error("Error connecting to Gemini: ", err);
        throw new Error("It wasn't possible to connect to Gemini");
    }
  }
  
  setData(data: Partial<IModelRequestData>): void {
    this.data = data;
  }
  
  getModelName(): string {
    return this.model_type;
  }
}