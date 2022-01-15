import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DeviceAuthService } from '../../_services/device-auth.service';

@Component({
    templateUrl: './login-by-card.component.html',
    styleUrls: ['./login-by-card.component.scss'],
})
export class LoginByCardComponent implements OnInit, OnDestroy {
    private destroyed$ = new Subject<void>();

    errorMessage$: Observable<string>;

    constructor(private authService: DeviceAuthService, private router: Router) {
        this.errorMessage$ = authService.displayErrorMessage$;
        this.authService.logout();
        this.authService.requireLogin$.pipe(takeUntil(this.destroyed$)).subscribe(() => {
            console.log('Require registration');
            this.router.navigate(['auth', 'register']);
        });
        this.authService.token$.pipe(takeUntil(this.destroyed$)).subscribe((token) => {
            console.log('Logged in as', token);
            this.router.navigate(['/']);
        });
    }

    ngOnInit() {}

    ngOnDestroy() {
        this.destroyed$.next();
    }
}
