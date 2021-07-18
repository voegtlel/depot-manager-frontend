import { Component, OnInit, Input, OnDestroy, OnChanges, TemplateRef } from '@angular/core';
import { AsyncInput } from '@ng-reactive/async-input';
import { Item, Reservation } from '../../_models';
import { ItemsService } from '../../_services';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import { NbDialogService } from '@nebular/theme';

@Component({
    selector: 'depot-reservation-details',
    templateUrl: './reservation-details.component.html',
    styleUrls: ['./reservation-details.component.scss'],
})
export class ReservationDetailsComponent implements OnInit, OnDestroy, OnChanges {
    @Input() reservation: Reservation;

    @AsyncInput() reservation$ = new BehaviorSubject<Reservation>(null);

    destroyed$ = new Subject<void>();
    reservedItems$: Observable<Item[]>;

    constructor(itemsService: ItemsService, private dialogService: NbDialogService) {
        this.reservedItems$ = this.reservation$.pipe(
            switchMap((reservation) =>
                itemsService.itemsById$.pipe(map((itemsById) => reservation.items.map((item) => itemsById[item])))
            )
        );
    }

    ngOnInit() {}

    ngOnDestroy(): void {
        this.destroyed$.next();
    }

    ngOnChanges(): void {}
}
