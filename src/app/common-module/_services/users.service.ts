import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { switchMap, tap, shareReplay } from 'rxjs/operators';
import { Observable, BehaviorSubject, of, throwError } from 'rxjs';
import { UserModel } from '../_models';
import { AuthService } from './auth.service';

@Injectable({
    providedIn: 'root',
})
export class UsersService {
    private _reload$ = new BehaviorSubject<void>(undefined);
    private _usersById: Record<string, UserModel> = Object.create(null);
    private _usersFetch: Record<string, Observable<UserModel>> = Object.create(null);
    private _allUsers$?: Observable<UserModel[]>;

    constructor(private api: ApiService, authService: AuthService) {
        authService.user$.subscribe((user) => (this._usersById[user.sub] = user));
    }

    getUser(userId: string): Observable<UserModel> {
        if (Object.hasOwnProperty.call(this._usersById, userId)) {
            if (this._usersById[userId] == null) {
                return throwError({ detail: 'Unknown User' });
            }
            return of(this._usersById[userId]);
        } else if (Object.hasOwnProperty.call(this._usersFetch, userId)) {
            return this._usersFetch[userId];
        } else if (this._allUsers$ != null) {
            return this._allUsers$.pipe(
                switchMap(() => this.getUser(userId)),
                shareReplay(1)
            );
        } else {
            return (this._usersFetch[userId] = this.api.getUser(userId).pipe(
                tap((user) => (this._usersById[user.sub] = user)),
                shareReplay(1)
            ));
        }
    }

    allUsers(): Observable<UserModel[]> {
        if (this._allUsers$ == null) {
            this._allUsers$ = this._reload$.pipe(
                switchMap(() => this.api.getUsers()),
                tap((users) => users.forEach((user) => (this._usersById[user.sub] = user))),
                shareReplay(1)
            );
        }
        return this._allUsers$;
    }

    reload() {
        this._reload$.next();
        this._usersById = Object.create(null);
        this._usersFetch = Object.create(null);
        this._allUsers$ = null;
    }
}
