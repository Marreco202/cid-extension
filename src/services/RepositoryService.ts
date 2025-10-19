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
        return [];
    }

    const DEFAULT_EXCLUDE = '{**/node_modules/**,**/.git/**,**/.vscode/**,**/venv/**,**/.env/**,**/__pycache__/**,**/.*,**/*.pyc,**/dist/**,**/build/**}';
    const results: string[] = [];

    // If asking for whole workspace, search every workspace folder with explicit exclude
    if (dir === ".") {
        for (const folder of workspaceFolders) {
            const pattern = new vscode.RelativePattern(folder, '**/*');
            const uris = await vscode.workspace.findFiles(pattern, DEFAULT_EXCLUDE);
            results.push(...uris.map(u => vscode.workspace.asRelativePath(u, false)));
        }
        return results;
    }

    // If a specific directory is provided, try to find its owning workspace folder
    const dirFsPath = path.resolve(dir);
    const owner = workspaceFolders.find(f => dirFsPath.startsWith(f.uri.fsPath));
    if (owner) {
        const relBase = path.relative(owner.uri.fsPath, dirFsPath) || '.';
        const pattern = new vscode.RelativePattern(owner, path.posix.join(relBase.replace(/\\/g, '/'), '**/*'));
        const uris = await vscode.workspace.findFiles(pattern, DEFAULT_EXCLUDE);
        return uris.map(u => path.relative(owner.uri.fsPath, u.fsPath));
    }

    // Fallback: treat dir as a single folder search (best-effort)
    const fallbackPattern = new vscode.RelativePattern(vscode.Uri.file(dirFsPath), '**/*' as any);
    const uris = await vscode.workspace.findFiles(fallbackPattern, DEFAULT_EXCLUDE);
    return uris.map(u => path.relative(dirFsPath, u.fsPath));
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