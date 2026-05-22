import * as vscode from 'vscode';


interface DiagramInfo {
  name: string;
  filePath: string;
}

//Mock para simular a busca de diagramas salvos
async function getSavedDiagrams(): Promise<DiagramInfo[]> {

    return [
        { name: "Arquitetura do Projeto", filePath: "local://diagrams/arquitetura.mermaid" },
        { name: "Fluxo de Usuário", filePath: "local://diagrams/user_flow.mermaid" }
    ];
    
    // Para testar a mensagem de lista vazia, basta comentar o return acima e descomentar este:
    // return [];
}

export class DiagramsTreeDataProvider implements vscode.TreeDataProvider<vscode.TreeItem> {

  getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
    return element;
  }

  async getChildren(element?: vscode.TreeItem): Promise<vscode.TreeItem[]> {
    if (element) {
      return Promise.resolve([]);
    }

    const diagrams = await getSavedDiagrams();

    if (diagrams.length > 0) {
      return Promise.resolve(
        diagrams.map(diag => {
          const treeItem = new vscode.TreeItem(diag.name, vscode.TreeItemCollapsibleState.None);
          treeItem.description = diag.filePath; 
          treeItem.iconPath = new vscode.ThemeIcon('symbol-misc'); 
          
          return treeItem;
        })
      );
    } else {
      // Mensagem amigável quando não houver diagramas salvos
      const emptyItem = new vscode.TreeItem('None saved diagrams were found');
      emptyItem.iconPath = new vscode.ThemeIcon('info');
      return Promise.resolve([emptyItem]);
    }
  }
}