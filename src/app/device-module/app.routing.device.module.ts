import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './auth.guard';
import { LoginCodeComponent } from './pages/login-code/login-code.component';
import { LogoutComponent } from './pages/logout/logout.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { PagesComponent } from './pages/pages.component';
import { ReservationComponent } from './pages/reservation/reservation.component';

const routes: Routes = [
    {
        path: '',
        component: PagesComponent,
        children: [
            {
                path: '',
                component: LoginCodeComponent,
            },
            {
                path: 'reservation',
                canActivate: [AuthGuard],
                component: ReservationComponent,
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
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })],
    exports: [RouterModule],
})
export class DeviceAppRoutingModule {}
