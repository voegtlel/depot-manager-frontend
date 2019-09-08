import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

import {
    NbAccordionModule,
    NbActionsModule,
    NbAlertModule, NbBaseCalendarModule,
    NbButtonModule,
    NbCalendarKitModule,
    NbCalendarModule,
    NbCalendarRangeModule,
    NbCardModule,
    NbChatModule,
    NbCheckboxModule,
    NbContextMenuModule,
    NbDatepickerModule,
    NbDialogModule,
    NbIconModule,
    NbInputModule,
    NbLayoutModule,
    NbListModule,
    NbMenuModule,
    NbPopoverModule,
    NbProgressBarModule,
    NbRadioModule,
    NbRouteTabsetModule,
    NbSearchModule,
    NbSelectModule,
    NbSidebarModule,
    NbSidebarService,
    NbSpinnerModule,
    NbStepperModule,
    NbTabsetModule,
    NbThemeModule,
    NbToastrModule,
    NbTooltipModule,
    NbUserModule,
    NbWindowModule,
} from '@nebular/theme';
import {NbEvaIconsModule} from "@nebular/eva-icons";

import {NB_AUTH_TOKEN_INTERCEPTOR_FILTER, NbAuthJWTInterceptor} from '@nebular/auth';

import {APP_BASE_HREF} from '@angular/common';

import {HttpErrorHandler} from './_services';

import {AppComponent} from './app.component';
import {routing} from './app.routing';

import {authModule, NbPasswordAuthStrategyEndpoint} from './auth/auth.module';
import {
    CalendarRangeComponent,
    CalendarRangeDayCellComponent,
    DateRangePickerComponent,
} from './pages/date-range-picker/date-range-picker.component';

import {LoginComponent} from './auth/login/login.component';

import {PagesComponent} from './pages/pages.component';
import {HomeComponent} from './pages/home/home.component';
import {ReservationComponent} from './pages/reservation/reservation.component';
import {FormElementComponent} from "./pages/form-element/form-element.component";
import {ReservationItemsComponent} from "./pages/reservation-items/reservation-items.component";

@NgModule({
    entryComponents: [
        CalendarRangeDayCellComponent,
        CalendarRangeComponent,
    ],
    declarations: [
        AppComponent,
        PagesComponent,
        HomeComponent,
        LoginComponent,
        FormElementComponent,
        ReservationComponent,
        ReservationItemsComponent,

        CalendarRangeDayCellComponent,
        CalendarRangeComponent,
        DateRangePickerComponent,
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        NbThemeModule.forRoot(),
        NbMenuModule.forRoot(),
        NbToastrModule.forRoot(),
        NbDialogModule.forRoot(),
        NbDatepickerModule.forRoot(),
        authModule,
        NbActionsModule,
        NbCardModule,
        NbLayoutModule,
        NbMenuModule,
        NbRouteTabsetModule,
        NbSearchModule,
        NbSidebarModule,
        NbTabsetModule,
        NbThemeModule,
        NbUserModule,
        NbCheckboxModule,
        NbPopoverModule,
        NbContextMenuModule,
        NbProgressBarModule,
        NbCalendarModule,
        NbCalendarRangeModule,
        NbStepperModule,
        NbButtonModule,
        NbInputModule,
        NbAccordionModule,
        NbDialogModule,
        NbWindowModule,
        NbListModule,
        NbToastrModule,
        NbAlertModule,
        NbSpinnerModule,
        NbRadioModule,
        NbSelectModule,
        NbChatModule,
        NbTooltipModule,
        NbCalendarKitModule,
        NbEvaIconsModule,
        NbBaseCalendarModule,
        NbIconModule,
        ReactiveFormsModule,
        FormsModule,
        HttpClientModule,
        routing,
    ],
    providers: [
        NbSidebarService,
        NbPasswordAuthStrategyEndpoint,
        { provide: APP_BASE_HREF, useValue: '/' },
        { provide: HTTP_INTERCEPTORS, useClass: NbAuthJWTInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: HttpErrorHandler, multi: true },
        { provide: NB_AUTH_TOKEN_INTERCEPTOR_FILTER, useValue: function (req) {
            return req.url.endsWith('/jwt-auth');

        } },
    ],

    bootstrap: [AppComponent]
})
export class AppModule {
}
