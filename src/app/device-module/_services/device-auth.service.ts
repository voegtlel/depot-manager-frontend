import { Injectable, OnDestroy } from '@angular/core';
import { ApiService } from '../../common-module/_services/api.service';
import {
    switchMap,
    map,
    takeUntil,
    catchError,
    distinctUntilChanged,
    tap,
    shareReplay,
    filter,
    delay,
} from 'rxjs/operators';
import { Observable, BehaviorSubject, Subject, of } from 'rxjs';
import { DeviceApiService } from './device-api.service';
import { NbTokenService, NbAuthJWTToken, NbAuthService } from '@nebular/auth';
import { AuthUserModel } from '../../common-module/_models';

const tickInterval = 250;

@Injectable({
    providedIn: 'root',
})
export class DeviceAuthService implements OnDestroy {
    private destroyed$ = new Subject<void>();
    private loggedOut$ = new BehaviorSubject<boolean>(true);
    private cardData$ = new BehaviorSubject<{ cardId: string; token: string }>(null);
    private unknownCard$ = new Subject<{ cardId: string }>();
    private checkCard$ = new Subject<void>();
    private errorMessage$ = new Subject<string>();

    public readonly requireLogin$: Observable<{ cardId: string }> = this.unknownCard$;
    public readonly displayErrorMessage$: Observable<string> = this.errorMessage$;

    constructor(
        api: ApiService,
        deviceApi: DeviceApiService,
        tokenService: NbTokenService,
        authService: NbAuthService
    ) {
        authService
            .onTokenChange()
            .pipe(takeUntil(this.destroyed$))
            .subscribe(token => {
                if (!token && !this.loggedOut$.value) {
                    this.loggedOut$.next(true);
                }
            });
        // Check card every `tickInterval` seconds.
        const cardChecker$ = this.checkCard$.pipe(
            switchMap(() =>
                deviceApi.getCard().pipe(
                    catchError(err => {
                        const errMsg = err ? (err.status === 0 ? 'Service offline' : err.statusText) : 'Unknown error';
                        this.errorMessage$.next(`Error on checking card: ${errMsg}`);
                        return of(null).pipe(delay(5000 - tickInterval));
                    }),
                    map(cardData => (cardData && cardData.cardId ? cardData : null))
                )
            ),
            shareReplay(1)
        );
        cardChecker$.pipe(delay(tickInterval), takeUntil(this.destroyed$)).subscribe(() => {
            this.checkCard$.next();
        });

        cardChecker$
            .pipe(
                distinctUntilChanged(
                    (x, y) => x === y,
                    cardData => (cardData ? cardData.cardId : null)
                ),
                takeUntil(this.destroyed$)
            )
            .subscribe(this.cardData$);
        this.cardData$.subscribe(cardData => console.log('Next data:', cardData));
        this.cardData$.pipe(map(data => !data)).subscribe(this.loggedOut$);
        this.cardData$
            .pipe(
                switchMap(cardData =>
                    cardData
                        ? api.authByCardId(cardData.token).pipe(
                              tap(({ token }) => tokenService.set(new NbAuthJWTToken(token, 'email'))),
                              map(({ user }: { user: AuthUserModel }) => user),
                              catchError(err => {
                                  if (err.status === 401) {
                                      this.unknownCard$.next({ cardId: cardData.cardId });
                                      return of(null);
                                  } else {
                                      const errMsg = err
                                          ? err.status === 0
                                              ? 'Service offline'
                                              : err.statusText
                                          : 'Unknown error';
                                      this.errorMessage$.next(`Error on authorization: ${errMsg}`);
                                  }
                                  return of(null).pipe(delay(5000 - tickInterval));
                              })
                          )
                        : of(null)
                ),
                shareReplay(1),
                takeUntil(this.destroyed$)
            )
            .subscribe();
        this.unknownCard$.subscribe(({ cardId }) => {
            // TODO: Redirect to login page.
            console.log('Login for card', cardId);
        });

        this.errorMessage$
            .pipe(
                filter(m => !!m),
                delay(5000)
            )
            .subscribe(() => this.errorMessage$.next(null));

        this.errorMessage$.subscribe(msg => {
            console.log('Error message:', msg);
        });

        this.checkCard$.next();
    }

    logout() {
        this.cardData$.next(null);
    }

    ngOnDestroy() {
        this.checkCard$.complete();
        this.destroyed$.next();
    }
}
