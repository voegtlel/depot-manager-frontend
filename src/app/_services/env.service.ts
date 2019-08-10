import {Injectable} from '@angular/core';


export function getApiUrl(): string {
    const browserWindow = window || {};
    const browserWindowEnv = browserWindow['__env'] || {};
    if (browserWindowEnv.hasOwnProperty('apiUrl')) {
        return browserWindowEnv['apiUrl'];
    }
    return '/api';
}


@Injectable({
    providedIn: 'root'
})
export class EnvService {
    public readonly apiUrl: string;

    constructor() {
        this.apiUrl = getApiUrl();
    }
}
