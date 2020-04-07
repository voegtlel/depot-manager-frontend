import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { AuthUserModel, Item, Reservation, ItemWithComment, Picture, ItemState, Bay, UserModel } from '../_models';
import { NbAuthService } from '@nebular/auth';
import { EnvService } from './env.service';

@Injectable({
    providedIn: 'root',
})
export class ApiService {
    constructor(private http: HttpClient, private authService: NbAuthService, private env: EnvService) {}

    authByCardId(cardToken: string): Observable<{ token: string; user: AuthUserModel }> {
        return this.http.post<{ token: string; user: AuthUserModel }>(
            `${this.env.apiUrl}/jwt-auth-card`,
            {},
            {
                headers: { Authorization: `Bearer ${cardToken}` },
            }
        );
    }

    getAuthSelf(): Observable<AuthUserModel> {
        return this.http.get<AuthUserModel>(`${this.env.apiUrl}/auth`);
    }

    getUser(userId: string): Observable<UserModel> {
        return this.http.get<UserModel>(`${this.env.apiUrl}/user/${userId}`);
    }

    getItems(): Observable<Item[]> {
        return this.http.get<Item[]>(`${this.env.apiUrl}/items`);
    }

    createItem(item: Item): Observable<Item> {
        return this.http.post<Item>(`${this.env.apiUrl}/items`, item);
    }

    getItem(itemId: string): Observable<Item> {
        return this.http.get<Item>(`${this.env.apiUrl}/items/${itemId}`);
    }

    saveItem(itemId: string, item: ItemWithComment): Observable<Item> {
        return this.http.patch<Item>(`${this.env.apiUrl}/items/${itemId}`, item);
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
        return this.http.patch<Bay>(`${this.env.apiUrl}/bays/${bayId}`, bay);
    }

    getItemHistory(
        itemId: string,
        start?: string,
        end?: string,
        offset?: number,
        count?: number,
        countBeforeStart?: number,
        countAfterEnd?: number
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
        if (count) {
            query.push('count=' + count);
        }
        if (countBeforeStart) {
            query.push('count_before_start=' + countBeforeStart);
        }
        if (countAfterEnd) {
            query.push('count_after_end=' + countAfterEnd);
        }
        let queryStr = '';
        if (query.length > 0) {
            queryStr = '?' + query.join('&');
        }
        return this.http.get<ItemState[]>(`${this.env.apiUrl}/items/${itemId}/history${queryStr}`);
    }

    getReservations(
        start?: string,
        end?: string,
        offset?: number,
        count?: number,
        countBeforeStart?: number,
        countAfterEnd?: number,
        itemId?: string
    ): Observable<Reservation[]> {
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
        if (count) {
            query.push('count=' + count);
        }
        if (countBeforeStart) {
            query.push('count_before_start=' + countBeforeStart);
        }
        if (countAfterEnd) {
            query.push('count_after_end=' + countAfterEnd);
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
            query += '&skipReservationId=' + skipReservationId;
        }
        return this.http.get<string[]>(`${this.env.apiUrl}/reservations/items${query}`);
    }

    createReservation(reservation: Reservation): Observable<Reservation> {
        return this.http.post<Reservation>(`${this.env.apiUrl}/reservations`, reservation);
    }

    getReservation(reservationId: string): Observable<Reservation> {
        return this.http.get<Reservation>(`${this.env.apiUrl}/reservations/${reservationId}`);
    }

    saveReservation(reservationId: string, reservation: Reservation): Observable<Reservation> {
        return this.http.patch<Reservation>(`${this.env.apiUrl}/reservations/${reservationId}`, reservation);
    }

    deleteReservation(reservationId: string, reservation: Reservation): Observable<Reservation> {
        return this.http.patch<Reservation>(`${this.env.apiUrl}/reservations/${reservationId}`, reservation);
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
