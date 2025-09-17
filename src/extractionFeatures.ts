import * as vscode from 'vscode';

export async function listWorkspaceFiles(){
	const files = await vscode.workspace.findFiles('**/*.ts'); // find all .ts files from my project under any folder
	const paths = files.map(uri => uri.fsPath).join('\n');
	vscode.window.showInformationMessage(`Arquivos encontrados:\n${paths}`, { modal: true });
}


export async function explainCurrentFile(){
	const editor = vscode.window.activeTextEditor;
	if (editor) {
		const text = editor.document.getText();
		vscode.window.showInformationMessage(`Codigo atual:\n${text}`, { modal: true });
	}
		return undefined;
}

export async function analyzePythonFiles() {
    const files = await vscode.workspace.findFiles('**/*.py'); // procura todos arquivos .py no workspace
	const output = vscode.window.createOutputChannel("CID: Python functions");
	output.clear();

    let result: string[] = [];

	 // --- ADICIONE ESTA LINHA PARA DEBUG ---
    console.log(`Arquivos .py encontrados: ${files.length}`, files.map(f => f.fsPath));


    for (const file of files) {
        const document = await vscode.workspace.openTextDocument(file);
        const text = document.getText();

        // Regex para capturar definições de função

		const funcRegex = /^\s*(?:async\s+)?def\s+([a-zA-Z_]\w*)\s*\(([^)]*)\)\s*(?:->\s*([\w\s\[\].]+))?:([\s\S]*?)(?=^\s*(?:@|async\s+|def)|$(?![\s\S]))/gm;

        let match;

		// --- ADICIONE ESTAS LINHAS PARA DEBUG ---
		output.append(`--- Analisando o arquivo: ${file.fsPath} ---`);

		// console.log(text); // Descomente esta linha para ver o conteúdo completo do arquivo
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
	console.log(result);
    output.append(result.join("\n---------------------\n"));
    output.show(true);
	// console.log(output);
}
