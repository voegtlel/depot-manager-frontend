import {Component, OnDestroy, OnInit} from '@angular/core';
import {BehaviorSubject, combineLatest, Observable, Subject} from "rxjs";
import {Item, Reservation} from "../../_models";
import {ApiService} from "../../_services";
import {ActivatedRoute, Router} from "@angular/router";
import {map, shareReplay, switchMap, takeUntil} from "rxjs/operators";
import {NbSortDirection, NbSortRequest, NbTreeGridDataSource, NbTreeGridDataSourceBuilder} from "@nebular/theme";


interface ItemWithConditionText extends Item {
    conditionText: string;
}


interface ItemEntry {
    data: ItemWithConditionText;

    children?: ItemEntry[];

    expanded?: boolean;
}


@Component({
    selector: 'depot-items',
    templateUrl: './items.component.html',
    styleUrls: ['./items.component.scss']
})
export class ItemsComponent implements OnInit, OnDestroy {
    reload$: BehaviorSubject<void> = new BehaviorSubject(undefined);
    loading: boolean;
    items$: Observable<ItemWithConditionText[]>;
    items: Reservation[] = [];

    showGrouped$: BehaviorSubject<boolean> = new BehaviorSubject(true);

    allColumns = ['name', 'description', 'conditionText', 'purchaseDate', 'lastService', 'picture', 'tags'];

    dataSource: NbTreeGridDataSource<ItemEntry> = null;
    sortColumn: string;
    sortDirection: NbSortDirection = NbSortDirection.NONE;

    filter: string;

    conditionTranslation = {
        1: "Good",
        2: "Ok",
        3: "Bad",
        4: "Gone",
    };

    private stop$ = new Subject<void>();

    constructor(
        public api: ApiService,
        public activatedRoute: ActivatedRoute,
        public router: Router,
        private dataSourceBuilder: NbTreeGridDataSourceBuilder<ItemEntry>
    ) {
    }

    ngOnInit() {
        this.items$ = this.reload$.pipe(
            switchMap(() => this.api.getItems()),
            map(items => items.map(item => {
                return {...item, conditionText: this.conditionTranslation[item.condition] + (item.conditionComment?": " + item.conditionComment:"")};
            })),
            shareReplay(1),
            takeUntil(this.stop$),
        );

        const itemEntries$ = combineLatest([this.showGrouped$, this.items$]).pipe(
            map(([showGrouped, items]) => {
                if (showGrouped) {
                    const itemEntries: ItemEntry[] = [];
                    const itemsByGroupId: { [id: string]: ItemEntry } = {};
                    items.forEach(item => {
                        if (item.groupId) {
                            if (itemsByGroupId.hasOwnProperty(item.groupId)) {
                                itemsByGroupId[item.groupId].children.push({data: item});
                            } else {
                                const itemEntry = {
                                    data: item,
                                    children: [{
                                        data: item,
                                    }],
                                    expanded: false,
                                };
                                itemsByGroupId[item.groupId] = itemEntry;
                                itemEntries.push(itemEntry);
                            }
                        } else {
                            itemEntries.push({data: item});
                        }
                    });
                    return itemEntries;
                } else {
                    return items.map(item => {return {data: item};});
                }
            }),
            shareReplay(1),
            takeUntil(this.stop$),
        );
        itemEntries$.subscribe(entries => {
            this.dataSource = this.dataSourceBuilder.create(entries);
        });
    }

    updateSort(sortRequest: NbSortRequest): void {
        this.sortColumn = sortRequest.column;
        this.sortDirection = sortRequest.direction;
        console.log(sortRequest);
    }

    getSortDirection(column: string): NbSortDirection {
        if (this.sortColumn === column) {
            return this.sortDirection;
        }
        return NbSortDirection.NONE;
    }

    ngOnDestroy() {
        this.stop$.next();
    }

    onCreate() {
        this.router.navigate(['new'], {relativeTo: this.activatedRoute});
    }

    getItemPicturePreviewUrl(item: Item): string {
        return this.api.getPicturePreviewUrl(item.pictureId);
    }

    onClickItem(item: Item) {
        this.router.navigate([item.id], {relativeTo: this.activatedRoute});
    }
}
