import { Component, OnInit, Input, OnDestroy, OnChanges } from '@angular/core';
import { AsyncInput } from '@ng-reactive/async-input';
import { Item, ItemState, Reservation } from '../../_models';
import { ApiService } from '../../_services';
import { toIsoDate } from '../../_helpers';
import { BehaviorSubject, combineLatest, EMPTY, Observable, Subject } from 'rxjs';
import { switchMap, shareReplay, takeUntil, debounceTime, tap } from 'rxjs/operators';

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

    conditionTranslation: Record<number, string> = {
        1: 'Good',
        2: 'Ok',
        3: 'Bad',
        4: 'Gone',
    };

    constructor(private api: ApiService) {
        this.itemHistory$ = combineLatest([this.item$, this.reservationStart$, this.reservationEnd$]).pipe(
            debounceTime(200),
            switchMap(([item, reservationStart, reservationEnd]) => {
                if (item && reservationStart && reservationEnd) {
                    return this.api.getItemHistory(item.id, {
                        start: reservationStart,
                        end: reservationEnd,
                        limit: 10,
                        limitBeforeStart: 10,
                        limitAfterEnd: 0,
                    });
                }
                return EMPTY;
            }),
            tap((history) => console.log('history:', history)),
            shareReplay(1),
            takeUntil(this.destroyed$)
        );

        this.reservations$ = combineLatest([this.item$, this.reservationStart$, this.reservationEnd$]).pipe(
            debounceTime(200),
            switchMap(([item, reservationStart, reservationEnd]) => {
                if (item && reservationStart && reservationEnd) {
                    return this.api.getReservations({
                        start: reservationStart,
                        end: reservationEnd,
                        limitBeforeStart: 1,
                        limitAfterEnd: 1,
                        itemId: item.id,
                    });
                }
                return EMPTY;
            }),
            tap((reservations) => console.log('reservations:', reservations)),
            shareReplay(1),
            takeUntil(this.destroyed$)
        );
    }

    ngOnInit() {
        this.item$.subscribe((item) => console.log('item:', item));
    }

    ngOnDestroy(): void {
        this.destroyed$.next();
    }

    ngOnChanges(): void {}

    getPicturePreviewUrl(pictureId: string): string {
        return this.api.getPicturePreviewUrl(pictureId);
    }

    stateFields(state: ItemState): FieldItem[] {
        return Object.entries(state.changes).map(([key, value]) => ({ key, value }));
    }
}
