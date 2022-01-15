import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, delay, filter, map, shareReplay, skip, switchMap, tap } from 'rxjs/operators';
import { parseHttpError } from 'src/app/common-module/_helpers';
import { CodeReservationData, DeviceApiService } from './device-api.service';

@Injectable({
    providedIn: 'root',
})
export class DeviceCodeService {
    private _code$ = new BehaviorSubject<string | null | undefined>(null);

    public loggedIn$: Observable<boolean> = this._code$.pipe(map((code) => code != null));
    private _loggingIn$ = new BehaviorSubject<boolean>(false);
    public loggingIn$: Observable<boolean> = this._loggingIn$.asObservable();
    private _error$ = new BehaviorSubject<string>(null);
    public error$: Observable<string> = this._error$.asObservable();
    public code$ = this._code$.asObservable();

    private _reservation: CodeReservationData = null;
    public reservation$: Observable<CodeReservationData> = this._code$.pipe(
        tap(() => this._loggingIn$.next(true)),
        switchMap((code) =>
            code == null
                ? of(null)
                : this.deviceApi.getReservation(code).pipe(
                      catchError((err) => {
                          this._error$.next(parseHttpError(err));
                          return of(null);
                      })
                  )
        ),
        tap(() => this._loggingIn$.next(false)),
        tap((reservation) => (this._reservation = reservation)),
        shareReplay(1)
    );

    public get code(): string | null | undefined {
        return this._code$.value;
    }

    public set code(code: string | null | undefined) {
        this._code$.next(code);
    }

    public get reservation(): CodeReservationData {
        return this._reservation;
    }

    constructor(private deviceApi: DeviceApiService, private router: Router) {
        this.reservation$.pipe(skip(1)).subscribe((reservation) => {
            console.log('Reservation:', reservation);
            if (reservation == null) {
                router.navigate(['/']);
            } else {
                router.navigate(['/reservation']);
            }
        });
        this._error$
            .pipe(
                filter((error) => error != null),
                delay(10000)
            )
            .subscribe(() => this._error$.next(null));
    }

    login(code: string) {
        this.code = code;
    }

    logout() {
        this.code = null;
    }
}
