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
import { ApiProvider } from './providers/ApiProvider';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {

	  // REGISTRA A NOVA TREE VIEW
	const functionsProvider = new FunctionsTreeDataProvider();
	vscode.window.createTreeView('cid.functionsView', { // O ID DEVE SER O MESMO DO package.json
		treeDataProvider: functionsProvider
	});

	console.log('Congratulations, your extension "cid" is now active!');
	vscode.window.showInformationMessage('Hello World from CiD!');

	// Instancia o nosso provedor da view de chat
	const chatProvider = new ChatViewProvider(context);
	const mermaidProvider = new MermaidViewProvider(context);
	const repoProvider = new RepoDataProvider();
	const modelProvider = new ModelProvider();
	const apiProvider = new ApiProvider(context);

	const getLlmConfig = () => {
		const config = vscode.workspace.getConfiguration('cid');
		return {
			provider: config.get<string>('modelProvider','Ollama'),
			selectedModel: config.get<string>('modelName','gemma4:e4b')
		};
	};

	let llmConfig = getLlmConfig();
	const api_key = await apiProvider.getSecret(llmConfig.provider);
	let model = modelProvider.factory(llmConfig.provider, llmConfig.selectedModel, api_key ? api_key : undefined);


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
 
	const setApiKeyCommand = vscode.commands.registerCommand('cid.setApiKey', async () => {
		// Opens input box on top of the editor
		apiProvider.setSecret(llmConfig.provider);
	});  
	
	const showMermaidCommand = vscode.commands.registerCommand('cid.renderMermaid', () => {
		mermaidProvider.showMermaidPreview();
	});

	const generateAndShowMermaidCommandMOCK = vscode.commands.registerCommand('cid.generateAndShowMermaidMOCK', () => {
		mermaidProvider.generateAndShowMermaidPreviewMOCK();
	});

	const generateAndShowMermaidCommand = vscode.commands.registerCommand('cid.generateAndShowMermaid', async () => {
		try {
			mermaidProvider.generateAndShowMermaidPreview(await model);
		} catch (err) {
			console.error(`Failed to Generate and Show Mermaid preview ${err}`);
			vscode.window.showErrorMessage('Failed to Generate mermaid. See console for details.');
		}
	});

	const consolelogReadmeCommand = vscode.commands.registerCommand("cid.printReadMe", async () => {
		repoProvider.getReadme();
	});
	
	const testingGeminiCommand = vscode.commands.registerCommand('cid.testingGemini', async () => {
		try {

			const model_instance = await new ModelProvider().factory("gemini-2.5-pro","Gemini");
			model_instance.generateResponse("What is the meaning of life? Use 50 words max");

		} catch (err) {
			console.error('Failed to load/run Gemini test:', err);
			vscode.window.showErrorMessage('Failed to run Gemini test. See console for details.');
		}
	});


	context.subscriptions.push(
        vscode.workspace.onDidChangeConfiguration(event => {
			//This if needs refactoring for more elegant solution.
            if (event.affectsConfiguration('cid.modelProvider') ||
				event.affectsConfiguration('cid.modelName')) {

				llmConfig = getLlmConfig();
                
                apiProvider.getSecret(llmConfig.provider).then(api_key => {
					model = modelProvider.factory(llmConfig.provider, llmConfig.selectedModel, api_key ? api_key : undefined); // Updates model instance if settings changed.
					vscode.window.showInformationMessage(`CiD: LLM Family changed to ${llmConfig.provider}.`);
				});
            }
        })
    );

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
	context.subscriptions.push(setApiKeyCommand);



}

// This method is called when your extension is deactivated
export function deactivate() {}
