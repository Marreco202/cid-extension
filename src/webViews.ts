import * as vscode from 'vscode';

export function getChatWebViewContent(): string {
	return /*html*/`
<!DOCTYPE html>
<html lang="en">
  <head>
	<meta charset="UTF-8">
	<title>CID Chat</title>
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
	<h1>CID Chat</h1>
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

export function getMermaidWebviewContent(mermaidContent: string, webview: vscode.Webview, extensionUri: vscode.Uri): string {

	const nonce = getNonce();

    // Caminho anterior: vscode.Uri.joinPath(extensionUri, 'media', 'mermaid.min.js')
    // NOVO CAMINHO: Aponta para dentro de node_modules
    const mermaidJsUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'node_modules', 'mermaid', 'dist', 'mermaid.min.js'));
    const panzoomJsUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'node_modules', '@panzoom', 'panzoom', 'dist', 'panzoom.min.js'));

  return /*html*/`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="Content-Security-Policy" content="
            default-src 'none';
            script-src 'nonce-${nonce}';
            style-src 'unsafe-inline' ${webview.cspSource};
            img-src ${webview.cspSource} data:;
        ">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Mermaid Preview</title>
        <style>
            body, html {
                margin: 0;
                padding: 0;
                width: 100%;
                height: 100%;
                overflow: hidden; /* Importante para o panzoom funcionar bem */
                background-color: var(--vscode-editor-background);
                color: var(--vscode-editor-foreground);
                font-family: var(--vscode-font-family);
            }
            #container {
                width: 100%;
                height: 100%;
                display: flex;
                justify-content: center;
                align-items: center;
            }
            /* Estiliza o SVG para o panzoom */
            #container svg {
                cursor: grab;
            }
            #container svg:active {
                cursor: grabbing;
            }
            /* Pequena caixa de instruções */
            #instructions {
                position: absolute;
                bottom: 10px;
                left: 10px;
                background-color: rgba(0,0,0,0.5);
                color: white;
                padding: 5px 10px;
                border-radius: 5px;
                font-size: 12px;
            }
        </style>
    </head>
    <body>
        <div id="container">
            <div id="placeholder">Renderizando diagrama...</div>
        </div>

        <pre class="mermaid" style="display: none;">${mermaidContent}</pre>
        
        <div id="instructions">
            Use a roleta do mouse para dar zoom. Clique e arraste para mover.
        </div>

		<script nonce="${nonce}" src="${mermaidJsUri}"></script>
        <script nonce="${nonce}" src="${panzoomJsUri}"></script>
        <script nonce="${nonce}">
            // Seu script inline
			// Configura o Mermaid para não iniciar automaticamente
			mermaid.initialize({
				startOnLoad: false,
				theme: document.body.classList.contains('vscode-dark') ? 'dark' : 'default'
			});

			// Função para renderizar o diagrama e aplicar o panzoom
			async function renderDiagram() {
				const container = document.getElementById('container');
				const source = document.querySelector('.mermaid').textContent;

				try {
					// Renderiza o diagrama para SVG de forma programática
					const { svg } = await mermaid.render('mermaid-svg', source);
					container.innerHTML = svg;
					
					const svgElement = container.querySelector('svg');

					// Inicializa o Panzoom no elemento SVG
					const pz = Panzoom(svgElement, {
						maxZoom: 5,
						minZoom: 0.1,
						canvas: true // Melhora a experiência de pan em branco
					});

					// Habilita o zoom com a roleta do mouse
					container.addEventListener('wheel', pz.zoomWithWheel);

				} catch (e) {
					container.innerHTML = 'Erro ao renderizar o diagrama: ' + e.message;
				}
			}

			// Chama a função
			renderDiagram();
        </script>
        
    </body>
    </html>
  `;
}


function getNonce() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}