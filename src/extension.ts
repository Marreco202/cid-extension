// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';

import { FunctionsTreeDataProvider } from './providers/FunctionsTreeDataProvider';
import {listWorkspaceFiles, explainCurrentFile,analyzePythonFiles} from './ExtractionFeatures'; //FIX: Change import to correct file name
import {ChatViewProvider} from './providers/ChatViewProvider';
import {getMermaidWebviewContent} from './WebViews';


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

	// Registra o comando que simplesmente chama o método para mostrar a janela
	const chatCommand = vscode.commands.registerCommand('cid.helloWorld', () => {
		chatProvider.createOrShow();
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

	context.subscriptions.push(
		vscode.commands.registerCommand('cid.renderMermaid', () => {
			showMermaidPreview(context); 
		})
	);
	
	context.subscriptions.push(chatCommand);
}

async function showMermaidPreview(context: vscode.ExtensionContext) {
  // 1. Obter o editor de texto ativo
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showErrorMessage('Nenhum arquivo aberto para pré-visualizar como Mermaid.');
    return;
  }

  // 2. Obter o conteúdo do arquivo
  const fileContent = editor.document.getText();
  const fileName = path.basename(editor.document.fileName); // Precisamos do 'path'

  // 3. Criar e mostrar o painel da webview
  const panel = vscode.window.createWebviewPanel(
    'mermaidPreview', // ID interno do painel
    `Preview: ${fileName}`, // Título que aparece na aba
    vscode.ViewColumn.Beside, // Abre o painel ao lado do editor atual
    {
      enableScripts: true // Habilita JavaScript na webview
    }
  );

  // 4. Definir o conteúdo HTML da webview
  panel.webview.html = getMermaidWebviewContent(fileContent, panel.webview, context.extensionUri);
}

// This method is called when your extension is deactivated
export function deactivate() {}
