import * as vscode from 'vscode';
import * as path from 'path';

import {getMermaidWebviewContent} from '../webViews';
import {getWorkspaceFileString, findReadmeFile} from '../services/RepositoryService';

import {BASE_SYSTEM_FIRST_PROMPT,BASE_SYSTEM_SECOND_PROMPT,BASE_SYSTEM_THIRD_PROMPT} from '../prompts/BaselineSysPrompt';
import { IModel } from '../interfaces/IModel';
import { read } from 'fs';
import { execPath } from 'process';

export class MermaidViewProvider {

    private readonly _context : vscode.ExtensionContext;
    
    constructor(context: vscode.ExtensionContext){
        this._context = context;
    }
    

    private showMermaidFile(fileContent : string, fileName? : string){
      const panel = vscode.window.createWebviewPanel(
        'mermaidPreview', 
        `Preview: ${fileName}`,
        vscode.ViewColumn.Beside,
        {
          enableScripts: true,
          localResourceRoots: [vscode.Uri.joinPath(this._context.extensionUri, 'node_modules')]
        }
      );
      panel.webview.html = getMermaidWebviewContent(fileContent, panel.webview, this._context.extensionUri);
    }

    /**
     * Mostra pré visualizção de um arquivo Mermaid já aberto no editor
     * @param void
     * @returns void
     */
    async showMermaidPreview() {

      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showErrorMessage('Nenhum arquivo aberto para pré-visualizar como Mermaid.');
        return;
      }
      const fileContent = editor.document.getText();
      const fileName = path.basename(editor.document.fileName); // Precisamos do 'path'
    
      this.showMermaidFile(fileContent,fileName);
    }
    
    /**
     * Ponto de entrada principal para gerar o diagrama com feedback de progresso. Versão mockada
     */
    public async generateAndShowMermaidPreviewMOCK() {
      await vscode.window.withProgress({
          location: vscode.ProgressLocation.Notification,
          title: "[MOCK] Gerando Diagrama Mermaid",
          cancellable: true
      }, async (progress, token) => {
          try {
              // Toda a lógica agora acontece aqui dentro.
              const mermaidString = await this.generateMermaidStringMOCK(progress, token);

              // Se a geração foi bem-sucedida (não foi cancelada), mostre o resultado.
              if (mermaidString) {
                  this.showMermaidFile(mermaidString, "[MOCK] Project diagram");
              }

          } catch (error: any) {
              // Se um erro ocorrer (incluindo cancelamento), mostre uma mensagem.
              if (error.message === 'Cancelled') {
                  vscode.window.showInformationMessage("Operação cancelada pelo usuário.");
              } else {
                  vscode.window.showErrorMessage(`Erro ao gerar diagrama: ${error.message}`);
              }
          }
      });
  }


  private async generateMermaidStringMOCK(progress : vscode.Progress<{message?: string; increment?: number}>, token: vscode.CancellationToken): Promise<string | null>{

    const checkCancellation= () => {
      if(token.isCancellationRequested) {
        throw new Error("Cancelled");
      }
    };

    //Trocar check cancellation por setTimeout

    progress.report({ message: "Analisando workspace...", increment: 10 });
    const workspaceFiles = await getWorkspaceFileString();
    checkCancellation();

    // Primeira chamada mock
    progress.report({ message: "Gerando rascunho (1/3)...", increment: 30 });
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simula trabalho
    // const first_response = await chatResponse(workspaceFiles, BASE_SYSTEM_FIRST_PROMPT);
    checkCancellation();

    // Segunda chamada mock
    progress.report({ message: "Refinando estrutura (2/3)...", increment: 30 });
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simula trabalho
    // const second_response = await chatResponse(first_response, BASE_SYSTEM_SECOND_PROMPT);
    checkCancellation();

    // Terceira chamada mock
    progress.report({ message: "Finalizando código Mermaid (3/3)...", increment: 20 });
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simula trabalho
    // const mermaid_string = await chatResponse(second_response, BASE_SYSTEM_THIRD_PROMPT);
    const finalMermaidString = `graph TD;\n    A[Workspace] --> B{LLM Gen};\n    B --> C[Diagrama];`;
    checkCancellation();

    progress.report({ message: "Concluído!", increment: 10 });
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return finalMermaidString;
  }

    /**
   * Ponto de entrada principal para gerar o diagrama com feedback de progresso
   */
  public async generateAndShowMermaidPreview(model : IModel) {
    await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: "Gerando Diagrama Mermaid",
        cancellable: true
    }, async (progress, token) => {
        try {
            // Toda a lógica agora acontece aqui dentro.
            const mermaidString = await this.generateMermaidString(progress, token, model);

            if (token.isCancellationRequested) {
              // console.log("Graph generation cancelled by user.");
              throw new Error("Cancelled");
            }

            // Se a geração foi bem-sucedida (não foi cancelada), mostre o resultado.
            if (mermaidString) {
                this.showMermaidFile(mermaidString, "Project Diagram"); //TODO colocar o nome do repositorio nesse titulo
            }

        } catch (error: any) {
            if(token.isCancellationRequested){
              vscode.window.showErrorMessage(`Graph generation cancelled by user: ${error.message}`);
            }
            else if (!token.isCancellationRequested) {
              vscode.window.showErrorMessage(`Error while generating diagram: ${error.message}`);
            }
        }
    });
  }


  private async generateMermaidString(progress : vscode.Progress<{message?: string; increment?: number}>, token: vscode.CancellationToken, model : IModel): Promise<string | null>{

    const file_tree = await getWorkspaceFileString('.');
    const read_me = await findReadmeFile();
    
    progress.report({ message: "Analisando workspace...", increment: 10 });
    const workspaceFiles = await getWorkspaceFileString();
    if (token.isCancellationRequested) { return ""; }
    
    //STEP ONE: EXPLANATION

    const first_prompt_data = {
      file_tree : file_tree,
      read_me : read_me
    };

    progress.report({ message: "Gerando explicação (1/3)...", increment: 30 });
    model.setData(first_prompt_data);
    const explanation = await model.generateResponse(BASE_SYSTEM_FIRST_PROMPT);
    if (token.isCancellationRequested) { return ""; };

    //STEP TWO : CONTENT_MAPPING

    const second_prompt_data = {
      explanation: explanation,
      file_tree: file_tree
    };

    progress.report({ message: "Gerando Content Mapping (2/3)...", increment: 30 });
    model.setData(second_prompt_data);
    const content_mapping = await model.generateResponse(BASE_SYSTEM_SECOND_PROMPT);
    if (token.isCancellationRequested) { return ""; };

    // STEP THREE: .MERMAID FILE

    const third_prompt_data = {
      explanation: explanation,
      content_mapping: content_mapping
    };

    progress.report({ message: "Finalizando código Mermaid (3/3)...", increment: 20 });
    model.setData(third_prompt_data);
    const finalMermaidString = await model.generateResponse(BASE_SYSTEM_THIRD_PROMPT);
    if (token.isCancellationRequested) { return ""; };

    progress.report({ message: "Concluído!", increment: 10 });
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log("\n\n\nFINAL MERMAID!\n\n\n");
    console.log(finalMermaidString);

    return finalMermaidString;
  }
}
