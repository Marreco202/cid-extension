// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

import { FunctionsTreeDataProvider } from './providers/FunctionsTreeDataProvider';
import { explainCurrentFile,analyzePythonFiles} from './ExtractionFeatures'; //FIX: Change import to correct file name
import {RepoDataProvider} from './providers/RepoDataProvider';
import {ChatViewProvider} from './providers/ChatViewProvider';
import {MermaidViewProvider} from './providers/MermaidViewProvider';
import {explainSelectedCode} from './services/OllamaService';

import { ModelProvider } from './providers/ModelProvider';

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
	const repoProvider = new RepoDataProvider();
	const modelProvider = new ModelProvider();

	//Repository Data
	const repoData  = {
				file_tree : "lalala", //TODO : trocar para chamada da função que pega o file_tree do projeto. Fazer com que seja um singleton. (caso ja tenha extraido tudo, nao precisa rodar dnv)
				readme : "CID!" //TODO : criar e colocar a chamada da função que coloca o readme do projeto aqui como contexto (tambem fazer singleton)
			};

	const selectedModel = "Gemini";

	// Registra o comando que simplesmente chama o método para mostrar a janela
	const chatCommand = vscode.commands.registerCommand('cid.helloWorld', () => {
		chatProvider.createOrShow();
	});
	
	const showMermaidCommand = vscode.commands.registerCommand('cid.renderMermaid', () => {
		mermaidProvider.showMermaidPreview();
	});

	const generateAndShowMermaidCommandMOCK = vscode.commands.registerCommand('cid.generateAndShowMermaidMOCK', () => {
		mermaidProvider.generateAndShowMermaidPreviewMOCK();
	});

	const generateAndShowMermaidCommand = vscode.commands.registerCommand('cid.generateAndShowMermaid', () => {
		mermaidProvider.generateAndShowMermaidPreview();
	});
	
	const testingGeminiCommand = vscode.commands.registerCommand('cid.testingGemini', async () => {
		try {

			const model_instance = await new ModelProvider().factory("Gemini",repoData);
			model_instance.generateResponse("What is the meaning of life? Use 50 words max");

		} catch (err) {
			console.error('Failed to load/run Gemini test:', err);
			vscode.window.showErrorMessage('Failed to run Gemini test. See console for details.');
		}
	});

	context.subscriptions.push(
		vscode.commands.registerCommand('cid.listWorkspaceFiles', repoProvider.getWorkspaceFileList)
	);
	
	context.subscriptions.push(
		vscode.commands.registerCommand('cid.explainCurrentFile', explainCurrentFile)
	);
	
	context.subscriptions.push(
		vscode.commands.registerCommand('cid.analyzePythonFiles', analyzePythonFiles)
	);
	
	context.subscriptions.push(
    vscode.commands.registerCommand('cid.explainSelectedCode', explainSelectedCode)
);
	context.subscriptions.push(chatCommand);
	context.subscriptions.push(showMermaidCommand);
	context.subscriptions.push(generateAndShowMermaidCommandMOCK);
	context.subscriptions.push(generateAndShowMermaidCommand);
	context.subscriptions.push(testingGeminiCommand);

}

// This method is called when your extension is deactivated
export function deactivate() {}
