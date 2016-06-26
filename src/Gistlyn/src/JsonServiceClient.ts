export interface IReturnVoid {
}

export interface IReturn<T> {
}

export class JsonServiceClient
{
    baseUrl: string;
    constructor(baseUrl: string) { this.baseUrl = baseUrl; }

    get<T>(request: IReturn<T>): Promise<T> {
        console.log(request);
        return fetch("/").then(r => <T>null);
    }
}