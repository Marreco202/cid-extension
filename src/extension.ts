// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import ollama from 'ollama';


import { FunctionsTreeDataProvider } from './FunctionsTreeDataProvider';
import {listWorkspaceFiles, explainCurrentFile,analyzePythonFiles} from './extractionFeatures';
import {getWebViewContent} from './webViews';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	  // REGISTRA A NOVA TREE VIEW
	const functionsProvider = new FunctionsTreeDataProvider();
	vscode.window.createTreeView('cid.functionsView', { // O ID DEVE SER O MESMO DO package.json
		treeDataProvider: functionsProvider
	});

	console.log('Congratulations, your extension "cid" is now active!');
	
	const helloWorld = vscode.commands.registerCommand('cid.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from CID!');

		const panel = vscode.window.createWebviewPanel(
			'cidChat',
			'CID Assistant Chat',
			vscode.ViewColumn.One,
			{enableScripts : true}
		);
		
		panel.webview.html = getWebViewContent();

		panel.webview.onDidReceiveMessage(async (message: any) => {
			if (message.command === 'chat') {
				const userPrompt = message.text;
				let responseText = '';


				try {
					const streamResponse = await ollama.chat({
						model: 'deepseek-coder:1.3b',
						messages: [{ role: 'user', content: userPrompt }],
						stream: true
					});

					for await (const part of streamResponse) {
						responseText += part.message.content;
						panel.webview.postMessage({ command: 'chatResponse', text: responseText });
					}
				} catch (err) {
					console.error("Error during chat:", err);
				}
			}


		}, undefined, context.subscriptions);
	});

	
	context.subscriptions.push(helloWorld);

	context.subscriptions.push(
	vscode.commands.registerCommand('cid.listWorkspaceFiles', listWorkspaceFiles)
	);
	
	context.subscriptions.push(
	vscode.commands.registerCommand('cid.explainCurrentFile', explainCurrentFile)
	);

	context.subscriptions.push(
	vscode.commands.registerCommand('cid.analyzePythonFiles', analyzePythonFiles)
	);

}

// This method is called when your extension is deactivated
export function deactivate() {}
