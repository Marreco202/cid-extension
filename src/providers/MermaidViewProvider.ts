import * as vscode from 'vscode';
import * as path from 'path';

import {} from '../services/RepositoryService';
import {getMermaidWebviewContent} from '../WebViews';


export class MermaidViewProvider {

    private readonly _context : vscode.ExtensionContext;
    

    constructor(context: vscode.ExtensionContext){
        this._context = context;
    }
    
    async showMermaidPreview(context: vscode.ExtensionContext) {
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



}

