import * as vscode from 'vscode';

export class ApiService {

    private _context : vscode.ExtensionContext;
    private model_type : string;
    private which_secret : string; // Which secret variable it will be stored that API Key.

    constructor(model_type : string , context: vscode.ExtensionContext){
        this.model_type = model_type;
        this.which_secret = this.model_type + "_api_key";
        this._context = context;
    }

    public async askSecret() {
        
        const apiKey = await vscode.window.showInputBox({
            prompt: 'Insert your API Key',
            placeHolder: 'AIzaSy...',
            password: true,
            ignoreFocusOut: true
        });

        if (apiKey) {
			// Saves the encrypted key
			await this._context.secrets.store(this.which_secret, apiKey);
			// vscode.window.showInformationMessage('API Key saved safely!');
		}
    }

    public async getSecret(){
        return await this._context.secrets.get(this.which_secret);
    }

    public async deleteSecret() {
        await this._context.secrets.delete(this.which_secret);
    }
}