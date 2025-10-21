import * as vscode from 'vscode';
import {findReadmeFile, getWorkspaceFileString} from '../services/RepositoryService';
import { read } from 'fs';

export class RepoDataProvider {

    async getWorkspaceFileList() {
        const dir = '.';
        const promise = getWorkspaceFileString(dir);

        promise.then((data) =>{
            console.log(data);
        });
    }

    async getReadme() {
        const readme = await findReadmeFile();
        console.log(readme);
        return readme;
    }
}