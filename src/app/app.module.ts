import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, HttpClientModule, HttpRequest } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import {
    NbAccordionModule,
    NbActionsModule,
    NbAlertModule,
    NbBaseCalendarModule,
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
    NbTreeGridModule,
    NbUserModule,
    NbWindowModule,
} from '@nebular/theme';
import { NbEvaIconsModule } from '@nebular/eva-icons';

import { NB_AUTH_TOKEN_INTERCEPTOR_FILTER, NbAuthJWTInterceptor } from '@nebular/auth';

import { APP_BASE_HREF } from '@angular/common';

import { HttpErrorHandler } from './_services';

import { AppComponent } from './app.component';
import { routing } from './app.routing';

import { TagInputModule } from 'ngx-chips';
import { NgxFileDropModule } from 'ngx-file-drop';

import { DepotManAuthModule, NbPasswordAuthStrategyEndpoint } from './auth/auth.module';
import {
    CalendarRangeComponent,
    CalendarRangeDayCellComponent,
    DateRangePickerComponent,
} from './pages/date-range-picker/date-range-picker.component';

import { PagesComponent } from './pages/pages.component';
import { HomeComponent } from './pages/home/home.component';
import { ReservationComponent } from './pages/reservation/reservation.component';
import { FormElementComponent } from './pages/form-element/form-element.component';
import { ReservationItemsComponent } from './pages/reservation-items/reservation-items.component';
import { ItemFilterPipe, ItemGroupFilterPipe } from './_pipes';
import { ReservationsComponent } from './pages/reservations/reservations.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { ItemsComponent } from './pages/items/items.component';
import { PictureListComponent } from './pages/picture-list/picture-list.component';
import { ItemComponent } from './pages/item/item.component';
import { ItemDetailsComponent } from './pages/item-details/item-details.component';

@NgModule({
    entryComponents: [CalendarRangeDayCellComponent, CalendarRangeComponent],
    declarations: [
        AppComponent,
        PagesComponent,
        HomeComponent,
        FormElementComponent,
        ReservationComponent,
        ReservationItemsComponent,

        CalendarRangeDayCellComponent,
        CalendarRangeComponent,
        DateRangePickerComponent,

        ItemFilterPipe,
        ItemGroupFilterPipe,
        ReservationsComponent,
        NotFoundComponent,
        ItemsComponent,
        PictureListComponent,
        ItemComponent,
        ItemDetailsComponent,
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        NbThemeModule.forRoot(),
        NbMenuModule.forRoot(),
        NbToastrModule.forRoot(),
        NbDialogModule.forRoot(),
        NbDatepickerModule.forRoot(),
        DepotManAuthModule,
        NbActionsModule,
        NbCardModule,
        NbLayoutModule,
        NbRouteTabsetModule,
        NbSearchModule,
        NbSidebarModule,
        NbTabsetModule,
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
        NbWindowModule,
        NbListModule,
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
        NbTreeGridModule,
        TagInputModule,
        NgxFileDropModule,
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
        {
            provide: NB_AUTH_TOKEN_INTERCEPTOR_FILTER,
            useValue: (req: HttpRequest<any>) => req.url.endsWith('/jwt-auth'),
        },
    ],

    bootstrap: [AppComponent],
})
export class AppModule {}
