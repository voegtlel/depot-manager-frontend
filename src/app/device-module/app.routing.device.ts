import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from './auth.guard';
import { NbAuthComponent, NbLogoutComponent } from '@nebular/auth';
import { PagesComponent } from './pages/pages.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { LoginByCardComponent } from './pages/login-by-card/login-by-card.component';
import { ReservationsComponent } from './pages/reservations/reservations.component';
import { ReservationComponent } from './pages/reservation/reservation.component';
import { BayComponent } from './pages/bay/bay.component';
import { AuthComponent } from './pages/auth/auth.component';
import { ReservationResolver } from './_services/reservation.resolver';

const appRoutes: Routes = [
    {
        path: '',
        canActivate: [AuthGuard],
        component: PagesComponent,
        children: [
            {
                path: '',
                pathMatch: 'full',
                redirectTo: '/start',
            },
            {
                path: 'start',
                component: ReservationsComponent,
            },
            {
                path: 'start/:reservationId',
                resolve: {
                    reservation: ReservationResolver,
                },
                children: [
                    {
                        path: '',
                        component: ReservationComponent,
                        data: {
                            backref: ['/start'],
                        },
                    },
                    {
                        path: ':bayId',
                        children: [
                            {
                                path: '',
                                component: BayComponent,
                                data: {
                                    backref: ['/start', ':reservationId'],
                                },
                            },
                        ],
                    },
                ],
            },
        ],
    },

    {
        path: 'auth',
        component: AuthComponent,
        children: [
            {
                path: '',
                component: LoginByCardComponent,
            },
            {
                path: 'register',
                component: LoginByCardComponent,
            },
            {
                path: 'login',
                component: LoginByCardComponent,
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
        component: NotFoundComponent,
        // redirectTo: ''
    },
];

export const routing = RouterModule.forRoot(appRoutes);
