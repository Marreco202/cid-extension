import * as vscode from 'vscode';
import * as path from 'path';

import {getMermaidWebviewContent} from '../webViews';
import {getWorkspaceFileString, findReadmeFile} from '../services/RepositoryService';

import {BASE_SYSTEM_FIRST_PROMPT,BASE_SYSTEM_SECOND_PROMPT,BASE_SYSTEM_THIRD_PROMPT} from '../prompts/BaselineSysPrompt';
import { IModel } from '../interfaces/IModel';
import { GEMINI_CORRECT_MERMAID } from '../prompts/GeminiPrompts';
import { DiagramStorageService } from '../services/DiagramStorageService';
import { DiagramsTreeDataProvider } from './DiagramsTreeDataProvider';
// import mermaid from 'mermaid';

export class MermaidViewProvider {

    private readonly _context : vscode.ExtensionContext;
    private readonly _storageService: DiagramStorageService;
    private readonly _diagramsTreeDataProvider: DiagramsTreeDataProvider;
    
    constructor(
      context: vscode.ExtensionContext,
      storageService: DiagramStorageService, 
      diagramsTreeDataProvider: DiagramsTreeDataProvider
    ){
        this._context = context;
        this._storageService = storageService;
        this._diagramsTreeDataProvider = diagramsTreeDataProvider;
    }
    
    public showSavedDiagram(mermaid: string, name: string) {
      this.showMermaidFile(mermaid,name);
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
            else if(mermaidString === null){
              throw new Error("Error on the diagram generation");
            }

            //Asking if wants to save diagram
            const diagramName = await vscode.window.showInputBox({
                    prompt: 'Do you want to save this diagram in the project history? Type a name:',
                    placeHolder: 'Ex: Architecture, Data Flow...',
                    ignoreFocusOut: false // If they click outside the box, cancel the save (but the graph stays on screen)
            });

            if (diagramName) {
                    
                    await this._storageService.saveDiagram(diagramName, mermaidString);
                    
                    // Notifies TreeView to reload the diagram list
                    this._diagramsTreeDataProvider.refresh();
                    vscode.window.showInformationMessage(`Diagram "${diagramName}" saved sucessfuly!`);
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
    const read_me = await Promise.resolve(findReadmeFile());

    console.log(`README FILE : ${read_me}`);

    if(!read_me){
      throw new Error("No README File returned by findReadmeFile");
    }
    
    progress.report({ message: "Analisando workspace...", increment: 10 });
    if (token.isCancellationRequested) { return ""; }
    
    try {
      await new Promise(resolve => setTimeout(resolve, 100)); // Simula trabalho

    } catch (err) {
      throw new Error("Found you!");
    }
    //STEP ONE: EXPLANATION

    const first_prompt_data = {
      file_tree : file_tree,
      read_me : read_me //TODO : Checar se nao tem que colocar algumas instructions genericas aqui do tipo "quero o diagrama em alto nivel"
    };
    
    console.log(file_tree,read_me);
    
    //REFACTOR: IF ELSE 
    let explanation;
    progress.report({ message: "Gerando explicação (1/3)...", increment: 30 });
    if(model.getModelName() === "GPT") {
      model.setData(first_prompt_data);
      explanation = await model.generateResponse(BASE_SYSTEM_FIRST_PROMPT,"medium");
    } else {
      model.setData(first_prompt_data);
      explanation = await model.generateResponse(BASE_SYSTEM_FIRST_PROMPT);
    }
    if (token.isCancellationRequested) { return ""; };
    
    console.log("EXPLANATION: ",explanation);
    //STEP TWO : CONTENT_MAPPING

    const second_prompt_data = {
      explanation: explanation,
      file_tree: file_tree
    };

    progress.report({ message: "Gerando Content Mapping (2/3)...", increment: 30 });
    model.setData(second_prompt_data);
    let content_mapping;

    if(model.getModelName() === "GPT") {
      content_mapping = await model.generateResponse(BASE_SYSTEM_SECOND_PROMPT,"low");
    } else {
      content_mapping = await model.generateResponse(BASE_SYSTEM_SECOND_PROMPT);
    }
    if (token.isCancellationRequested) { return ""; };

    // STEP THREE: .MERMAID FILE

    console.log("CONTENT MAPPING: ",content_mapping);

    const third_prompt_data = {
      explanation: explanation,
      content_mapping: content_mapping
    };

    let finalMermaidString;
    progress.report({ message: "Finalizando código Mermaid (3/3)...", increment: 20 });
    model.setData(third_prompt_data);
    if(model.getModelName() === "GPT") {
      finalMermaidString = await model.generateResponse(BASE_SYSTEM_THIRD_PROMPT, "low");
    } else {
      finalMermaidString = await model.generateResponse(BASE_SYSTEM_THIRD_PROMPT);
    }

    // const finalMermaidString = await model.generateResponse(BASE_SYSTEM_THIRD_PROMPT);
    if (token.isCancellationRequested) { return ""; };

    const sanitizedMermaid = finalMermaidString
    .replace(/```mermaid/g, '')
    .replace(/```/g, '')
    .trim();


    if(model.getModelName() === "Gemini") {
      console.log("CORRECTING GEMINI...");
      model.setData({
        possiblyBrokenMermaid : finalMermaidString
      });
      finalMermaidString = await model.generateResponse(GEMINI_CORRECT_MERMAID);
    }

    if (!sanitizedMermaid.startsWith("graph") && !sanitizedMermaid.startsWith("flowchart")) {
        throw new Error("Invalid Mermaid.js code. Diagram generation failed.");
    }

    progress.report({ message: "Concluído!", increment: 10 });
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log("\n\n\nFINAL MERMAID!\n\n\n");
    console.log(sanitizedMermaid);

    return sanitizedMermaid;
  }
}
