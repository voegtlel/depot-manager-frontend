import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
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

import { TagInputModule } from 'ngx-chips';
import { NgxFileDropModule } from 'ngx-file-drop';

import {
    CalendarRangeComponent,
    CalendarRangeDayCellComponent,
    DateRangePickerComponent,
} from './components/date-range-picker/date-range-picker.component';

import { FormElementComponent } from './components/form-element/form-element.component';
import { ReservationItemsComponent } from './components/reservation-items/reservation-items.component';
import { ItemFilterPipe, ItemGroupFilterPipe, FormatDateTimePipe, FormatDatePipe } from './_pipes';
import { PictureListComponent } from './components/picture-list/picture-list.component';
import { ItemDetailsComponent } from './components/item-details/item-details.component';
import { ItemGroupListComponent } from './components/item-group-list/item-group-list.component';
import { ItemGroupNamePipe } from './_pipes/item-group-name.pipe';
import { BayNamePipe } from './_pipes/bay-name.pipe';
import { BayListComponent } from './components/bay-list/bay-list.component';
import { ItemBaysComponent } from './components/item-bays/item-bays.component';

@NgModule({
    entryComponents: [CalendarRangeDayCellComponent, CalendarRangeComponent],
    declarations: [
        FormElementComponent,
        ReservationItemsComponent,
        ItemBaysComponent,

        CalendarRangeDayCellComponent,
        CalendarRangeComponent,
        DateRangePickerComponent,

        ItemFilterPipe,
        ItemGroupFilterPipe,
        BayNamePipe,
        FormatDatePipe,
        FormatDateTimePipe,
        BayListComponent,
        PictureListComponent,
        ItemDetailsComponent,
        ItemGroupListComponent,
        ItemGroupNamePipe,
    ],
    imports: [
        CommonModule,
        BrowserAnimationsModule,
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
    ],
    exports: [
        FormElementComponent,
        ReservationItemsComponent,
        ItemBaysComponent,

        CalendarRangeDayCellComponent,
        CalendarRangeComponent,
        DateRangePickerComponent,

        ItemFilterPipe,
        ItemGroupFilterPipe,
        BayNamePipe,
        FormatDatePipe,
        FormatDateTimePipe,
        BayListComponent,
        PictureListComponent,
        ItemDetailsComponent,
        ItemGroupListComponent,
        ItemGroupNamePipe,
    ],
})
export class CommonModuleModule {}
