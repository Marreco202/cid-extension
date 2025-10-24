import { IModel } from "../interfaces/IModel";
import { IModelRequestData } from "../interfaces/IModelRequestData";



class GPTService implements IModel {

    private model_name : string;
    private model_type : string;
    private data ? : Partial<IModelRequestData>;

    constructor(model: string, data?: Partial<IModelRequestData>){
        this.model_name = model;
        this.model_type = "GPT";

        if(data){
            this.data = data;
        } 
    }

    private build_prompt(prompt: string){

    }

    async generateResponse(prompt: string): Promise<string> {
        //Makes API response
        return "General Kenobi!";
    }

    streamChatResponse(prompt: string) {
        
    }

    setData(data: Partial<IModelRequestData>): void {
        
    }

    getModelName(): string {
        return "Hello there!";
    }
    
}