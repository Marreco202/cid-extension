// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import ollama from 'ollama';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

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


async function listWorkspaceFiles(){
	const files = await vscode.workspace.findFiles('**/*.ts'); // find all .ts files from my project under any folder
	const paths = files.map(uri => uri.fsPath).join('\n');
	vscode.window.showInformationMessage(`Arquivos encontrados:\n${paths}`, { modal: true });
}


async function explainCurrentFile(){
	const editor = vscode.window.activeTextEditor;
	if (editor) {
		const text = editor.document.getText();
		vscode.window.showInformationMessage(`Codigo atual:\n${text}`, { modal: true });
	}
		return undefined;
}


	async function analyzePythonFiles() {
    const files = await vscode.workspace.findFiles('**/*.py'); // procura todos arquivos .py no workspace

    let result: string[] = [];

    for (const file of files) {
        const document = await vscode.workspace.openTextDocument(file);
        const text = document.getText();

        // Regex para capturar definições de função
        const funcRegex = /def\s+(\w+)\s*\(([^)]*)\)(?:\s*->\s*([\w\[\],. ]+))?:\s*([\s\S]*?)(?=^def|\Z)/gm;

        let match;
        while ((match = funcRegex.exec(text)) !== null) {
            const [, funcName, paramsRaw, returnType, body] = match;
			
            // Extrair docstring (se existir no início do corpo da função)
            const docstringMatch = body.match(/^\s*"""([\s\S]*?)"""/) || body.match(/^\s*'''([\s\S]*?)'''/);
            const docstring = docstringMatch ? docstringMatch[1].trim() : "Sem docstring";

            // Processar parâmetros
            const params = paramsRaw.split(',')
                .map(p => p.trim())
                .filter(p => p.length > 0)
                .map(p => {
                    const [name, type] = p.split(':').map(s => s.trim());
                    return `${name}${type ? `: ${type}` : ''}`;
                });

            result.push(
                `Arquivo: ${file.fsPath}\n` +
                `Função: ${funcName}\n` +
                `Parâmetros: ${params.join(', ') || "nenhum"}\n` +
                `Retorno: ${returnType || "não especificado"}\n` +
                `Docstring: ${docstring}\n`
            );
        }
    }

    // Exibir resultado em uma janela de output
    const output = vscode.window.createOutputChannel("Python Analysis");
    output.clear();
    output.append(result.join("\n---------------------\n"));
    output.show(true);
	console.log(output);
}

function getWebViewContent(): string {
	return /*html*/`
<!DOCTYPE html>
<html lang="en">
  <head>
	<meta charset="UTF-8">
	<title>Deep Chat</title>
	<style>
	  body {
		background-color: #1e1e1e;
		color: #ffffff;
		font-family: monospace;
		padding: 2rem;
	  }

	  h1 {
		color: #ffffff;
		font-size: 1.8rem;
		font-weight: bold;
		margin-bottom: 1rem;
	  }

	  textarea {
		width: 100%;
		height: 3em;
		font-size: 1rem;
		font-family: monospace;
		padding: 0.5rem;
		margin-bottom: 1rem;
	  }

	  button {
		padding: 0.5rem 1rem;
		background-color: #f0f0f0;
		color: #000;
		font-weight: bold;
		border: none;
		cursor: pointer;
	  }

	  .response {
		border: 1px solid #888;
		padding: 1rem;
		margin-top: 1rem;
		white-space: pre-wrap;
		background-color: #2d2d2d;
	  }
	</style>
  </head>
  <body>
	<h1>Deep Chat</h1>
	<textarea id="prompt" placeholder="Type your question here..."></textarea><br>
	<button id="askBtn">Ask</button>

	<div class="response" id="response">
	  &lt;think&gt;\nWaiting for your question...
	</div>

	<script>
	  const vscode = acquireVsCodeApi();

	  document.getElementById('askBtn').addEventListener('click', () => {
		const text = document.getElementById('prompt').value;
		vscode.postMessage({ command: 'chat', text });
	  });

	  window.addEventListener('message', event => {
		const { command, text } = event.data;
		if (command === 'chatResponse') {
			document.getElementById('response').innerText = text;
		}
	  });

	</script>
  </body>
</html>
`;

}

// This method is called when your extension is deactivated
export function deactivate() {}
