import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

export function getApiUrl(): string {
    const browserWindow = window || {};
    const browserWindowEnv = browserWindow['__env'] || {};
    if (browserWindowEnv.hasOwnProperty('apiUrl')) {
        return browserWindowEnv.apiUrl;
    }
    return '/api';
}

@Injectable({
    providedIn: 'root',
})
export class EnvService {
    public readonly apiUrl: string;
    public readonly deviceApiUrl?: string;

    constructor() {
        this.apiUrl = getApiUrl();
        if (environment.onDevice) {
            this.deviceApiUrl = environment.deviceApiUrl;
        }
    }
}
