import * as vscode from 'vscode';
import * as path from 'path';

import {} from '../services/RepositoryService';
import {getMermaidWebviewContent} from '../WebViews';
import {chatResponse} from '../services/OllamaService';
import {getWorkspaceFileString} from '../services/RepositoryService';

import {BASE_SYSTEM_FIRST_PROMPT,BASE_SYSTEM_SECOND_PROMPT,BASE_SYSTEM_THIRD_PROMPT} from '../prompts/BaselineSysPrompt';

async function generateMermaidString(prompt : string){

  //chamar o chat response 3x, usando o input de um como output do outro.
  
  const first_response = await chatResponse(prompt,BASE_SYSTEM_FIRST_PROMPT);
  const second_response = await chatResponse(first_response,BASE_SYSTEM_SECOND_PROMPT);
  const mermaid_string = await chatResponse(second_response,BASE_SYSTEM_THIRD_PROMPT);
  
  //uma vez gerado a string do .mermaid, salvar localmente (testar na propria path root desse provider mesmo)
  //adaptar salvar dentro da cache/armazenamento da Extensão
  //Associar a extensão

  //const mock_mermaid = "Hello there!";

  //return mermaid_string;
  return mermaid_string;
}

export class MermaidViewProvider {

    private readonly _context : vscode.ExtensionContext;
    
    constructor(context: vscode.ExtensionContext){
        this._context = context;
    }
    
    private showMermaidFile(fileContent : string, fileName? : string){
      // 3. Criar e mostrar o painel da webview

      if(fileName === undefined){
        fileName = "MockNameFile";
      }

      const panel = vscode.window.createWebviewPanel(
        'mermaidPreview', // ID interno do painel
        `Preview: ${fileName}`, // Título que aparece na aba
        vscode.ViewColumn.Beside, // Abre o painel ao lado do editor atual
        {
          enableScripts: true // Habilita JavaScript na webview
        }
      );
      // 4. Definir o conteúdo HTML da webview
      panel.webview.html = getMermaidWebviewContent(fileContent, panel.webview, this._context.extensionUri);
      
      return;
    }

    async showMermaidPreview() {
      // 1. Obter o editor de texto ativo
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showErrorMessage('Nenhum arquivo aberto para pré-visualizar como Mermaid.');
        return;
      }
    
      // 2. Obter o conteúdo do arquivo
      const fileContent = editor.document.getText();
      const fileName = path.basename(editor.document.fileName); // Precisamos do 'path'
    
      this.showMermaidFile(fileContent,fileName);

    }
  async generateAndShowMermaidPreview(){

    const workspace_files : string = await getWorkspaceFileString(); // get all files as string
    const high_level_mermaid_graph : string = await generateMermaidString(workspace_files); //generates .mermaid file content
    
    this.showMermaidFile(high_level_mermaid_graph);

  }
}

