import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HTTP_INTERCEPTORS, HttpClientModule, HttpRequest } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { NB_AUTH_TOKEN_INTERCEPTOR_FILTER, NbAuthJWTInterceptor } from '@nebular/auth';

import { APP_BASE_HREF } from '@angular/common';

import { HttpErrorHandler } from './common-module/_services';

import { AppComponent } from './app.component';
import { routing } from './client-module/app.routing';
import { routing as routingDevice } from './device-module/app.routing.device';

import { NbPasswordAuthStrategyEndpoint } from './auth/auth.module';
import { environment } from 'src/environments/environment';
import { ClientModuleModule } from './client-module/client-module.module';
import { DeviceModuleModule } from './device-module/device-module.module';
import { NbSidebarModule, NbSidebarService } from '@nebular/theme';
import { ReservationResolver } from './device-module/_services/reservation.resolver';

@NgModule({
    // entryComponents: [CalendarRangeDayCellComponent, CalendarRangeComponent],
    declarations: [AppComponent],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        environment.onDevice ? ClientModuleModule : DeviceModuleModule,
        HttpClientModule,
        environment.onDevice ? routingDevice : routing,
        NbSidebarModule,
    ],
    providers: [
        NbSidebarService,
        NbPasswordAuthStrategyEndpoint,
        { provide: APP_BASE_HREF, useValue: '/' },
        { provide: HTTP_INTERCEPTORS, useClass: NbAuthJWTInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: HttpErrorHandler, multi: true },
        {
            provide: NB_AUTH_TOKEN_INTERCEPTOR_FILTER,
            useValue: (req: HttpRequest<any>) =>
                req.url.endsWith('/jwt-auth') ||
                req.url.endsWith('/jwt-auth-card') ||
                (environment.deviceApiUrl && req.url.startsWith(environment.deviceApiUrl)),
        },
        ReservationResolver,
    ],

    bootstrap: [AppComponent],
})
export class AppModule {}
