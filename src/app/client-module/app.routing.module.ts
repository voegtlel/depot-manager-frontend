import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from './auth.guard';

import { PagesComponent } from './pages/pages.component';
import { ReservationComponent } from './pages/reservation/reservation.component';
import { ReservationsComponent } from './pages/reservations/reservations.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { ItemsComponent } from './pages/items/items.component';
import { ItemComponent } from './pages/item/item.component';
import { BaysComponent } from './pages/bays/bays.component';
import { BayComponent } from './pages/bay/bay.component';
import { AuthenticationComponent } from './pages/authentication/authentication.component';
import { LogoutComponent } from './pages/logout/logout.component';
import { NgModule } from '@angular/core';

const routes: Routes = [
    {
        path: '',
        component: PagesComponent,
        children: [
            {
                path: '',
                component: AuthenticationComponent,
            },
            {
                path: 'reservations',
                canActivate: [AuthGuard],
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
                canActivate: [AuthGuard],
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
                canActivate: [AuthGuard],
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
            {
                path: 'logout',
                component: LogoutComponent,
            },

            // otherwise redirect to home
            {
                path: '**',
                component: NotFoundComponent,
                // redirectTo: ''
            },
        ],
    },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
})
export class AppRoutingModule {}
