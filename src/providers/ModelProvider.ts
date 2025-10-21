
//** CRIAR FACTORY DE PROVIDERS DE DIFERENTES MODELOS (e.g. GeminiProvider).
// */ Dentro de GeminiProvider, colocar o que está na extension.ts hardcoded para conseguir modularizar bem, e tirar responsabilidade da main


import { IModel } from '../interfaces/IModel';
import { IModelRequestData } from '../interfaces/IModelRequestData';
import { OllamaService } from '../services/OllamaService';


export class ModelProvider{
    //Factory method
    async factory (LLM_model : string, data?: IModelRequestData) : Promise<IModel> {
        if(LLM_model === "Gemini"){
            const mod =  await import('../services/GeminiService.mjs');
            const modelName = "gemini-2.5-flash";
            const modelInstance = new mod.GeminiService(modelName,data);
            return modelInstance;
        }

        else if(LLM_model === "Ollama"){
            return new OllamaService(data);
        }
        
        throw new Error(`Unsupported model type: ${LLM_model}`);
        //Colocar Ollama aqui depois

    }
}