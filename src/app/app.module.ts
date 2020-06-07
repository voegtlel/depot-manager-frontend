import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { APP_BASE_HREF } from '@angular/common';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './client-module/app.routing.module';
import { DeviceAppRoutingModule } from './device-module/app.routing.device.module';

import { environment } from 'src/environments/environment';
import { ClientModuleModule } from './client-module/client-module.module';
import { DeviceModuleModule } from './device-module/device-module.module';
import { NbSidebarModule, NbSidebarService, NbThemeModule } from '@nebular/theme';
import { ReservationResolver } from './device-module/_services/reservation.resolver';

@NgModule({
    // entryComponents: [CalendarRangeDayCellComponent, CalendarRangeComponent],
    declarations: [AppComponent],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        NbThemeModule.forRoot(),
        environment.onDevice ? DeviceModuleModule : ClientModuleModule,
        HttpClientModule,
        environment.onDevice ? DeviceAppRoutingModule : AppRoutingModule,
        NbSidebarModule,
    ],
    providers: [NbSidebarService, { provide: APP_BASE_HREF, useValue: '/' }, ReservationResolver],

    bootstrap: [AppComponent],
})
export class AppModule {}
