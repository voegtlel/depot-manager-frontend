import { Inject, Injectable } from '@angular/core';
import { NB_AUTH_OPTIONS, NbAuthService, getDeepFromObject } from '@nebular/auth';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable()
export class HttpErrorHandler implements HttpInterceptor {
    private isLoggingOut = false;
    private loggedIn = false;

    constructor(
        private router: Router,
        private authService: NbAuthService,
        @Inject(NB_AUTH_OPTIONS) protected options = {}
    ) {
        // this.authService.onAuthenticationChange().subscribe((authenticated) => this.loggedIn = authenticated);
    }

    private logout() {
        if (this.isLoggingOut || !this.loggedIn) {
            return;
        }
        this.isLoggingOut = true;
        this.loggedIn = false;
        const originalUrl = this.router.routerState.snapshot.url;
        this.authService.logout(getDeepFromObject(this.options, 'forms.logout.strategy', null)).subscribe(() => {
            this.router.navigate(['/auth/login'], { queryParams: { returnUrl: originalUrl } });
            this.isLoggingOut = false;
        });
    }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(req).pipe(
            catchError(err => {
                if (err.status === 401) {
                    console.log('ERROR: Retrieved 401 unauthenticated. Logging out.');
                    // auto logout if 401 response returned from api
                    this.logout();
                    // noinspection JSDeprecatedSymbols
                    // location.reload(true);
                } else if (err.status === 403) {
                    console.log('ERROR: Retrieved 401 error. Reloading page.');
                    // noinspection JSDeprecatedSymbols
                    location.reload();
                }

                return throwError(err);
            })
        );
    }
}
