import { IModel } from "../interfaces/IModel";
import { IModelRequestData } from "../interfaces/IModelRequestData";
import OpenAI from "openai";



class GPTService implements IModel {

    private model_name : string;
    private model_type : string;
    private data ? : Partial<IModelRequestData>;
    private openAI : any;

    constructor(model: string, data?: Partial<IModelRequestData>){
        this.model_name = model;
        this.model_type = "GPT";
        this.openAI = new OpenAI();// OpenAI client

        if(data){
            this.data = data;
        } 
    }

    //Check if it makes sense
    private build_prompt(prompt: string){
        // const promptParts = ['<context>'];
        const promptParts = [];
      
        if (this.data?.instructions) {
            promptParts.push('<instructions>');
            promptParts.push(this.data.instructions);
            promptParts.push('</instructions>');
        }
        
        if (this.data?.file_tree) {
            promptParts.push('<file_tree>');
            promptParts.push(this.data.file_tree);
            promptParts.push('</file_tree>');
        }
        
        if (this.data?.readme) {
            promptParts.push('<readme>');
            promptParts.push(this.data.readme);
            promptParts.push('</readme>');
        }
        
        if (this.data?.explanation) {
            promptParts.push('<explanation>');
            promptParts.push(this.data.explanation);
            promptParts.push('</explanation>');
        }
        
        if (this.data?.component_mapping) {
            promptParts.push('<component_mapping>');
            promptParts.push(this.data.component_mapping);
            promptParts.push('</component_mapping>');
        }
        
        promptParts.push('<user_request>');
        promptParts.push(prompt);
        promptParts.push('</user_request>');
        //promptParts.push('</context>');

        return promptParts.join('\n');
    }



    async generateResponse(prompt: string): Promise<string> {
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