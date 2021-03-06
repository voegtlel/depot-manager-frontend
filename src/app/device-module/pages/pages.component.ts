import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService, ApiService } from '../../common-module/_services';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { takeUntil, map, switchMap, filter } from 'rxjs/operators';
import { Subject, combineLatest } from 'rxjs';

@Component({
    selector: 'depot-pages',
    templateUrl: './pages.component.html',
    styleUrls: ['./pages.component.scss'],
})
export class PagesComponent implements OnInit, OnDestroy {
    private destroyed$ = new Subject<void>();

    backDisabled: boolean;
    absolutePath: string[];

    constructor(
        public authService: AuthService,
        public api: ApiService,
        private router: Router,
        route: ActivatedRoute
    ) {
        this.router.events
            .pipe(
                takeUntil(this.destroyed$),
                filter((event) => event instanceof NavigationEnd),
                switchMap(() => {
                    let innerChild = route.firstChild;
                    while (innerChild.firstChild) {
                        innerChild = innerChild.firstChild;
                    }
                    return combineLatest([innerChild.data, innerChild.params]).pipe(
                        map(([{ backref }, params]) => ({ backref, params }))
                    );
                }),
                takeUntil(this.destroyed$)
            )
            .subscribe(({ backref, params }: { backref?: string[]; params: Record<string, string> }) => {
                if (backref) {
                    this.backDisabled = false;
                    const path = [];
                    for (const part of backref) {
                        if (part === '..') {
                            path.pop();
                        } else if (part.startsWith(':')) {
                            path.push(params[part.substr(1)]);
                        } else {
                            path.push(part);
                        }
                    }
                    this.absolutePath = path;
                } else {
                    this.backDisabled = true;
                }
            });
    }

    ngOnInit() {}

    ngOnDestroy() {
        this.destroyed$.next();
    }

    back() {
        this.router.navigate(this.absolutePath);
    }

    logout() {
        this.authService.logout();
    }
}
