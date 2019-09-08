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

    saveItem(item: Item): Observable<Item> {
        return this.http.patch<Item>(`${this.env.apiUrl}/items/${item.id}`, item);
    }

    getReservations(start?: Date, end?: Date): Observable<Reservation[]> {
        let query = "";
        if (start) {
            query = "&start=" + start.toISOString().substring(0, 10);
            if (end) {
                query += "&end=" + end.toISOString().substring(0, 10);
            }
        }  else if (end) {
            query = "&end=" + end.toISOString().substring(0, 10);
        }
        return this.http.get<Reservation[]>(`${this.env.apiUrl}/reservations${query}`);
    }

    createReservations(reservation: Reservation): Observable<Reservation> {
        return this.http.post<Reservation>(`${this.env.apiUrl}/reservations`, reservation);
    }

    getReservation(reservationId: string): Observable<Reservation> {
        return this.http.get<Reservation>(`${this.env.apiUrl}/reservations/${reservationId}`);
    }

    saveReservation(reservation: Reservation): Observable<Reservation> {
        return this.http.patch<Reservation>(`${this.env.apiUrl}/reservations/${reservation.id}`, reservation);
    }

    deleteReservation(reservation: Reservation): Observable<Reservation> {
        return this.http.patch<Reservation>(`${this.env.apiUrl}/reservations/${reservation.id}`, reservation);
    }

    getPictureUrl(pictureId: string): string {
        return `${this.env.apiUrl}/pictures/${pictureId}/large`
    }

    getPicturePreviewUrl(pictureId: string): string {
        return `${this.env.apiUrl}/pictures/${pictureId}/preview`
    }
}