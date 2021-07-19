import { Component, Input, OnChanges, Output, EventEmitter, OnDestroy, SimpleChanges, OnInit } from '@angular/core';
import { ApiService } from '../../_services';
import { Item, Reservation } from '../../_models';
import { Filterable } from '../../_pipes';
import { AsyncInput } from '@ng-reactive/async-input';
import { BehaviorSubject, combineLatest, EMPTY, Observable } from 'rxjs';
import { fromIsoDate } from '../../_helpers';
import { distinctUntilChanged, filter, map, shareReplay, switchMap, tap } from 'rxjs/operators';
import { NbIconLibraries } from '@nebular/theme';
import { DomSanitizer } from '@angular/platform-browser';

interface ItemWithAvailability extends Item, Filterable {
    available: boolean;
}

interface ReservationItemWithPosition {
    item: ItemWithAvailability;
    itemPosition: number;
}

interface ReservationWithItemWithPosition extends Reservation {
    itemsWithPosition: ReservationItemWithPosition[];
    dateStartPosition: number;
    dateWidth: number;
    color: string;
    isCurrent: boolean;
}

function dateDaysDiff(d1: Date, d2: Date): number {
    return Math.floor((d2.getTime() - d1.getTime()) / (1000 * 3600 * 24));
}

@Component({
    selector: 'depot-reservation-items-table',
    templateUrl: './reservation-items-table.component.html',
    styleUrls: ['./reservation-items-table.component.scss'],
})
export class ReservationItemsTableComponent implements OnChanges, OnDestroy, OnInit {
    @Input() reservationId: string;
    @Input() items: ItemWithAvailability[];
    @Input() reservationsStart: string;
    @Input() reservationsEnd: string;
    @Input() selectedIds$: Observable<string[]>;
    @Input() selectedLookup: Record<string, any>;

    @AsyncInput() reservationId$ = new BehaviorSubject<string>(null);
    @AsyncInput() items$ = new BehaviorSubject<ItemWithAvailability[]>(null);
    @AsyncInput() reservationsStart$ = new BehaviorSubject<string>(null);
    @AsyncInput() reservationsEnd$ = new BehaviorSubject<string>(null);
    @AsyncInput() selectedIds$$ = new BehaviorSubject<Observable<string[]>>(null);

    @Output() selectItem = new EventEmitter<string>();
    @Output() deselectItem = new EventEmitter<string>();

    @Output() showDetails = new EventEmitter<ItemWithAvailability>();
    @Output() showReservationDetails = new EventEmitter<ReservationWithItemWithPosition>();

    readonly nameWidth = 200;
    readonly dateWidth = 30;

    readonly dateHeight = 100;
    readonly itemRowHeight = 30;

    readonly preDate = 5;
    readonly postDate = 5;

    readonly colorPalette: string[] = ['#ffffb2', '#fed976', '#feb24c', '#fd8d3c', '#fc4e2a', '#e31a1c', '#b10026'];

    dateRange$: Observable<[Date, Date]> = combineLatest([this.reservationsStart$, this.reservationsEnd$]).pipe(
        distinctUntilChanged(([start1, end1], [start2, end2]) => start1 === start2 && end1 === end2),
        map(([startStr, endStr]) => {
            if (startStr == null || endStr == null) {
                return [null, null] as [Date, Date];
            }
            const start = fromIsoDate(startStr);
            const end = fromIsoDate(endStr);

            return [start, end] as [Date, Date];
        }),
        shareReplay(1)
    );

    dateRangeFull$ = this.dateRange$.pipe(
        map(([start, end]) => {
            if (start == null || end == null) {
                return [start, end] as [Date, Date];
            }
            start = new Date(start);
            end = new Date(end);

            start.setDate(start.getDate() - this.preDate);
            end.setDate(end.getDate() + this.postDate);

            return [start, end] as [Date, Date];
        }),
        shareReplay(1)
    );

    dates$ = this.dateRangeFull$.pipe(
        map(([start, end]) => {
            if (start == null || end == null) {
                return [];
            }
            const diffDays = dateDaysDiff(start, end) + 1;

            const dates = [];
            start = new Date(start);
            for (let i = 0; i < diffDays; i++) {
                dates.push({ date: new Date(start), isSelected: i >= this.preDate && i < diffDays - this.postDate });
                start.setDate(start.getDate() + 1);
            }
            return dates;
        })
    );

    totalWidth$ = this.dates$.pipe(map((dates) => this.nameWidth + this.dateWidth * (dates?.length ?? 0)));
    totalHeight$ = this.items$.pipe(map((items) => this.dateHeight + this.itemRowHeight * (items?.length ?? 0)));

    reservations$: Observable<ReservationWithItemWithPosition[]>;

    detailsIconHtml: any;
    detailsIconClasses: string;

    constructor(public api: ApiService, private iconLibrary: NbIconLibraries, private sanitizer: DomSanitizer) {
        const reservations$ = this.dateRangeFull$.pipe(
            filter(([start, end]) => !!start && !!end),
            switchMap(([start, end]) =>
                combineLatest([
                    api.getReservations({
                        includeReturned: true,
                        start: start.toISOString().substr(0, 10),
                        end: end.toISOString().substr(0, 10),
                    }),
                    this.reservationId$,
                ])
            ),
            map(([reservations, reservationId]) =>
                reservations.filter((reservation) => reservation.id !== reservationId)
            ),
            map((reservations) => reservations),
            shareReplay(1)
        );

        this.reservations$ = combineLatest([
            reservations$,
            this.items$.pipe(
                filter((items) => !!items),
                map((items) =>
                    items.reduce((o, item, index) => {
                        o[item.id] = { item, index };
                        return o;
                    }, Object.create(null) as Record<string, { item: ItemWithAvailability; index: number }>)
                )
            ),
            this.dateRange$.pipe(filter(([x, y]) => !!x && !!y)),
            this.dateRangeFull$.pipe(filter(([x, y]) => !!x && !!y)),
            this.reservationId$,
            this.selectedIds$$.pipe(switchMap((selectedIds$) => (selectedIds$ == null ? EMPTY : selectedIds$))),
        ]).pipe(
            map(
                ([
                    reservations,
                    itemsById,
                    [reservationStart, reservationEnd],
                    [rangeStart],
                    reservationId,
                    selectedIds,
                ]) =>
                    reservations
                        .concat({
                            id: reservationId,
                            start: reservationStart,
                            end: reservationEnd,
                            items: selectedIds,
                            contact: null,
                            name: null,
                            teamId: null,
                            type: null,
                            userId: null,
                            returned: false,
                        })
                        .map((reservation, resIdx) => {
                            const start =
                                reservation.start instanceof Date ? reservation.start : fromIsoDate(reservation.start);
                            const end =
                                reservation.end instanceof Date ? reservation.end : fromIsoDate(reservation.end);
                            const dateStartPosition =
                                this.nameWidth + dateDaysDiff(rangeStart, start) * this.dateWidth - 1;
                            const dateEndPosition =
                                this.nameWidth + (dateDaysDiff(rangeStart, end) + 1) * this.dateWidth;
                            const dateWidth = dateEndPosition - dateStartPosition;
                            return {
                                ...reservation,
                                dateStartPosition,
                                dateWidth,
                                color:
                                    reservation.id === reservationId
                                        ? '#00ff00'
                                        : this.colorPalette[resIdx % this.colorPalette.length],
                                isCurrent: reservation.id === reservationId,
                                itemsWithPosition: reservation.items
                                    .map((itemId) => {
                                        const item = itemsById[itemId];
                                        if (item == null) {
                                            return null;
                                        }
                                        const itemPosition = this.dateHeight + item.index * this.itemRowHeight - 1;
                                        return {
                                            item: item.item,
                                            itemPosition,
                                        };
                                    })
                                    .filter((x) => x != null),
                            };
                        })
            )
        );
    }

    ngOnInit(): void {
        const icon = this.iconLibrary.getSvgIcon('search-outline');
        const content = icon.icon.getContent();
        this.detailsIconHtml = this.sanitizer.bypassSecurityTrustHtml(content);
        this.detailsIconClasses = icon.icon.getClasses().join(' ');
    }

    ngOnDestroy(): void {}

    ngOnChanges(): void {}

    isSelected(id: string): Observable<boolean> {
        return this.selectedLookup[id];
    }
}
