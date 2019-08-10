import {Injectable} from '@angular/core';
import {switchMap} from 'rxjs/operators';
import {AuthUserModel} from '../_models';
import {shareLast} from '../_helpers';
import {ApiService} from './api.service';
import {NbAuthService} from '@nebular/auth';
import {of} from 'rxjs/internal/observable/of';
import {Observable, Subject} from 'rxjs';


@Injectable({
    providedIn: 'root'
})
export class AuthService {
    public user$: Observable<AuthUserModel>;

    constructor(private api: ApiService, private authService: NbAuthService) {
        this.user$ = shareLast(authService.isAuthenticated().pipe(switchMap(
            (isAuthenticated) => {
                if (isAuthenticated) {
                    console.log("isAuthenticated", api.getAuthSelf());
                    return api.getAuthSelf();
                }
                return of(null);
            }
        )));
    }
}
