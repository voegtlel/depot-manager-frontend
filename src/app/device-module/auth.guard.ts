import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { tap } from 'rxjs/internal/operators/tap';
import { AuthService } from '../common-module/_services';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
    constructor(private router: Router, private authService: AuthService) {}

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        return this.authService.loggedIn$.pipe(
            tap((loggedIn) => {
                if (!loggedIn) {
                    this.router.navigate(['/']);
                }
            })
        );
    }
}
