import {RouterModule, Routes} from '@angular/router';

import {HomeComponent} from './pages/home/home.component';
import {AuthGuard} from './_guards';
import {NbAuthComponent, NbLogoutComponent} from '@nebular/auth';
import {PagesComponent} from './pages/pages.component';
import {LoginComponent} from './auth/login/login.component';
import {ReservationComponent} from "./pages/reservation/reservation.component";


const appRoutes: Routes = [
    {
        path: '',
        canActivate: [AuthGuard],
        component: PagesComponent,
        children: [
            {
                path: '',
                component: HomeComponent,
            },
            {
                path: 'reservation',
                component: ReservationComponent,
            },
            {
                path: 'reservation/:reservationId',
                component: ReservationComponent,
            },
        ]
    },

    {
        path: 'auth',
        component: NbAuthComponent,
        children: [
            {
                path: '',
                component: LoginComponent,
            },
            {
                path: 'login',
                component: LoginComponent,
            },
            {
                path: 'logout',
                component: NbLogoutComponent,
            },
        ],
    },

    // otherwise redirect to home
    {
        path: '**',
        redirectTo: ''
    }
];

export const routing = RouterModule.forRoot(appRoutes);
