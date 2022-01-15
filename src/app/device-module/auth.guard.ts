import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { tap } from 'rxjs/operators';
import { DeviceCodeService } from './_services/device-code.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
    constructor(private router: Router, private codeService: DeviceCodeService) {}

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        return this.codeService.loggedIn$.pipe(
            tap((loggedIn) => {
                if (!loggedIn) {
                    this.router.navigate(['/']);
                }
            })
        );
    }
}
