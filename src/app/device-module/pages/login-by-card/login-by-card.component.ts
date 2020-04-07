import { Component, OnInit, OnDestroy } from '@angular/core';
import { DeviceAuthService } from '../../_services/device-auth.service';
import { takeUntil } from 'rxjs/operators';
import { Subject, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { NbAuthService } from '@nebular/auth';

@Component({
    selector: 'depot-login-by-card',
    templateUrl: './login-by-card.component.html',
    styleUrls: ['./login-by-card.component.scss'],
})
export class LoginByCardComponent implements OnInit, OnDestroy {
    private destroyed$ = new Subject<void>();

    errorMessage$: Observable<string>;

    constructor(private authService: DeviceAuthService, private nbAuthService: NbAuthService, private router: Router) {
        this.errorMessage$ = authService.displayErrorMessage$;
        this.authService.logout();
        this.authService.requireLogin$.pipe(takeUntil(this.destroyed$)).subscribe(() => {
            console.log('Require registration');
            this.router.navigate(['auth', 'register']);
        });
        this.nbAuthService
            .onTokenChange()
            .pipe(takeUntil(this.destroyed$))
            .subscribe(token => {
                console.log('Logged in as', token);
                this.router.navigate(['/']);
            });
    }

    ngOnInit() {}

    ngOnDestroy() {
        this.destroyed$.next();
    }
}
