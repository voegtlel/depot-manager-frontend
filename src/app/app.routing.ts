import { RouterModule, Routes } from '@angular/router';

import { HomeComponent } from './pages/home/home.component';
import { AuthGuard } from './_guards';
import { NbAuthComponent, NbLogoutComponent } from '@nebular/auth';
import { PagesComponent } from './pages/pages.component';
import { LoginComponent } from './auth/login/login.component';
import { ReservationComponent } from './pages/reservation/reservation.component';
import { ReservationsComponent } from './pages/reservations/reservations.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { ItemsComponent } from './pages/items/items.component';
import { ItemComponent } from './pages/item/item.component';

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
