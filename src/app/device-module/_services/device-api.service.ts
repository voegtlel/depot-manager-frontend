import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Bay, Item, Reservation, ReservationActionInWrite } from 'src/app/common-module/_models';
import { EnvService } from 'src/app/common-module/_services';

export interface CodeReservationData {
    reservation: Reservation;
    items: Item[];
    bays: Bay[];
}

@Injectable({
    providedIn: 'root',
})
export class DeviceApiService {
    constructor(private http: HttpClient, private env: EnvService) {}

    getBayState(bayId: string): Observable<{ open: boolean }> {
        return this.http.get<{ open: boolean }>(`${this.env.deviceApiUrl}/device/bays/${bayId}`);
    }

    getBayStates(): Observable<{ id: string; open: boolean }[]> {
        return this.http.get<{ id: string; open: boolean }[]>(`${this.env.deviceApiUrl}/device/bays`);
    }

    openBay(bayId: string): Observable<void> {
        return this.http.post<void>(`${this.env.deviceApiUrl}/device/bays/${bayId}/open`, null);
    }

    getCard(): Observable<{ redirectUri: string }> {
        return this.http.get<{ redirectUri: string }>(`${this.env.deviceApiUrl}/auth/card`);
    }

    registerCard(): Observable<{ cardId: string }> {
        return this.http.get<{ cardId: string }>(`${this.env.deviceApiUrl}/auth/card`);
    }

    getReservation(code: string): Observable<CodeReservationData> {
        return this.http.get<CodeReservationData>(`${this.env.deviceApiUrl}/depot/device/reservation`, {
            headers: { 'X-Reservation-Code': code },
        });
    }

    reservationAction(action: ReservationActionInWrite, code: string): Observable<void> {
        return this.http.put<void>(`${this.env.deviceApiUrl}/depot/device/reservation/action`, action, {
            headers: { 'X-Reservation-Code': code },
        });
    }
}
