import { Component, OnInit } from '@angular/core';
import { ApiService, AuthService } from '../_services';
import { NbMenuItem, NbSidebarService } from '@nebular/theme';

@Component({
    selector: 'depot-pages-root',
    templateUrl: './pages.component.html',
    styleUrls: ['./pages.component.css'],
})
export class PagesComponent implements OnInit {
    menuItems: NbMenuItem[] = [
        {
            title: 'Home',
            link: '/',
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
            link: '/auth/logout',
            icon: 'log-out',
        },
    ];

    headerItems: NbMenuItem[] = [
        {
            title: '',
            icon: 'menu',
            // action: () => {this.sidebarService.toggle(false, 'left');}
        },
    ];

    constructor(public authService: AuthService, public api: ApiService, public sidebarService: NbSidebarService) {}

    ngOnInit() {}
}
