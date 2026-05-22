import * as vscode from 'vscode';
import { DiagramStorageService } from '../services/DiagramStorageService';

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
    
    private storageService: DiagramStorageService;
    //VSCode mechanism for redraw tree if new diagram is detected
    private _onDidChangeTreeData: vscode.EventEmitter<vscode.TreeItem | undefined | null | void> = new vscode.EventEmitter<vscode.TreeItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<vscode.TreeItem | undefined | null | void> = this._onDidChangeTreeData.event;


    constructor(storageService: DiagramStorageService) {
    this.storageService = storageService;
  }

    getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
        return element;
    }

    public refresh(): void {
    this._onDidChangeTreeData.fire();
    }

  async getChildren(element?: vscode.TreeItem): Promise<vscode.TreeItem[]> {

    if (element){
        return Promise.resolve([]);
    }

    const diagrams = this.storageService.getDiagrams();

    if (diagrams.length > 0) {
      return Promise.resolve(
        diagrams.map(diag => {
            return new DiagramTreeItem(
              diag.id, 
              diag.name,
              new Date(diag.timestamp).toLocaleDateString(),
              diag.mermaid,
              {
                  command: 'cid.openSavedDiagram',
                  title: 'Open Saved Diagram',
                  arguments: [diag.mermaid, diag.name]
              }
          );
        })
      );
    } else {
      const emptyItem = new vscode.TreeItem('Nenhum diagrama salvo encontrado');
      emptyItem.iconPath = new vscode.ThemeIcon('info');
      return Promise.resolve([emptyItem]);
    }
  }
}

export class DiagramTreeItem extends vscode.TreeItem {
    constructor(
        public readonly diagramId: string,
        public readonly label: string,
        public readonly description: string,
        public readonly code: string,
        public readonly clickCommand: vscode.Command
    ) {
        super(label, vscode.TreeItemCollapsibleState.None);
        this.description = description;
        this.iconPath = new vscode.ThemeIcon('type-hierarchy');
        this.contextValue = 'savedDiagramItem';
        this.command = clickCommand;
    }
}