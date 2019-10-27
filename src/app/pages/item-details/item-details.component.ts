import { Component, OnInit, Input, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { Item, ItemState, Reservation } from 'src/app/_models';
import { ApiService } from 'src/app/_services';
import { AsyncInput } from '@ng-reactive/async-input';
import { BehaviorSubject, combineLatest, EMPTY, Observable, Subject } from 'rxjs';
import { switchMap, shareReplay, takeUntil, debounceTime, tap } from 'rxjs/operators';
import { toIsoDate } from 'src/app/_helpers';

interface FieldItem {
    key: string;
    value: any;
}

@Component({
    selector: 'depot-item-details',
    templateUrl: './item-details.component.html',
    styleUrls: ['./item-details.component.scss'],
})
export class ItemDetailsComponent implements OnInit, OnDestroy, OnChanges {
    @Input() item: Item;
    @Input() reservationStart: string;
    @Input() reservationEnd: string;

    @AsyncInput() item$ = new BehaviorSubject<Item>(null);
    @AsyncInput() reservationStart$ = new BehaviorSubject<string>(toIsoDate(new Date()));
    @AsyncInput() reservationEnd$ = new BehaviorSubject<string>(toIsoDate(new Date(Date.now() + 60 * 60 * 24 * 1000)));

    itemHistory$: Observable<ItemState[]>;
    reservations$: Observable<Reservation[]>;
    destroyed$ = new Subject<void>();

    constructor(private api: ApiService) {
        this.itemHistory$ = combineLatest([this.item$, this.reservationStart$, this.reservationEnd$]).pipe(
            debounceTime(200),
            switchMap(([item, reservationStart, reservationEnd]) => {
                if (item && reservationStart && reservationEnd) {
                    return this.api.getItemHistory(item.id, reservationStart, reservationEnd, undefined, 10, 10, 0);
                }
                return EMPTY;
            }),
            tap(history => console.log('history:', history)),
            shareReplay(1),
            takeUntil(this.destroyed$)
        );

        this.reservations$ = combineLatest([this.item$, this.reservationStart$, this.reservationEnd$]).pipe(
            debounceTime(200),
            switchMap(([item, reservationStart, reservationEnd]) => {
                if (item && reservationStart && reservationEnd) {
                    return this.api.getReservations(
                        reservationStart,
                        reservationEnd,
                        undefined,
                        undefined,
                        1,
                        1,
                        item.id
                    );
                }
                return EMPTY;
            }),
            tap(reservations => console.log('reservations:', reservations)),
            shareReplay(1),
            takeUntil(this.destroyed$)
        );
    }

    ngOnInit() {
        this.item$.subscribe(item => console.log('item:', item));
    }

    ngOnDestroy(): void {
        this.destroyed$.next();
    }

    ngOnChanges(): void {}

    stateFields(state: ItemState): FieldItem[] {
        return Object.entries(state.fields).map(([key, value]) => ({ key, value }));
    }
}
