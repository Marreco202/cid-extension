import { IModel } from "../interfaces/IModel";
import { IModelRequestData } from "../interfaces/IModelRequestData";
import OpenAI from "openai";



export class GPTService implements IModel {

    private model_name : string;
    private model_type : string;
    private data ? : Partial<IModelRequestData>;
    private api_key : string | undefined;
    private openAI : OpenAI;
    private base_url : string;

    constructor(data?: Partial<IModelRequestData>, api_key?: string) {
        // this.model_name = "o4-mini";
        this.model_name = "gpt-5-mini";
        this.model_type = "GPT";
        this.base_url = "https://api.openai.com/v1/chat/completions";

        this.api_key = api_key ?? process.env.OPENAI_API_KEY;
        
        if (!this.api_key) {
            throw new Error("OpenAI API key not found. Set OPENAI_API_KEY environment variable or pass it to constructor.");
        }
        
        this.openAI = new OpenAI({ apiKey: this.api_key });
        this.data = data;
    }

    //Builds the data part of the prompt
    private build_prompt(){
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

        return promptParts.join('\n');
    }

    private async call_o4_api(system_prompt : string, reasoning_effort : string) : Promise<string>{
        
        const user_message = this.build_prompt();
        const headers = {
            'Content-Type' : "application/json",
            Authorization: `Bearer ${this.api_key}`
        };


        // if (this.api_key === undefined){
        //     throw new Error("OpenAI API key is undefined");
        // }

        console.log(`call_o4_api data: ${this.data?.readme}`);

        const payload = {
            model: this.model_name,
            messages: [
                { role: "system", content: system_prompt },
                { role: "user", content: user_message }
            ],
            max_completion_tokens: 12000,
            stream: false,
            reasoning_effort: reasoning_effort, //TODO: may result on error using custom type as ReasoningEffort
        };

        let response;
        try {
            response = await fetch(this.base_url, {
                method: "POST",
                headers : headers,
                body : JSON.stringify(payload),
            });
        } catch (err) {
            throw new Error(`Failed to connect to the OpenAI API: ${String(err)}`);
        }

         if (!response.ok) {
            const errText = await response.text().catch(() => "<no body>");
            throw new Error(
                `OpenAI API returned status ${response.status}: ${errText}`
            );
        }

        let json: any;
        try {
            json = await response.json();
        } catch (err) {
            throw new Error(`Failed to parse OpenAI response JSON: ${String(err)}`);
        }

        const content =
            json?.choices?.[0]?.message?.content ??
            json?.choices?.[0]?.text ??
            json?.text ??
            null;
        
        if (!content) {
            // log the whole object for easier debugging
            const dumped = JSON.stringify(json, null, 2);
            throw new Error(
                `No content returned from OpenAI o4-mini. Full response:\n${dumped}`
            );
        }
        console.log(String(content));
        return String(content);
    }


    async generateResponse(prompt: string, reasoning_effort ?: string): Promise<string> {

        if(reasoning_effort){
            return this.call_o4_api(prompt,reasoning_effort);
        } else{
            throw new Error("Not passed reasoning_effort as parameter on OpenAI generateResponse call");
    }
}

    async streamChatResponse(prompt: string, reasoning_effort: string = "medium") {
    const system_prompt = this.data?.instructions || "You are a helpful assistant.";


    try {
        const payload: any = {
            model: this.model_name,
            messages: [
                { role: "system", content: prompt }
            ],
            max_completion_tokens: 12000,
            stream: true,
            reasoning_effort: reasoning_effort
        };

        const stream = await this.openAI.chat.completions.create(payload);
        return stream;
    } catch (err: any) {
        console.error("Error streaming from OpenAI API:", err);
        throw new Error(`Failed to stream response: ${err.message || err}`);
    }
}

    setData(data: Partial<IModelRequestData>) {
        this.data = data;
    }

    getModelName(): string {
        return this.model_type;
    }
    
}