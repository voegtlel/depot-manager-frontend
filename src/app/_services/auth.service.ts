import { Injectable } from '@angular/core';
import { shareReplay, switchMap } from 'rxjs/operators';
import { AuthUserModel } from '../_models';
import { ApiService } from './api.service';
import { NbAuthService } from '@nebular/auth';
import { of } from 'rxjs/internal/observable/of';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    public user$: Observable<AuthUserModel>;

    constructor(api: ApiService, authService: NbAuthService) {
        this.user$ = authService.isAuthenticated().pipe(
            switchMap(isAuthenticated => {
                if (isAuthenticated) {
                    console.log('isAuthenticated', api.getAuthSelf());
                    return api.getAuthSelf();
                }
                return of(null);
            }),
            shareReplay(1)
        );
    }
}
