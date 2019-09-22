import {Component, forwardRef, Input, OnDestroy, OnInit, TemplateRef} from '@angular/core';
import {ApiService} from '../../_services';
import {BehaviorSubject, Observable, of, Subject} from "rxjs";
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from "@angular/forms";
import {Item} from "../../_models";
import {NbDialogService, NbToastrService} from "@nebular/theme";
import {shareLast} from "../../_helpers";
import {map, switchMap, takeUntil, tap} from "rxjs/operators";
import {combineLatest} from "rxjs";
import {Filterable} from "../../_pipes";


interface ItemWithAvailability extends Item, Filterable {
    available: boolean;
}


@Component({
    selector: 'app-reservation-items',
    templateUrl: './reservation-items.component.html',
    providers: [
        {provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => ReservationItemsComponent), multi: true},
    ],
    styleUrls: ['./reservation-items.component.scss'],
})
export class ReservationItemsComponent implements OnInit, OnDestroy, ControlValueAccessor {
    private stop$ = new Subject<void>();

    loading: boolean;
    reload$: BehaviorSubject<any> = new BehaviorSubject(null);
    items$: Observable<ItemWithAvailability[]>;
    itemGroups$: Observable<ItemWithAvailability[][]>;

    private _selected: string[] = [];
    private _selectedLookup: {[id: string]: boolean} = {};

    imageLoading: boolean;

    _reservationsStart$: BehaviorSubject<string> = new BehaviorSubject(null);

    @Input() set reservationsStart(value: string) {
        console.log("Set reservation start", value);
        this._reservationsStart$.next(value);
    }

    _reservationsEnd$: BehaviorSubject<string> = new BehaviorSubject(null);

    @Input() set reservationsEnd(value: string) {
        console.log("Set reservation end", value);
        this._reservationsEnd$.next(value);
    }

    _skipReservationId$: BehaviorSubject<string> = new BehaviorSubject(null);

    @Input() set skipReservationId(value: string) {
        this._skipReservationId$.next(value);
    }

    propagateChange: ((any) => void) = () => {};

    group: boolean = true;
    filter: string;

    constructor(
        public api: ApiService,
        private toastrService: NbToastrService,
        private dialogService: NbDialogService,
    ) {
    }

    ngOnInit() {
        const filteredItemIds$ = shareLast(this.reload$.pipe(
            switchMap(() => combineLatest([
                this._reservationsStart$, this._reservationsEnd$, this._skipReservationId$,
            ])),
            switchMap(([reservationStart, reservationEnd, skipReservationId]) => {
                if (reservationStart && reservationEnd) {
                    return this.api.getReservationItems(reservationStart, reservationEnd, skipReservationId);
                }
                return of([]);
            }),
            map(filteredItemIds => {
                let mapping: {[id: string]: boolean} = {};
                filteredItemIds.forEach(itemId => {
                    mapping[itemId] = true;
                });
                return mapping;
            }),
            tap(x => console.log("filteredItemIds$", x))
        ));
        const items$ = shareLast(this.reload$.pipe(
            switchMap(() => this.api.getItems()),
        ));
        this.items$ = combineLatest([filteredItemIds$, items$]).pipe(
            map(([filteredItemIds, items]) => {
                return items.map(item => {
                    return {
                        ...item,
                        available: !filteredItemIds[item.id],
                        filterLookup: (item.name + '\0' + item.description + '\0' + item.externalId + '\0' + item.tags.join('\0')).toLowerCase()
                    };
                });
            }),
            takeUntil(this.stop$),
        );

        this.items$.subscribe(items => {
            const itemsById: {[id: string]: ItemWithAvailability} = items.reduce((obj, item) => {
                obj[item.id] = true;
                return obj;
            }, {});
            const foundItems = this._selected.filter(selectedId => itemsById.hasOwnProperty(selectedId));
            if (foundItems.length != this._selected.length) {
                this.toastrService.danger(`${this._selected.length - foundItems.length} items were removed from your reservation, because they do not exist any more`)
            }
            const availableItems = foundItems.filter(selectedId => itemsById[selectedId].available);
            if (availableItems.length != foundItems.length) {
                const removedItems = foundItems.filter(
                    selectedId => !itemsById[selectedId].available
                ).map(
                    itemId => itemsById[itemId]
                ).map(
                    item =>`${item.name} (${item.externalId})`
                ).join(', ');
                this.toastrService.danger(`${foundItems.length - availableItems.length} items were removed from your reservation, because they are not available: ${removedItems}`)
            }
        });

        this.itemGroups$ = this.items$.pipe(
            map(items => {
                const groupsById = {};
                const groups = [];
                items.forEach(item => {
                    if (item.groupId) {
                        if (groupsById.hasOwnProperty(item.groupId)) {
                            groupsById[item.groupId].push(item);
                        } else {
                            const grp = [item];
                            groupsById[item.groupId] = grp;
                            groups.push(grp);
                        }
                    } else {
                        const grp = [item];
                        groupsById[item.id] = grp;
                        groups.push(grp);
                    }
                });
                return groups;
            })
        );
    }

    ngOnDestroy(): void {
        this.stop$.next();
    }

    select(id: string) {
        this._selected.push(id);
        this._selectedLookup[id] = true;
        console.log("select", id);
        this.propagateChange(this._selected);
    }

    deselect(id: string) {
        console.log("deselect", id);
        let idx = this._selected.indexOf(id);
        if (~idx) {
            this._selected.splice(idx, 1);
            delete this._selectedLookup[id];
        }
        this.propagateChange(this._selected);
    }

    setSelected(id: string, selected: boolean) {
        console.log(id, selected);
        if (selected) {
            this.select(id);
        } else {
            this.deselect(id);
        }
    }

    isSelected(id: string): boolean {
        return this._selectedLookup[id];
    }

    writeValue(value) {
        if (value) {
            if (!(value instanceof Array)) {
                throw Error("Invalid value for reservation items")
            }
            this._selected = value;
            this._selectedLookup = value.reduce((obj, item) => {
                obj[item] = true;
                return obj;
            }, {});
        } else {
            this._selected = [];
            this._selectedLookup = {};
        }
    }

    registerOnChange(fn) {
        this.propagateChange = fn;
    }

    registerOnTouched() {
    }

    getItemPicturePreviewUrl(item: ItemWithAvailability): string {
        return this.api.getPicturePreviewUrl(item.pictureId);
    }

    getItemPictureUrl(item: ItemWithAvailability): string {
        return this.api.getPictureUrl(item.pictureId);
    }

    openDialog($event: MouseEvent, imageDialog: TemplateRef<any>, item: ItemWithAvailability) {
        $event.preventDefault();
        $event.stopPropagation();
        this.imageLoading = true;
        this.dialogService.open(imageDialog, {hasBackdrop: true, closeOnBackdropClick: true, context: item, hasScroll: false, autoFocus: true});
    }

    itemGroupSelectedCount(items: ItemWithAvailability[]): number {
        return items.reduce((val, item) => val + (this._selectedLookup[item.id]?1:0), 0);
    }

    itemGroupSelectableCount(items: ItemWithAvailability[]): number {
        return items.reduce((val, item) => val + (item.available?1:0), 0);
    }

    itemGroupCanSelectMore(items: ItemWithAvailability[]): boolean {
        return items.some(item => item.available && !this._selectedLookup[item.id]);
    }

    addToGroup(items: ItemWithAvailability[], count: number = 1) {
        items.forEach(item => {
            if (count > 0) {
                if (item.available && !this._selectedLookup[item.id]) {
                    this.select(item.id);
                    count -= 1;
                }
            }
        });
    }

    removeFromGroup(items: ItemWithAvailability[], count: number = 1) {
        items.forEach(item => {
            if (count > 0) {
                if (this._selectedLookup[item.id]) {
                    this.deselect(item.id);
                    count -= 1;
                }
            }
        });
    }

    setGroupCount(items: ItemWithAvailability[], count: number) {
        const currentCount = this.itemGroupSelectedCount(items);
        if (count > currentCount) {
            this.addToGroup(items, count - currentCount);
        } else if (count < currentCount) {
            this.removeFromGroup(items, currentCount - count);
        }
    }
}
