import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";


// Patterns to exclude
const excludedPatterns: string[] = [
  // Dependencies
  "node_modules/",
  "vendor/",
  "venv/",
  // Compiled files
  ".min.",
  ".pyc",
  ".pyo",
  ".pyd",
  ".so",
  ".dll",
  ".class",
  // Asset files
  ".jpg",
  ".jpeg",
  ".png",
  ".gif",
  ".ico",
  ".svg",
  ".ttf",
  ".woff",
  ".webp",
  // Cache and temporary files
  "__pycache__/",
  ".cache/",
  ".tmp/",
  // Lock files and logs
  "yarn.lock",
  "poetry.lock",
  ".log",
  // Configuration files
  ".vscode/",
  ".idea/",
  ".git/",
  ".DS_Store"
];


function isExcluded(filePath: string): boolean {
  return excludedPatterns.some(pattern => {
    if (pattern.endsWith("/")) {
      // Directory exclusion
      return filePath.includes(pattern.slice(0, -1));
    } else if (pattern.startsWith("*")) {
      // exclusion by extension
      return filePath.endsWith(pattern.slice(1));
    } else {
      // exclusion by substring
      return filePath.includes(pattern);
    }
  });
}

/**
 * Lista todos os arquivos em um diretório do workspace de forma segura,
 * usando a API do VS Code.
 * * Esta função é assíncrona.
 * * @param dir O diretório inicial da busca, relativo ao workspace.
 * @param baseDir O diretório base para calcular o caminho relativo do resultado.
 * @returns Uma Promise que resolve para uma lista de caminhos de arquivo relativos.
 */
export async function getWorkspaceFileList(dir: string = ".", baseDir: string = dir): Promise<string[]> {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
        console.warn("Nenhuma pasta de workspace aberta.");
        return []; // TODO: tratar o caso que a lista file list é vazia (para não fazer chamadas desnecessárias a LLM)
    }

    // Se o 'dir' fornecido for '.', usamos a raiz do primeiro workspace.
    const searchRootUri = dir === "." ? workspaceFolders[0].uri : vscode.Uri.file(dir);

    //Cria um padrão de busca que é relativo à pasta de busca.
    // '**/*' significa "todos os arquivos em todas as subpastas".
    const pattern = new vscode.RelativePattern(searchRootUri, '**/*');
    
    // 3. Executa a busca de arquivos.
    // O segundo parâmetro (null) faz com que o VS Code use as exclusões padrão
    // do settings.json e .gitignore.
    const fileUris = await vscode.workspace.findFiles(pattern, null);

    // 4. Mapeia os resultados (que são URIs) para strings de caminho relativo.
    const relativePaths = fileUris.map(uri => {
        // Usa o baseDir original para calcular o caminho relativo, como solicitado.
        const baseUri = baseDir === "." ? workspaceFolders[0].uri.fsPath : baseDir;
        return path.relative(baseUri, uri.fsPath);
    });

    return relativePaths;
}
/**
 * Retorna uma única string com todos os caminhos de arquivo, separados por quebra de linha.
 * * Esta função agora também é assíncrona.
 */

export async function getWorkspaceFileString(dir: string = ".", baseDir: string = dir): Promise<string> {
    const fileList = await getWorkspaceFileList(dir, baseDir);
    return fileList.join("\n");
}
//console.log(getWorkspaceFileList("."));