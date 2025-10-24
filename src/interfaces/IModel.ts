import { IModelRequestData } from "./IModelRequestData";

export interface IModel {
    generateResponse(prompt: string, reasoning_effort ?: string): Promise<string>;
    streamChatResponse(prompt: string): any;
    setData(data: Partial<IModelRequestData>): void; //TODO: revisar partial.
    getModelName(): string;
}