// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';

import { FunctionsTreeDataProvider } from './providers/FunctionsTreeDataProvider';
import {listWorkspaceFiles, explainCurrentFile,analyzePythonFiles} from './ExtractionFeatures'; //FIX: Change import to correct file name
import {ChatViewProvider} from './providers/ChatViewProvider';
import {MermaidViewProvider} from './providers/MermaidViewProvider';
import {chatResponse} from './services/OllamaService';


// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	  // REGISTRA A NOVA TREE VIEW
	const functionsProvider = new FunctionsTreeDataProvider();
	vscode.window.createTreeView('cid.functionsView', { // O ID DEVE SER O MESMO DO package.json
		treeDataProvider: functionsProvider
	});

	console.log('Congratulations, your extension "cid" is now active!');
	vscode.window.showInformationMessage('Hello World from CID!');

	// Instancia o nosso provedor da view de chat
	const chatProvider = new ChatViewProvider(context);
	const mermaidProvider = new MermaidViewProvider(context);

	// Registra o comando que simplesmente chama o método para mostrar a janela
	const chatCommand = vscode.commands.registerCommand('cid.helloWorld', () => {
		chatProvider.createOrShow();
	});
	
	const showMermaidCommand = vscode.commands.registerCommand('cid.renderMermaid', () => {
		mermaidProvider.showMermaidPreview();
	});

	const generateAndShowMermaidCommand = vscode.commands.registerCommand('cid.generateAndShowMermaid', () => {
		mermaidProvider.generateAndShowMermaidPreview();
	});
	
	context.subscriptions.push(
		vscode.commands.registerCommand('cid.listWorkspaceFiles', listWorkspaceFiles)
	);
	
	context.subscriptions.push(
		vscode.commands.registerCommand('cid.explainCurrentFile', explainCurrentFile)
	);
	
	context.subscriptions.push(
		vscode.commands.registerCommand('cid.analyzePythonFiles', analyzePythonFiles)
	);
	
	context.subscriptions.push(chatCommand);
	context.subscriptions.push(showMermaidCommand);
	context.subscriptions.push(generateAndShowMermaidCommand);


	context.subscriptions.push(
    vscode.commands.registerCommand('cid.explainSelectedCode', async () => {
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
        const systemPrompt = "You are a senior programmer specialist in explaining code in a concise way. Respond in english";

        
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
    })
);
}

// This method is called when your extension is deactivated
export function deactivate() {}
