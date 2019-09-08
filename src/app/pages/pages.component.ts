import {Component, OnInit} from '@angular/core';
import {ApiService, AuthService} from '../_services';
import {NbMenuItem, NbSidebarService} from '@nebular/theme';

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

    public headerItems: NbMenuItem[] = [
        {
            title: '',
            icon: 'menu',
            //action: () => {this.sidebarService.toggle(false, 'left');}
        }
    ];

    constructor(
        public authService: AuthService,
        public api: ApiService,
        private sidebarService: NbSidebarService,
    ) {
    }

    ngOnInit() {
    }
}
