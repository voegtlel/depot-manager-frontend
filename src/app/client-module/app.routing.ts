import { RouterModule, Routes } from '@angular/router';
import { NbAuthComponent, NbLogoutComponent } from '@nebular/auth';

import { AuthGuard } from './auth.guard';
import { LoginComponent } from '../auth/login/login.component';

import { HomeComponent } from './pages/home/home.component';
import { PagesComponent } from './pages/pages.component';
import { ReservationComponent } from './pages/reservation/reservation.component';
import { ReservationsComponent } from './pages/reservations/reservations.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { ItemsComponent } from './pages/items/items.component';
import { ItemComponent } from './pages/item/item.component';
import { BaysComponent } from './pages/bays/bays.component';
import { BayComponent } from './pages/bay/bay.component';

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
                path: 'reservations',
                children: [
                    {
                        path: '',
                        component: ReservationsComponent,
                    },
                    {
                        path: ':reservationId',
                        component: ReservationComponent,
                    },
                ],
            },
            {
                path: 'items',
                children: [
                    {
                        path: '',
                        component: ItemsComponent,
                    },
                    {
                        path: ':itemId',
                        component: ItemComponent,
                    },
                ],
            },
            {
                path: 'bays',
                children: [
                    {
                        path: '',
                        component: BaysComponent,
                    },
                    {
                        path: ':bayId',
                        component: BayComponent,
                    },
                ],
            },
        ],
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
        component: NotFoundComponent,
        // redirectTo: ''
    },
];

export const routing = RouterModule.forRoot(appRoutes);
