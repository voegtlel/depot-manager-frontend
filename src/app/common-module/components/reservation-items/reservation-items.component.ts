import { Component, forwardRef, Input, OnDestroy, OnInit, TemplateRef, OnChanges } from '@angular/core';
import { ApiService, ItemsService } from '../../_services';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Item } from '../../_models';
import { NbDialogService, NbToastrService } from '@nebular/theme';
import { map, shareReplay, switchMap, takeUntil, tap, skip, debounceTime } from 'rxjs/operators';
import { combineLatest } from 'rxjs';
import { Filterable } from '../../_pipes';
import { AsyncInput } from '@ng-reactive/async-input';

interface ItemWithAvailability extends Item, Filterable {
    available: boolean;
    index: number;
}

@Component({
    selector: 'depot-reservation-items',
    templateUrl: './reservation-items.component.html',
    providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => ReservationItemsComponent), multi: true }],
    styleUrls: ['./reservation-items.component.scss'],
})
export class ReservationItemsComponent implements OnInit, OnDestroy, OnChanges, ControlValueAccessor {
    private destroyed$ = new Subject<void>();

    loading: boolean;
    reload$: BehaviorSubject<any> = new BehaviorSubject(null);
    items$: Observable<ItemWithAvailability[]>;
    itemGroups$: Observable<ItemWithAvailability[][]>;

    selected: string[] = [];
    selectedLookup: Record<string, boolean> = Object.create(null);
    selected$ = new BehaviorSubject<string[]>(this.selected);
    selectedLookup$ = new BehaviorSubject<Record<string, boolean>>(this.selectedLookup);

    disabled = false;

    imageLoading: boolean;

    @Input() reservationsStart: string;
    @Input() reservationsEnd: string;
    @Input() skipReservationId: string;

    @AsyncInput() reservationsStart$ = new BehaviorSubject<string>(null);
    @AsyncInput() reservationsEnd$ = new BehaviorSubject<string>(null);
    @AsyncInput() skipReservationId$ = new BehaviorSubject<string>(null);

    group = true;
    filter: string;
    activeTab: any = { tabTitle: 'List' };

    propagateChange: (val: any) => void = () => {};

    constructor(
        public api: ApiService,
        private itemsService: ItemsService,
        private toastrService: NbToastrService,
        private dialogService: NbDialogService
    ) {}

    ngOnInit() {
        const filteredItemIds$ = this.reload$.pipe(
            switchMap(() => combineLatest([this.reservationsStart$, this.reservationsEnd$, this.skipReservationId$])),
            debounceTime(200),
            switchMap(([reservationStart, reservationEnd, skipReservationId]) => {
                if (reservationStart && reservationEnd) {
                    return this.api.getReservationItems(reservationStart, reservationEnd, skipReservationId);
                }
                return of([]);
            }),
            map((filteredItemIds) => {
                const mapping: { [id: string]: boolean } = {};
                filteredItemIds.forEach((itemId) => {
                    mapping[itemId] = true;
                });
                return mapping;
            }),
            tap((x) => console.log('filteredItemIds$', x)),
            shareReplay(1)
        );
        this.reload$.pipe(skip(1), takeUntil(this.destroyed$)).subscribe(() => this.itemsService.reload());
        this.items$ = combineLatest([filteredItemIds$, this.itemsService.items$]).pipe(
            map(([filteredItemIds, items]) => {
                return items.map((item, index) => {
                    return {
                        ...item,
                        available: !filteredItemIds[item.id],
                        index,
                        filterLookup: (
                            item.name +
                            '\0' +
                            item.description +
                            '\0' +
                            item.externalId +
                            '\0' +
                            item.tags.join('\0')
                        ).toLowerCase(),
                    };
                });
            }),
            takeUntil(this.destroyed$)
        );

        this.items$.subscribe((items) => {
            const itemsById: { [id: string]: ItemWithAvailability } = items.reduce((obj, item) => {
                obj[item.id] = item;
                return obj;
            }, Object.create(null));
            const foundItems = this.selected.filter((selectedId) => Object.hasOwnProperty.call(itemsById, selectedId));
            if (foundItems.length !== this.selected.length) {
                this.toastrService.danger(
                    `${
                        this.selected.length - foundItems.length
                    } items were removed from your reservation, because they do not exist any more`
                );
            }
            const availableItems = foundItems.filter((selectedId) => itemsById[selectedId].available);
            if (availableItems.length !== foundItems.length) {
                const removedItems = foundItems
                    .filter((selectedId) => !itemsById[selectedId].available)
                    .map((itemId) => itemsById[itemId])
                    .map((item) => `${item.name} (${item.externalId})`)
                    .join(', ');
                this.toastrService.danger(
                    `${
                        foundItems.length - availableItems.length
                    } items were removed from your reservation, because they are not available: ${removedItems}`
                );
            }

            if (this.selected.length !== availableItems.length) {
                this.selected = availableItems;
                this.selectedLookup = availableItems.reduce((obj, item) => {
                    obj[item] = true;
                    return obj;
                }, {});
                this.propagateChange(this.selected);
                this.selected$.next(this.selected);
                this.selectedLookup$.next(this.selectedLookup);
            }
        });

        this.itemGroups$ = this.items$.pipe(
            map((items) => {
                const groupsById = Object.create(null);
                const groups = [];
                items.forEach((item) => {
                    if (item.groupId) {
                        if (Object.hasOwnProperty.call(groupsById, item.groupId)) {
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
        this.destroyed$.next();
    }

    ngOnChanges(): void {}

    select(id: string) {
        if (this.disabled) {
            return;
        }
        this.selected.push(id);
        this.selectedLookup[id] = true;
        console.log('select', id);
        this.propagateChange(this.selected);
        this.selected$.next(this.selected);
        this.selectedLookup$.next(this.selectedLookup);
    }

    deselect(id: string) {
        if (this.disabled) {
            return;
        }
        console.log('deselect', id);
        const idx = this.selected.indexOf(id);
        if (~idx) {
            this.selected.splice(idx, 1);
            delete this.selectedLookup[id];
        }
        this.propagateChange(this.selected);
        this.selected$.next(this.selected);
        this.selectedLookup$.next(this.selectedLookup);
    }

    setSelected(id: string, selected: boolean) {
        if (this.disabled) {
            return;
        }
        console.log(id, selected);
        if (selected) {
            this.select(id);
        } else {
            this.deselect(id);
        }
    }

    isSelected(id: string): boolean {
        return this.selectedLookup[id];
    }

    writeValue(value) {
        if (value) {
            if (!(value instanceof Array)) {
                throw Error('Invalid value for reservation items');
            }
            this.selected = value;
            this.selectedLookup = value.reduce((obj, item) => {
                obj[item] = true;
                return obj;
            }, {});
            this.selected$.next(this.selected);
            this.selectedLookup$.next(this.selectedLookup);
            console.log('selected', this.selected);
        } else {
            this.selected = [];
            this.selectedLookup = {};
            this.selected$.next(this.selected);
            this.selectedLookup$.next(this.selectedLookup);
        }
    }

    registerOnChange(fn) {
        this.propagateChange = fn;
    }

    registerOnTouched() {}

    setDisabledState(isDisabled: boolean) {
        this.disabled = isDisabled;
    }

    getItemPicturePreviewUrl(item: ItemWithAvailability): string {
        return this.api.getPicturePreviewUrl(item.pictureId);
    }

    getItemPictureUrl(item: ItemWithAvailability): string {
        return this.api.getPictureUrl(item.pictureId);
    }

    openDialog($event: MouseEvent | null, imageDialog: TemplateRef<any>, item: ItemWithAvailability) {
        $event?.preventDefault();
        $event?.stopPropagation();
        this.imageLoading = true;
        this.dialogService.open(imageDialog, {
            hasBackdrop: true,
            closeOnBackdropClick: true,
            context: item,
            hasScroll: false,
            autoFocus: true,
        });
    }

    itemGroupSelectedCount(items: ItemWithAvailability[]): number {
        return items.reduce((val, item) => val + (this.selectedLookup[item.id] ? 1 : 0), 0);
    }

    itemGroupSelectableCount(items: ItemWithAvailability[]): number {
        return items.reduce((val, item) => val + (item.available ? 1 : 0), 0);
    }

    itemGroupCanSelectMore(items: ItemWithAvailability[]): boolean {
        return items.some((item) => item.available && !this.selectedLookup[item.id]);
    }

    addToGroup(items: ItemWithAvailability[], count: number = 1) {
        if (this.disabled) {
            return;
        }
        items.forEach((item) => {
            if (count > 0) {
                if (item.available && !this.selectedLookup[item.id]) {
                    this.select(item.id);
                    count -= 1;
                }
            }
        });
    }

    removeFromGroup(items: ItemWithAvailability[], count: number = 1) {
        if (this.disabled) {
            return;
        }
        items.forEach((item) => {
            if (count > 0) {
                if (this.selectedLookup[item.id]) {
                    this.deselect(item.id);
                    count -= 1;
                }
            }
        });
    }

    setGroupCount(items: ItemWithAvailability[], count: number) {
        if (this.disabled) {
            return;
        }
        const currentCount = this.itemGroupSelectedCount(items);
        if (count > currentCount) {
            this.addToGroup(items, count - currentCount);
        } else if (count < currentCount) {
            this.removeFromGroup(items, currentCount - count);
        }
    }
}
