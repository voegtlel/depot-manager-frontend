import { Component, OnInit, Input, OnDestroy, OnChanges } from '@angular/core';
import { AsyncInput } from '@ng-reactive/async-input';
import { Item, ItemState, Reservation, TotalReportState } from '../../_models';
import { ApiService } from '../../_services';
import { toIsoDate } from '../../_helpers';
import { BehaviorSubject, combineLatest, EMPTY, Observable, Subject } from 'rxjs';
import { switchMap, shareReplay, takeUntil, debounceTime, tap, map } from 'rxjs/operators';

interface FieldItem {
    key: string;
    value: any;
}

interface ItemStateWithArray extends ItemState {
    changesArray: FieldItem[];
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

    itemHistoryWithState$: Observable<ItemStateWithArray[]>;
    reservations$: Observable<Reservation[]>;
    destroyed$ = new Subject<void>();

    constructor(private api: ApiService) {
        this.itemHistoryWithState$ = combineLatest([this.item$, this.reservationStart$, this.reservationEnd$]).pipe(
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
            map((history) =>
                history.map((entry) => ({
                    changesArray: Object.entries(entry.changes)
                        .filter(([key, value]) => value != null)
                        .map(([key, value]) => ({ key, value: value.next })),
                    ...entry,
                }))
            ),
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
            shareReplay(1),
            takeUntil(this.destroyed$)
        );
    }

    ngOnInit() {}

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
