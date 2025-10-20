import * as vscode from 'vscode';

// import {streamChatResponse} from '../services/OllamaService';
import {getChatWebViewContent} from '../webViews';
import { IModel } from '../interfaces/IModel';

export class ChatViewProvider {

    private _panel : vscode.WebviewPanel | undefined;
    private readonly _context : vscode.ExtensionContext;

    //Talvez colocar um private...?
    constructor(context: vscode.ExtensionContext){
        this._context = context;
    }

    //Singleton
    public createOrShow(model: IModel){
        if(this._panel){
            this._panel.reveal(vscode.ViewColumn.One);
            return;
        }
        
        // Instanciação do panel
        this._panel = vscode.window.createWebviewPanel(
            "cidChat",
            "CID Assistant Chat",
            vscode.ViewColumn.One,
            {enableScripts : true}
        );

        this._panel.webview.html = getChatWebViewContent();

        // Limpa a referência ao painel quando ele é fechado pelo usuário
        this._panel.onDidDispose(() => {
            this._panel = undefined;
        }, null, this._context.subscriptions);

        // Mensagens vindo da Webview
        this._panel.webview.onDidReceiveMessage(async (message: any) => {
            if(message.command === "chat") {
                const userPrompt = message.text;
                let fullResponse = "";

                try {
                    const streamResponse = await model.streamChatResponse(userPrompt); //TODO : Implementar esse cara no gemini tambem

                    //Retorna de forma cumulativa a response para a webview
                    if(model.getModelName() === "Ollama"){
                        for await (const part of streamResponse) {
                            fullResponse += part.message.content;
                            this._panel?.webview.postMessage({command: "chatResponse", text:fullResponse});
                        }

                    }
                    else if(model.getModelName() === "Gemini"){
                        for await (const part of streamResponse) {
                            console.log(part);
                            const chunkText = part.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
                            fullResponse += chunkText;
                            // Envia a resposta cumulativa de volta para a webview
                            this._panel?.webview.postMessage({ command: 'chatResponse', text: fullResponse });
                        }
                    }else{
                        throw new Error("Model not suportted: FIX BUG");
                    }

                } catch (err : any) {
                    vscode.window.showErrorMessage(err.message);
                    this._panel?.webview.postMessage({command: "chatResponse", text: `Error: ${err.message}`});
                }
            }
        }, undefined, this._context.subscriptions);
    }
}