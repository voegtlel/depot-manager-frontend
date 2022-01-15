import { DragDropModule } from '@angular/cdk/drag-drop';
import { APP_BASE_HREF, CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NbEvaIconsModule } from '@nebular/eva-icons';
import {
    NbAccordionModule,
    NbActionsModule,
    NbAlertModule,
    NbBaseCalendarModule,
    NbButtonGroupModule,
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
    NbSpinnerModule,
    NbStepperModule,
    NbTabsetModule,
    NbToastrModule,
    NbTooltipModule,
    NbTreeGridModule,
    NbUserModule,
    NbWindowModule,
} from '@nebular/theme';
import { MarkdownModule } from 'ngx-markdown';
import { environment } from 'src/environments/environment.device';
import { CommonModuleModule } from '../common-module/common-module.module';
import { AuthGuard } from './auth.guard';
import { BayComponent } from './pages/bay/bay.component';
import { LoginByCardComponent } from './pages/login-by-card/login-by-card.component';
import { LoginCodeComponent } from './pages/login-code/login-code.component';
import { LogoutComponent } from './pages/logout/logout.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { PagesComponent } from './pages/pages.component';
import { ReservationComponent } from './pages/reservation/reservation.component';

@NgModule({
    declarations: [
        PagesComponent,
        NotFoundComponent,
        LoginByCardComponent,
        LoginCodeComponent,
        ReservationComponent,
        BayComponent,
        LogoutComponent,
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
        NbButtonGroupModule,
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
        DragDropModule,
        FormsModule,
        HttpClientModule,
        MarkdownModule.forRoot(),
    ],
    exports: [PagesComponent],
    providers: [{ provide: APP_BASE_HREF, useValue: environment.appBaseHref }, AuthGuard],
})
export class DeviceModuleModule {}
