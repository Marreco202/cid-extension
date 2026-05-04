
//** CRIAR FACTORY DE PROVIDERS DE DIFERENTES MODELOS (e.g. GeminiProvider).
// */ Dentro de GeminiProvider, colocar o que está na extension.ts hardcoded para conseguir modularizar bem, e tirar responsabilidade da main

import * as vscode from 'vscode';
import { IModel } from '../interfaces/IModel';
import { IModelRequestData } from '../interfaces/IModelRequestData';
import { OllamaService } from '../services/OllamaService';
import {GPTService} from "../services/GPTService";

export class ModelProvider{
    //Factory method
    async factory (LLM_model : string, modelName : string, api_key? : string ,data?: IModelRequestData) : Promise<IModel> {

        if(LLM_model !== "Ollama" && !api_key) {
            vscode.window.showErrorMessage(`Missing API Key for ${LLM_model}`);
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