import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import {
    AuthUserModel,
    Item,
    Reservation,
    ItemInWrite,
    Picture,
    ItemState,
    Bay,
    UserModel,
    ReportItemInWrite,
    ReportElement,
    ReportElementInWrite,
    ReportProfile,
    ReportProfileInWrite,
} from '../_models';
import { EnvService } from './env.service';
import { OAuthService } from 'angular-oauth2-oidc';

@Injectable({
    providedIn: 'root',
})
export class ApiService {
    constructor(private http: HttpClient, private env: EnvService, private oauthService: OAuthService) {}

    authByCardId(cardToken: string): Observable<{ token: string; user: AuthUserModel }> {
        return this.http.post<{ token: string; user: AuthUserModel }>(
            `${this.env.apiUrl}/jwt-auth-card`,
            {},
            {
                headers: { Authorization: `Bearer ${cardToken}` },
            }
        );
    }

    getUser(userId: string): Observable<UserModel> {
        return this.http.get<UserModel>(`${this.env.oicdIssuer}/profiles/${userId}`, {
            headers: { authorization: `Bearer ${this.oauthService.getAccessToken()}` },
        });
    }

    getUsers(): Observable<UserModel[]> {
        return this.http.get<UserModel[]>(`${this.env.oicdIssuer}/profiles`, {
            headers: { authorization: `Bearer ${this.oauthService.getAccessToken()}` },
        });
    }

    getItems(allItems: boolean = false): Observable<Item[]> {
        return this.http.get<Item[]>(`${this.env.apiUrl}/items${allItems ? '?all=true' : ''}`);
    }

    createItem(item: ReportItemInWrite): Observable<Item> {
        return this.http.post<Item>(`${this.env.apiUrl}/items`, item);
    }

    getItem(itemId: string): Observable<Item> {
        return this.http.get<Item>(`${this.env.apiUrl}/items/${itemId}`);
    }

    saveItem(itemId: string, item: ItemInWrite): Observable<Item> {
        return this.http.put<Item>(`${this.env.apiUrl}/items/${itemId}`, item);
    }

    reportItem(itemId: string, item: ReportItemInWrite): Observable<Item> {
        return this.http.put<Item>(`${this.env.apiUrl}/items/${itemId}/report`, item);
    }

    getReportElements(): Observable<ReportElement[]> {
        return this.http.get<ReportElement[]>(`${this.env.apiUrl}/report-elements`);
    }

    createReportElement(element: ReportElementInWrite): Observable<ReportElement> {
        return this.http.post<ReportElement>(`${this.env.apiUrl}/report-elements`, element);
    }

    getReportElement(id: string): Observable<ReportElement> {
        return this.http.get<ReportElement>(`${this.env.apiUrl}/report-elements/${id}`);
    }

    saveReportElement(id: string, element: ReportElementInWrite): Observable<ReportElement> {
        return this.http.put<ReportElement>(`${this.env.apiUrl}/report-elements/${id}`, element);
    }

    deleteReportElement(id: string): Observable<void> {
        return this.http.delete<void>(`${this.env.apiUrl}/report-elements/${id}`);
    }

    getReportProfiles(): Observable<ReportProfile[]> {
        return this.http.get<ReportProfile[]>(`${this.env.apiUrl}/report-profiles`);
    }

    createReportProfile(profile: ReportProfileInWrite): Observable<ReportProfile> {
        return this.http.post<ReportProfile>(`${this.env.apiUrl}/report-profiles`, profile);
    }

    getReportProfile(id: string): Observable<ReportProfile> {
        return this.http.get<ReportProfile>(`${this.env.apiUrl}/report-profiles/${id}`);
    }

    saveReportProfile(id: string, profile: ReportProfileInWrite): Observable<ReportProfile> {
        return this.http.put<ReportProfile>(`${this.env.apiUrl}/report-profiles/${id}`, profile);
    }

    deleteReportProfile(id: string): Observable<void> {
        return this.http.delete<void>(`${this.env.apiUrl}/report-profiles/${id}`);
    }

    getBays(): Observable<Bay[]> {
        return this.http.get<Bay[]>(`${this.env.apiUrl}/bays`);
    }

    createBay(bay: Bay): Observable<Bay> {
        return this.http.post<Bay>(`${this.env.apiUrl}/bays`, bay);
    }

    getBay(bayId: string): Observable<Bay> {
        return this.http.get<Bay>(`${this.env.apiUrl}/bays/${bayId}`);
    }

    saveBay(bayId: string, bay: Bay): Observable<Bay> {
        return this.http.put<Bay>(`${this.env.apiUrl}/bays/${bayId}`, bay);
    }

    getItemHistory(
        itemId: string,
        {
            start,
            end,
            offset,
            limit,
            limitBeforeStart,
            limitAfterEnd,
        }: {
            start?: string;
            end?: string;
            offset?: number;
            limit?: number;
            limitBeforeStart?: number;
            limitAfterEnd?: number;
        }
    ): Observable<ItemState[]> {
        const query = [];
        if (start) {
            query.push('start=' + start);
        }
        if (end) {
            query.push('end=' + end);
        }
        if (offset) {
            query.push('offset=' + offset);
        }
        if (limit) {
            query.push('limit=' + limit);
        }
        if (limitBeforeStart) {
            query.push('limit_before_start=' + limitBeforeStart);
        }
        if (limitAfterEnd) {
            query.push('limit_after_end=' + limitAfterEnd);
        }
        let queryStr = '';
        if (query.length > 0) {
            queryStr = '?' + query.join('&');
        }
        return this.http.get<ItemState[]>(`${this.env.apiUrl}/items/${itemId}/history${queryStr}`);
    }

    getReservations({
        start,
        end,
        offset,
        limit,
        limitBeforeStart,
        limitAfterEnd,
        itemId,
    }: {
        start?: string;
        end?: string;
        offset?: number;
        limit?: number;
        limitBeforeStart?: number;
        limitAfterEnd?: number;
        itemId?: string;
    }): Observable<Reservation[]> {
        const query = [];
        if (start) {
            query.push('start=' + start);
        }
        if (end) {
            query.push('end=' + end);
        }
        if (offset) {
            query.push('offset=' + offset);
        }
        if (limit) {
            query.push('limit=' + limit);
        }
        if (limitBeforeStart) {
            query.push('limit_before_start=' + limitBeforeStart);
        }
        if (limitAfterEnd) {
            query.push('limit_after_end=' + limitAfterEnd);
        }
        if (itemId) {
            query.push('item_id=' + itemId);
        }
        let queryStr = '';
        if (query.length > 0) {
            queryStr = '?' + query.join('&');
        }
        return this.http.get<Reservation[]>(`${this.env.apiUrl}/reservations${queryStr}`);
    }

    getReservationItems(start: string, end: string, skipReservationId?: string): Observable<string[]> {
        let query = '?start=' + start + '&end=' + end;
        if (skipReservationId) {
            query += '&skip_reservation_id=' + skipReservationId;
        }
        return this.http.get<string[]>(`${this.env.apiUrl}/reservations/items${query}`);
    }

    createReservation(reservation: Reservation): Observable<Reservation> {
        return this.http.post<Reservation>(`${this.env.apiUrl}/reservations`, reservation, {
            headers: { authorization: `Bearer ${this.oauthService.getIdToken()}` },
        });
    }

    getReservation(reservationId: string): Observable<Reservation> {
        return this.http.get<Reservation>(`${this.env.apiUrl}/reservations/${reservationId}`);
    }

    saveReservation(reservationId: string, reservation: Reservation): Observable<Reservation> {
        return this.http.put<Reservation>(`${this.env.apiUrl}/reservations/${reservationId}`, reservation);
    }

    deleteReservation(reservationId: string): Observable<Reservation> {
        return this.http.delete<Reservation>(`${this.env.apiUrl}/reservations/${reservationId}`);
    }

    getPictures(): Observable<Picture[]> {
        return this.http.get<Picture[]>(`${this.env.apiUrl}/pictures`);
    }

    createPicture(data: Blob): Observable<string> {
        const originalFilename = data instanceof File ? data.name : null;
        return this.http.post<string>(`${this.env.apiUrl}/pictures`, data, {
            headers: { 'Content-Type': data.type, 'X-Original-Filename': originalFilename },
        });
    }

    getPictureUrl(pictureId: string): string {
        return `${this.env.apiUrl}/pictures/${pictureId}/large`;
    }

    getPicturePreviewUrl(pictureId: string): string {
        return `${this.env.apiUrl}/pictures/${pictureId}/preview`;
    }
}
