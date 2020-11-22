import { Component, OnInit, OnDestroy } from '@angular/core';
import { ApiService, AuthService } from '../../common-module/_services';
import { NbMenuItem, NbSidebarService, NbMenuService } from '@nebular/theme';
import { Router, NavigationStart } from '@angular/router';
import { filter, map, takeUntil } from 'rxjs/operators';
import { Subject, Observable, combineLatest } from 'rxjs';

@Component({
    selector: 'depot-pages-root',
    templateUrl: './pages.component.html',
    styleUrls: ['./pages.component.scss'],
})
export class PagesComponent implements OnDestroy {
    menuItems: NbMenuItem[] = [];

    menuItemsUser: NbMenuItem[] = [
        {
            title: 'Home',
            link: '/',
            home: true,
            icon: 'home',
        },
        {
            title: 'Reservations',
            link: '/reservations',
            icon: 'calendar',
        },
        {
            title: 'Logout',
            link: '/logout',
            icon: 'log-out',
        },
    ];

    menuItemsManager: NbMenuItem[] = [
        {
            title: 'Home',
            link: '/',
            home: true,
            icon: 'home',
        },
        {
            title: 'Reservations',
            link: '/reservations',
            icon: 'calendar',
        },
        {
            title: 'Items',
            link: '/items',
            icon: 'cube',
        },
        {
            title: 'Logout',
            link: '/logout',
            icon: 'log-out',
        },
    ];

    menuItemsAdmin: NbMenuItem[] = [
        {
            title: 'Home',
            link: '/',
            home: true,
            icon: 'home',
        },
        {
            title: 'Reservations',
            link: '/reservations',
            icon: 'calendar',
        },
        {
            title: 'Items',
            link: '/items',
            icon: 'cube',
        },
        {
            title: 'Bays',
            link: '/bays',
            icon: 'briefcase',
        },
        {
            title: 'Logout',
            link: '/logout',
            icon: 'log-out',
        },
    ];

    destroyed$: Subject<void> = new Subject();
    loggedIn$: Observable<boolean>;
    name$: Observable<string>;

    constructor(
        private authService: AuthService,
        public sidebarService: NbSidebarService,
        public menuService: NbMenuService,
        public router: Router
    ) {
        this.loggedIn$ = authService.loggedIn$;
        this.name$ = authService.user$.pipe(
            filter((user) => !!user),
            map((user) => user.given_name)
        );
        combineLatest([authService.isAdmin$, authService.isManager$])
            .pipe(takeUntil(this.destroyed$))
            .subscribe(([isAdmin, isManager]) => {
                if (isAdmin) {
                    this.menuItems = this.menuItemsAdmin;
                } else if (isManager) {
                    this.menuItems = this.menuItemsManager;
                } else {
                    this.menuItems = this.menuItemsUser;
                }
            });
        this.loggedIn$.pipe(takeUntil(this.destroyed$)).subscribe((loggedIn) => {
            if (loggedIn) {
                sidebarService.expand('left');
            } else {
                sidebarService.collapse('left');
            }
        });

        // Fix menu hightlighting
        router.events
            .pipe(filter((event) => event instanceof NavigationStart))
            .pipe(takeUntil(this.destroyed$))
            .subscribe((event: NavigationStart) => {
                this.fixSelectMenuItem(event.url);
            });
    }

    fixSelectMenuItem(url: string) {
        this.menuItems.forEach((menuItem) => {
            menuItem.selected = menuItem.link === url;
        });
    }

    ngOnDestroy() {
        this.destroyed$.next();
    }

    get backDisabled(): boolean {
        return false;
    }

    back() {
        console.log('Back');
    }

    logout() {
        this.authService.logout();
    }

    login() {
        this.authService.login();
    }
}
