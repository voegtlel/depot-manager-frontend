import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { filter, map, startWith, switchMap, take, tap } from 'rxjs/operators';
import { DeviceCodeService } from '../_services/device-code.service';

@Component({
    selector: 'depot-pages',
    templateUrl: './pages.component.html',
    styleUrls: ['./pages.component.scss'],
})
export class PagesComponent implements OnDestroy {
    destroyed$: Subject<void> = new Subject();
    loggedIn$: Observable<boolean>;
    name$: Observable<string>;

    back$: Observable<any>;
    lastRoute$: Observable<ActivatedRoute>;

    constructor(private deviceCode: DeviceCodeService, public router: Router, public activatedRoute: ActivatedRoute) {
        this.loggedIn$ = deviceCode.loggedIn$;
        this.lastRoute$ = this.router.events.pipe(
            tap((e) => console.log('RouterEvent', e)),
            filter((routerEvent) => routerEvent instanceof NavigationEnd),
            tap(() => console.log('NavigationEnd')),
            map(() => this.activatedRoute.root),
            startWith(this.activatedRoute.root),
            map((node) => {
                while (node.firstChild) {
                    node = node.firstChild;
                }
                return node;
            })
        );
        this.back$ = this.lastRoute$.pipe(
            switchMap((route) => route.data),
            map((data) => data?.back)
        );
    }

    async back() {
        const back = await this.lastRoute$.pipe(take(1)).toPromise();
        const data = await back.data.pipe(take(1)).toPromise();
        if (back && data?.back) {
            this.router.navigate(data.back, { relativeTo: back });
        }
    }

    ngOnDestroy() {
        this.destroyed$.next();
    }

    logout() {
        this.deviceCode.logout();
        this.router.navigate(['/']);
    }
}
