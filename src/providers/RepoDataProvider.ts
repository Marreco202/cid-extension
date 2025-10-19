import * as vscode from 'vscode';
import {getWorkspaceFileString} from '../services/RepositoryService';

export class RepoDataProvider {

    async getWorkspaceFileList() {
        const dir = '.';
        const promise = getWorkspaceFileString(dir);

        promise.then((data) =>{
            console.log(data);
        });
    }
}