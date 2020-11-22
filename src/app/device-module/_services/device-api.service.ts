import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class DeviceApiService {
    constructor(private http: HttpClient) {}

    getBayState(bayId: string): Observable<{ open: boolean }> {
        return this.http.get<{ open: boolean }>(`${environment.deviceApiUrl}/bays/${bayId}`);
    }

    openBay(bayId: string): Observable<void> {
        return this.http.post<void>(`${environment.deviceApiUrl}/bays/${bayId}/open`, null);
    }

    getCard(): Observable<{ redirectUri: string }> {
        return this.http.get<{ redirectUri: string }>(`${environment.deviceApiUrl}/card`);
    }

    registerCard(): Observable<{ cardId: string }> {
        return this.http.get<{ cardId: string }>(`${environment.deviceApiUrl}/card`);
    }
}
