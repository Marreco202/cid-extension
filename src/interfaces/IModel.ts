import { IModelRequestData } from "./IModelRequestData";

export interface IModel {
    generateResponse(prompt: string): Promise<string>;
    setData(data: Partial<IModelRequestData>): void; //TODO: revisar partial.
}