import * as vscode from 'vscode';

export interface SavedDiagram {
    id: string;
    name: string;
    mermaid: string;
    timestamp: number;
}

export class DiagramStorageService {
    private _context: vscode.ExtensionContext;
    private readonly STORAGE_KEY = 'cid_saved_diagrams_v1';

    constructor(context: vscode.ExtensionContext) {
        this._context = context;
    }

    /**
     * Retorna todos os diagramas salvos neste workspace.
     */
    public getDiagrams(): SavedDiagram[] {
        // Busca do estado do workspace. Se não houver nada, retorna um array vazio []
        return this._context.workspaceState.get<SavedDiagram[]>(this.STORAGE_KEY, []);
    }

    /**
     * Salva um novo diagrama no cofre.
     */
    public async saveDiagram(name: string, mermaid: string): Promise<SavedDiagram> {
        const diagrams = this.getDiagrams();
        
        const newDiagram: SavedDiagram = {
            id: 'diag_' + Math.random().toString(36).substring(2, 11), // ID único simples
            name: name,
            mermaid: mermaid,
            timestamp: Date.now()
        };

        diagrams.push(newDiagram);
        // Atualiza o banco de dados local do VS Code
        await this._context.workspaceState.update(this.STORAGE_KEY, diagrams);
        return newDiagram;
    }

    /**
     * Remove um diagrama do cofre pelo ID.
     */
    public async deleteDiagram(id: string): Promise<void> {
        let diagrams = this.getDiagrams();
        diagrams = diagrams.filter(d => d.id !== id);
        await this._context.workspaceState.update(this.STORAGE_KEY, diagrams);
    }
}