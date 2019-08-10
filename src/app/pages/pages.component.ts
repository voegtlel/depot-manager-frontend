import {Component, OnInit} from '@angular/core';
import {ApiService, AuthService} from '../_services';
import {NbMenuItem} from '@nebular/theme';

@Component({
    selector: 'pages-root',
    templateUrl: './pages.component.html',
    styleUrls: ['./pages.component.css']
})
export class PagesComponent implements OnInit {
    public menuItems: NbMenuItem[] = [
        {
            title: 'Home',
            link: '/',
            icon: 'home'
        },
        {
            title: 'Create Reservation',
            link: '/reservation',
            icon: 'file-add'
        },
        {
            title: 'Logout',
            link: '/auth/logout',
            icon: 'log-out'
        }
    ];

    constructor(
        public authService: AuthService,
        public api: ApiService,
    ) {
    }

    ngOnInit() {
    }
}
