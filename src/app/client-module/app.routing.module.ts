import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './auth.guard';
import { AuthenticationComponent } from './pages/authentication/authentication.component';
import { BayComponent } from './pages/bay/bay.component';
import { BaysComponent } from './pages/bays/bays.component';
import { ItemComponent } from './pages/item/item.component';
import { ItemsComponent } from './pages/items/items.component';
import { LogoutComponent } from './pages/logout/logout.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { PagesComponent } from './pages/pages.component';
import { ReportElementComponent } from './pages/report-element/report-element.component';
import { ReportElementsComponent } from './pages/report-elements/report-elements.component';
import { ReportProfileComponent } from './pages/report-profile/report-profile.component';
import { ReportProfilesComponent } from './pages/report-profiles/report-profiles.component';
import { ReservationReturnComponent } from './pages/reservation-return/reservation-return.component';
import { ReservationComponent } from './pages/reservation/reservation.component';
import { ReservationsComponent } from './pages/reservations/reservations.component';

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
                    {
                        path: ':reservationId/return',
                        component: ReservationReturnComponent,
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
                path: 'report-profiles',
                canActivate: [AuthGuard],
                children: [
                    {
                        path: '',
                        component: ReportProfilesComponent,
                    },
                    {
                        path: ':reportProfileId',
                        component: ReportProfileComponent,
                    },
                ],
            },
            {
                path: 'report-elements',
                canActivate: [AuthGuard],
                children: [
                    {
                        path: '',
                        component: ReportElementsComponent,
                    },
                    {
                        path: ':reportElementId',
                        component: ReportElementComponent,
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
