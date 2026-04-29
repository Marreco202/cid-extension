import * as vscode from 'vscode';
// Importe a função 'parsePythonFiles' e a interface 'FunctionInfo' se estiverem em outro arquivo

interface FunctionInfo {
  name: string;
  filePath: string;
}


async function parsePythonFiles(): Promise<FunctionInfo[]> {
    const files = await vscode.workspace.findFiles('**/*.py');
    const allFunctions: FunctionInfo[] = [];

    for (const file of files) {
        const document = await vscode.workspace.openTextDocument(file);
        const text = document.getText();

        const funcRegex = /^\s*(?:async\s+)?def\s+([a-zA-Z_]\w*)\s*\(([^)]*)\)\s*(?:->\s*([\w\s\[\].]+))?:([\s\S]*?)(?=^\s*(?:@|async\s+|def)|$(?![\s\S]))/gm;

        let match;
        while ((match = funcRegex.exec(text)) !== null) {
            const [, funcName] = match;
            allFunctions.push({
                name: funcName,
                filePath: file.fsPath
            });
        }
    }
    return allFunctions;
}

export class FunctionsTreeDataProvider implements vscode.TreeDataProvider<vscode.TreeItem> {

  getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
    return element;
  }

  async getChildren(element?: vscode.TreeItem): Promise<vscode.TreeItem[]> {
    // Se 'element' existe, significa que estamos pedindo os filhos de um item.
    // Para este exemplo simples, nossa árvore é plana (não tem filhos), então retornamos vazio.
    if (element) {
      return Promise.resolve([]);
    }

    // Se 'element' não existe, estamos pedindo os itens do nível raiz.
    const functions = await parsePythonFiles(); // Usamos nossa função refatorada

    if (functions.length > 0) {
      return Promise.resolve(
        functions.map(func => {
          // Cada função se torna um TreeItem
          const treeItem = new vscode.TreeItem(func.name, vscode.TreeItemCollapsibleState.None);
          treeItem.description = func.filePath; // Mostra o caminho do arquivo ao lado
          treeItem.iconPath = new vscode.ThemeIcon('symbol-function'); // Usa um ícone do VS Code
          return treeItem;
        })
      );
    } else {
      // Se não encontrar funções, mostra uma mensagem
      return Promise.resolve([new vscode.TreeItem('Nenhuma função Python encontrada no workspace')]);
    }
  }
}