import * as vscode from 'vscode';
import { ApiService } from "../services/ApiService";


export class ApiProvider {

    private _context : vscode.ExtensionContext;

    private ApiConfigs : Record<string, ApiService | undefined> = {
        "Gemini" : undefined,
        "GPT" : undefined
    };

    constructor (context : vscode.ExtensionContext) {
        this._context = context;
    }

    //In this way, we can have multiple API keys saved by model
    public setSecret(model_type : string){
        const buf_api_config = new ApiService(model_type,this._context);
        buf_api_config.askSecret();
        this.ApiConfigs[model_type] = buf_api_config; //Only sets the object when the secret is sucessfully attributed
    }

    public async clearSecret(model_type : string){
        // Cria uma instância temporária se ela não estiver na memória, só para poder deletar o segredo armazenado
        const apiService = this.ApiConfigs[model_type] || new ApiService(model_type, this._context);
        await apiService.deleteSecret();
        
        this.ApiConfigs[model_type] = undefined; 
    }

    public async clearAllSecrets() {
        const models = Object.keys(this.ApiConfigs); // Get "Gemini", "GPT", etc.
        
        for (const model of models) {
            await this.clearSecret(model);
        }
        
        vscode.window.showInformationMessage('All API Keys have been successfully cleared from storage.');
    }

    public async getSecret(model_type : string){
        if (this.ApiConfigs[model_type]) {
            return await this.ApiConfigs[model_type]?.getSecret();
        }
        else if (model_type === "Gemini" || model_type === "GPT") {
             // Fallback instantiation to dynamically fetch existing keys from vscode secrets
             const buf_api_config = new ApiService(model_type, this._context);
             this.ApiConfigs[model_type] = buf_api_config;
             return await buf_api_config.getSecret();
        }
        return undefined;
    }
}