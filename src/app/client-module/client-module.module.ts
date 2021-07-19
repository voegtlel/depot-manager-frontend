import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PagesComponent } from './pages/pages.component';
import { ReservationComponent } from './pages/reservation/reservation.component';
import { ReservationsComponent } from './pages/reservations/reservations.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { ItemsComponent } from './pages/items/items.component';
import { ItemComponent } from './pages/item/item.component';
import { BaysComponent } from './pages/bays/bays.component';
import { BayComponent } from './pages/bay/bay.component';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

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
    NbToastrModule,
    NbTooltipModule,
    NbTreeGridModule,
    NbUserModule,
    NbWindowModule,
} from '@nebular/theme';
import { NbEvaIconsModule } from '@nebular/eva-icons';

import { APP_BASE_HREF } from '@angular/common';

import { environment } from 'src/environments/environment';
import { RouterModule } from '@angular/router';
import { CommonModuleModule } from '../common-module/common-module.module';
import { AuthenticationComponent } from './pages/authentication/authentication.component';
import { LogoutComponent } from './pages/logout/logout.component';
import { OAuthStorage } from 'angular-oauth2-oidc';
import { AuthGuard } from './auth.guard';
import { ReportElementsComponent } from './pages/report-elements/report-elements.component';
import { ReportElementComponent } from './pages/report-element/report-element.component';
import { ReportProfileComponent } from './pages/report-profile/report-profile.component';
import { ReportProfilesComponent } from './pages/report-profiles/report-profiles.component';
import { ReservationReturnComponent } from './pages/reservation-return/reservation-return.component';

@NgModule({
    declarations: [
        PagesComponent,
        ReservationComponent,
        ReservationReturnComponent,

        AuthenticationComponent,
        LogoutComponent,

        ReservationsComponent,
        NotFoundComponent,
        ItemsComponent,
        BaysComponent,
        BayComponent,
        ItemComponent,
        ReportElementsComponent,
        ReportElementComponent,
        ReportProfileComponent,
        ReportProfilesComponent,
    ],
    imports: [
        CommonModule,
        CommonModuleModule,
        RouterModule,
        NbMenuModule.forRoot(),
        NbToastrModule.forRoot(),
        NbDialogModule.forRoot(),
        NbDatepickerModule.forRoot(),
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
        ReactiveFormsModule,
        FormsModule,
        HttpClientModule,
    ],
    exports: [PagesComponent],
    providers: [
        NbSidebarService,
        { provide: APP_BASE_HREF, useValue: environment.appBaseHref },
        { provide: OAuthStorage, useValue: localStorage },
        AuthGuard,
    ],
})
export class ClientModuleModule {}
