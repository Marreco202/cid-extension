import ollama from 'ollama';
import * as vscode from 'vscode';

const OLLAMA_MODEL = 'deepseek-coder:1.3b';

/**
 * 
 * @param prompt O prompt do usuário
 * @returns Um AsyncIterable contendo os pedaços da resposta
 */
export async function streamChatResponse(prompt: string) {

    try {
        const streamResponse = await ollama.chat({
            model : OLLAMA_MODEL,
            messages : [{role: "user", content: "prompt"}],
            stream: true,
        });
        return streamResponse;
    } catch (err) {
        console.error("Error connecting to Ollama: ", err);
        throw new Error("It wasn't possible to connect to Ollama. Verify if it's running properly.");
    }
}

/**
 * Envia um prompt (e um prompt de sistema opcional) para o modelo Ollama e retorna a resposta completa.
 * @param prompt O prompt do usuário.
 * @param sys_prompt Opcional. A instrução de sistema que guia o comportamento do modelo.
 * @returns Uma Promise que resolve para a string de conteúdo da resposta do assistente.
 */
export async function chatResponse(prompt: string, sys_prompt? : string ) {

    const messages = [];

    if(sys_prompt){
        messages.push({role: 'system', content: sys_prompt});
    }

    messages.push({role: 'user', content: prompt});

    try {
       const modelResponse = await ollama.chat({
        model: OLLAMA_MODEL,
        messages : messages,
        stream : false
       });
       
       return modelResponse.message.content;

    } catch (err) {
        console.error("Error connecting to Ollama: ",err);
        throw new Error("It wasn't possible to connect to Ollama. Verify if it's running properly");
    }

}


export async function explainSelectedCode() {
    const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return; // Nenhum editor aberto
        }

        const selectedCode = editor.document.getText(editor.selection);
        if (!selectedCode) {
            vscode.window.showInformationMessage('Por favor, selecione um trecho de código para explicar.');
            return;
        }

        // Exemplo de uso COM um prompt de sistema
        // const systemPrompt = "Você é um programador sênior especialista em explicar código de forma concisa. Responda em português.";
        const systemPrompt = "You are a senior programmer specialist in explaining code in a concise way. Respond in english. Use at most 300 words.";

        
        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "CID: Pensando...",
            cancellable: false
        }, async (progress) => {
        
            try {
                const explanation = await chatResponse(selectedCode, systemPrompt);

                // Mostra a resposta em uma nova janela de informação
                vscode.window.showInformationMessage(explanation, { modal: true });

            } catch (error: any) {
                vscode.window.showErrorMessage(error.message);
            }
        });
}