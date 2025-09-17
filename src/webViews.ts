
export function getWebViewContent(): string {
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