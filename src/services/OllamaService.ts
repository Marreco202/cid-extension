import ollama from 'ollama';
import * as vscode from 'vscode';
import dotenv from 'dotenv';
import * as path from 'path';
import { IModel } from '../interfaces/IModel';
import { IModelRequestData } from '../interfaces/IModelRequestData';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export class OllamaService implements IModel{

    private model_name : string;
    private model_type : string;
    private data : Partial<IModelRequestData>;


    constructor(data : Partial<IModelRequestData>, model ?: string) {
        this.model_name = process.env.OLLAMA_MODEL ?? model ?? 'i like coffee :)';
        this.model_type = "Ollama";
        this.data = data;
    }

    /**
     * 
     * @param prompt O prompt do usuário
     * @returns Um AsyncIterable contendo os pedaços da resposta
     */

    /**
     * Envia um prompt (e um prompt de sistema opcional) para o modelo Ollama e retorna a resposta completa.
     * @param prompt O prompt do usuário.
     * @returns Uma Promise que resolve para a string de conteúdo da resposta do assistente.
     */
    async generateResponse(prompt: string): Promise<string> {
        
        const messages = [];

        const sys_prompt = this.data.instructions;

        if(sys_prompt){
            messages.push({role: 'system', content: sys_prompt});
        }

        messages.push({role: 'user', content: prompt});

        try {
        const modelResponse = await ollama.chat({
            model: this.model_name,
            messages : messages,
            stream : false
        });
        
        return modelResponse.message.content;

        } catch (err) {
            console.error("Error connecting to Ollama: ",err);
            throw new Error("It wasn't possible to connect to Ollama. Verify if it's running properly");
        }
    }

    async streamChatResponse(prompt: string) {
    
        try {
            const streamResponse = await ollama.chat({
                model : this.model_name,
                messages : [{role: "user", content: prompt}],
                stream: true,
            });
            return streamResponse;
        } catch (err) {
            console.error("Error connecting to Ollama: ", err);
            throw new Error("It wasn't possible to connect to Ollama. Verify if it's running properly, or select model exists");
        }
    }

    setData(data: Partial<IModelRequestData>): void {
        this.data = data;
    }

    getModelName(): string { //TODO: change it for model type
        return this.model_type;
    }
}

