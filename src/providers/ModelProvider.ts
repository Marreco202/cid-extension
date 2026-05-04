
//** CRIAR FACTORY DE PROVIDERS DE DIFERENTES MODELOS (e.g. GeminiProvider).
// */ Dentro de GeminiProvider, colocar o que está na extension.ts hardcoded para conseguir modularizar bem, e tirar responsabilidade da main

import * as vscode from 'vscode'; // <-- 1. Adicione este import
import { IModel } from '../interfaces/IModel';
import { IModelRequestData } from '../interfaces/IModelRequestData';
import { OllamaService } from '../services/OllamaService';
import {GPTService} from "../services/GPTService";

export class ModelProvider{
    //Factory method
    async factory (LLM_model : string, modelName : string, context: vscode.ExtensionContext, data?: IModelRequestData) : Promise<IModel> {

        let api_key : string | undefined;
        
        api_key = await context.secrets.get('model_api_key');

        if(LLM_model !== "Ollama" && !api_key) {
            throw new Error(`Missing API Key for ${LLM_model}`);
        }

        if(LLM_model === "Gemini"){
            const mod =  await import('../services/GeminiService.mjs');
            const modelInstance = new mod.GeminiService(modelName,api_key,data);
            return modelInstance;
        }

        else if(LLM_model === "Ollama"){
            return new OllamaService(modelName,data);
        }

        else if(LLM_model === "GPT") {
            return new GPTService(modelName,api_key,data);
        }
        
        throw new Error(`Unsupported model type: ${LLM_model}`);

    }
}