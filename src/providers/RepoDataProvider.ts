import {findReadmeFile, getWorkspaceFileString} from '../services/RepositoryService';


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