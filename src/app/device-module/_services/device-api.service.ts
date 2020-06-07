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

    getCard(): Observable<{ cardId: string; token: string }> {
        return this.http.get<{ cardId: string; token: string }>(`${environment.deviceApiUrl}/card`);
    }
}
