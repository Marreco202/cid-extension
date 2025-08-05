// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import ollama from 'ollama';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	console.log('Congratulations, your extension "cid" is now active!');

	
	const disposable = vscode.commands.registerCommand('cid.helloWorld', () => {
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
						model : 'deepseek-coder:1.3b',
						messages: [{role: 'user', content: userPrompt}],
						stream: true
					});

					//Spits out message sentence by sentence instead the entire thing
					for await (const part of streamResponse) {
						responseText += part.message.content;
						panel.webview.postMessage({command: 'chatResponse', text: responseText});
					}


				} catch(err){
					console.log("oops");
				}
			}


		});
	});

	context.subscriptions.push(disposable);
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
	<h1>Deep Fucking Chat</h1>
	<textarea id="prompt" placeholder="Create a JS function for binary search"></textarea><br>
	<button onclick="ask()">Ask</button>

	<div class="response" id="response">
	  &lt;think&gt;\nWaiting for your question...
	</div>

	<script>
	  const vscode = acquireVsCodeApi();

	  document.getElementById('askBtn').addEventListener('click', () => {
		const text = document.getElementById('prompt').value;
		vscode.postMessage({ command: 'chat', text });

	  });

	  windows.addEventListener('message', event => {
		const {command, text} = event.data;
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
