import { Component, OnDestroy } from '@angular/core';
import { interval, Observable, Subject } from 'rxjs';
import { map, switchMap, takeUntil } from 'rxjs/operators';
import { DeviceApiService } from '../../_services/device-api.service';
import { DeviceCodeService } from '../../_services/device-code.service';

@Component({
    templateUrl: './login-code.component.html',
    styleUrls: ['./login-code.component.scss'],
})
export class LoginCodeComponent implements OnDestroy {
    destroyed$ = new Subject<void>();

    code = '';

    get loading$(): Observable<boolean> {
        return this.deviceCode.loggingIn$;
    }

    get error$(): Observable<string> {
        return this.deviceCode.error$;
    }

    get isFull(): boolean {
        return this.code.length >= 6;
    }

    get needMore(): boolean {
        return this.code.length < 6;
    }

    get isEmpty(): boolean {
        return this.code.length === 0;
    }

    mustCloseBays$ = interval(250).pipe(
        switchMap(() => this.deviceApi.getBayStates()),
        map((states) => states.filter((state) => state.open)),
        map((openStates) => (openStates.length ? openStates.map((state) => state.id).join(', ') : null)),
        takeUntil(this.destroyed$)
    );

    constructor(private deviceCode: DeviceCodeService, private deviceApi: DeviceApiService) {}

    ngOnDestroy() {
        this.destroyed$.next();
        this.destroyed$.complete();
    }

    onClick(num: number) {
        if (this.code.length < 6) {
            this.code += num.toString();
        }
    }

    onClear() {
        this.code = '';
    }

    onLogin() {
        console.log('Logging in with', this.code);
        this.deviceCode.login(this.code);
    }

    onUndo() {
        this.code = this.code.substr(0, this.code.length - 1);
    }
}
