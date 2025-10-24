// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

import { FunctionsTreeDataProvider } from './providers/FunctionsTreeDataProvider';
import { explainCurrentFile,analyzePythonFiles} from './extractionFeatures'; //FIX: Change import to correct file name
import {RepoDataProvider} from './providers/RepoDataProvider';
import {ChatViewProvider} from './providers/ChatViewProvider';
import {MermaidViewProvider} from './providers/MermaidViewProvider';
// import {explainSelectedCode} from './services/OllamaService';

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
	// const repoData  = {
	// 			file_tree : repoProvider.getWorkspaceFileList(),
	// 			readme : repoProvider.getReadme() 
	// 		};

	const selectedModel = "GPT";
	const model = modelProvider.factory(selectedModel);
	// const model = modelProvider.factory(selectedModel,repoData);


	// Registra o comando que simplesmente chama o método para mostrar a janela
	const chatCommand = vscode.commands.registerCommand('cid.helloWorld', async () => {
		try {
			const resolvedModel = await model;
			chatProvider.createOrShow(resolvedModel);
		}catch (err){
			console.error("Failed to execute chat command:", err);
        	vscode.window.showErrorMessage("Failed to open chat view. Please try again.");
		}

	});
	
	const showMermaidCommand = vscode.commands.registerCommand('cid.renderMermaid', () => {
		mermaidProvider.showMermaidPreview();
	});

	const generateAndShowMermaidCommandMOCK = vscode.commands.registerCommand('cid.generateAndShowMermaidMOCK', () => {
		mermaidProvider.generateAndShowMermaidPreviewMOCK();
	});

	const generateAndShowMermaidCommand = vscode.commands.registerCommand('cid.generateAndShowMermaid', async () => {
		mermaidProvider.generateAndShowMermaidPreview(await model);
	});

	const consolelogReadmeCommand = vscode.commands.registerCommand("cid.printReadMe", async () => {
		repoProvider.getReadme();
	});
	
	const testingGeminiCommand = vscode.commands.registerCommand('cid.testingGemini', async () => {
		try {

			const model_instance = await new ModelProvider().factory("Gemini");
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
	
// 	context.subscriptions.push(
//     vscode.commands.registerCommand('cid.explainSelectedCode', model.explainSelectedCode) //Esse comando sempre da erro quando o modelo selecionado nao for o Olama. BUG FIX
// );
	context.subscriptions.push(chatCommand);
	context.subscriptions.push(showMermaidCommand);
	context.subscriptions.push(generateAndShowMermaidCommandMOCK);
	context.subscriptions.push(generateAndShowMermaidCommand);
	context.subscriptions.push(testingGeminiCommand);
	context.subscriptions.push(consolelogReadmeCommand);

}

// This method is called when your extension is deactivated
export function deactivate() {}
