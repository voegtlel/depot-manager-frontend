import {HttpClient} from '@angular/common/http';

import {Observable} from 'rxjs';
import {Injectable} from '@angular/core';
import {AuthUserModel, Item, Reservation, UserModel} from '../_models';
import {NbAuthService} from '@nebular/auth';
import {EnvService} from './env.service';


@Injectable({
    providedIn: 'root'
})
export class ApiService {
    constructor(private http: HttpClient, private authService: NbAuthService, private env: EnvService) {
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

    createItems(item: Item): Observable<Item> {
        return this.http.post<Item>(`${this.env.apiUrl}/items`, item);
    }

    getItemTags(): Observable<string[]> {
        return this.http.get<string[]>(`${this.env.apiUrl}/items/tags`);
    }

    getItem(itemId: string): Observable<Item> {
        return this.http.get<Item>(`${this.env.apiUrl}/items/${itemId}`);
    }

    saveItem(itemId: string, item: Item): Observable<Item> {
        return this.http.patch<Item>(`${this.env.apiUrl}/items/${itemId}`, item);
    }

    getReservations(start?: string, end?: string, offset?: number, count?: number): Observable<Reservation[]> {
        const query = [];
        if (start) {
            query.push("start=" + start);
        }
        if (end) {
            query.push("end=" + end);
        }
        if (offset) {
            query.push("offset=" + offset);
        }
        if (count) {
            query.push("count=" + count);
        }
        let queryStr = "";
        if (query.length > 0) {
            queryStr = "?" + query.join('&')
        }
        return this.http.get<Reservation[]>(`${this.env.apiUrl}/reservations${queryStr}`);
    }

    getReservationItems(start: string, end: string, skipReservationId?: string): Observable<string[]> {
        let query = "?start=" + start + "&end=" + end;
        if (skipReservationId) {
            query += "&skipReservationId=" + skipReservationId;
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

    getPictureUrl(pictureId: string): string {
        return `${this.env.apiUrl}/pictures/${pictureId}/large`
    }

    getPicturePreviewUrl(pictureId: string): string {
        return `${this.env.apiUrl}/pictures/${pictureId}/preview`
    }
}
