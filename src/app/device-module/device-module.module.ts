import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommonModuleModule } from '../common-module/common-module.module';
import { PagesComponent } from './pages/pages.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { RouterModule } from '@angular/router';
import {
    NbThemeModule,
    NbMenuModule,
    NbToastrModule,
    NbDialogModule,
    NbDatepickerModule,
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
    NbBaseCalendarModule,
    NbIconModule,
    NbTreeGridModule,
} from '@nebular/theme';
import { NbEvaIconsModule } from '@nebular/eva-icons';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { LoginByCardComponent } from './pages/login-by-card/login-by-card.component';
import { HomeComponent } from './pages/home/home.component';
import { ReservationsComponent } from './pages/reservations/reservations.component';
import { ReservationComponent } from './pages/reservation/reservation.component';
import { BayComponent } from './pages/bay/bay.component';
import { AuthComponent } from './pages/auth/auth.component';
import { LoginComponent } from './pages/login/login.component';

@NgModule({
    declarations: [
        PagesComponent,
        NotFoundComponent,
        LoginByCardComponent,
        HomeComponent,
        ReservationsComponent,
        ReservationComponent,
        BayComponent,
        AuthComponent,
        LoginComponent,
    ],
    exports: [PagesComponent],
    imports: [
        CommonModule,
        CommonModuleModule,
        RouterModule,
        NbThemeModule.forRoot(),
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
})
export class DeviceModuleModule {}
