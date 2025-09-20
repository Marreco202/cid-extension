import * as fs from "fs";
import * as path from "path";


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

export function getWorkspaceFileList(dir: string = ".", baseDir: string = dir): string[] {
  let fileList: string[] = [];
  const entries = fs.readdirSync(dir);

  for (const entry of entries) {
    const fullPath = path.join(dir, entry);
    const relativePath = path.relative(baseDir, fullPath);

    if (isExcluded(relativePath)) {
      continue; //skips file
    }

    if (fs.statSync(fullPath).isDirectory()) {
      fileList = fileList.concat(getWorkspaceFileList(fullPath, baseDir));
    } else {
      fileList.push(relativePath);
    }
  }
  return fileList;
}

// console.log(getWorkspaceFileList("."));