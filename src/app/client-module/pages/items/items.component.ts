import { ChangeDetectorRef, Component, OnDestroy, OnInit, ChangeDetectionStrategy, TemplateRef } from '@angular/core';
import { BehaviorSubject, combineLatest, merge, Observable, Subject } from 'rxjs';
import { Item, ItemCondition } from '../../../common-module/_models';
import { ApiService, ItemsService } from '../../../common-module/_services';
import { ActivatedRoute, Router } from '@angular/router';
import { map, mergeAll, shareReplay, takeUntil } from 'rxjs/operators';
import {
    NbSortDirection,
    NbSortRequest,
    NbTreeGridDataSource,
    NbTreeGridDataSourceBuilder,
    NbDialogService,
} from '@nebular/theme';
import { Choice } from '../../../common-module/components/form-element/form-element.component';

interface ItemWithConditionText extends Item {
    conditionText: string;

    originalOrder?: number;
}

interface ItemEntry {
    data: ItemWithConditionText;

    children?: ItemEntry[];

    expanded?: boolean;
}

@Component({
    selector: 'depot-items',
    templateUrl: './items.component.html',
    styleUrls: ['./items.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ItemsComponent implements OnInit, OnDestroy {
    loading: boolean;
    items$: Observable<ItemWithConditionText[]>;

    showGrouped$: BehaviorSubject<boolean> = new BehaviorSubject(true);

    allColumns = [
        'externalId',
        'name',
        'description',
        'conditionText',
        'purchaseDate',
        'lastService',
        'bay',
        'picture',
        'tags',
        'action',
        'action-details',
    ];

    dataSource: NbTreeGridDataSource<ItemEntry> = null;
    sorting: NbSortRequest = { column: 'originalOrder', direction: NbSortDirection.ASCENDING };

    filter: string;

    editItem: ItemWithConditionText = null;

    conditionTranslation: Record<ItemCondition, string> = {
        good: 'Good',
        ok: 'Ok',
        bad: 'Bad',
        gone: 'Gone',
    };

    conditionChoices: Choice<number>[] = [1, 2, 3, 4].map((value) => {
        return {
            value,
            title: this.conditionTranslation[value],
        };
    });

    showUnavailable = false;

    private destroyed$ = new Subject<void>();

    private allItems$ = new Subject<Item[]>();

    constructor(
        public api: ApiService,
        public itemsService: ItemsService,
        public activatedRoute: ActivatedRoute,
        public router: Router,
        private dataSourceBuilder: NbTreeGridDataSourceBuilder<ItemEntry>,
        private changeDetector: ChangeDetectorRef,
        private dialogService: NbDialogService
    ) {}

    ngOnInit() {
        this.items$ = merge(this.itemsService.items$, this.allItems$).pipe(
            map((items) =>
                items.map((item) => {
                    return {
                        ...item,
                        conditionText:
                            this.conditionTranslation[item.condition] +
                            (item.conditionComment ? ': ' + item.conditionComment : ''),
                    };
                })
            ),
            shareReplay(1),
            takeUntil(this.destroyed$)
        );

        const itemEntries$ = combineLatest([this.showGrouped$, this.items$]).pipe(
            map(([showGrouped, items]) => {
                if (showGrouped) {
                    const itemEntries: ItemEntry[] = [];
                    const itemsByGroupId: { [id: string]: ItemEntry } = Object.create(null);
                    items.forEach((item, idx) => {
                        if (item.groupId) {
                            if (Object.hasOwnProperty.call(itemsByGroupId, item.groupId)) {
                                itemsByGroupId[item.groupId].children.push({ data: { ...item, originalOrder: idx } });
                            } else {
                                const itemEntry = {
                                    data: { ...item, originalOrder: idx },
                                    children: [
                                        {
                                            data: item,
                                        },
                                    ],
                                    expanded: false,
                                };
                                itemsByGroupId[item.groupId] = itemEntry;
                                itemEntries.push(itemEntry);
                            }
                        } else {
                            itemEntries.push({ data: { ...item, originalOrder: idx } });
                        }
                    });
                    return itemEntries;
                } else {
                    return items.map((item, idx) => {
                        return { data: { ...item, originalOrder: idx } };
                    });
                }
            }),
            shareReplay(1),
            takeUntil(this.destroyed$)
        );
        itemEntries$.subscribe((entries) => {
            this.dataSource = this.dataSourceBuilder.create(entries);
            this.dataSource.filter(this.filter);
            this.dataSource.sort(this.sorting);
            this.changeDetector.markForCheck();
        });
    }

    updateSort(sortRequest: NbSortRequest): void {
        this.sorting = sortRequest;
        console.log('Sort:', sortRequest);
        if (sortRequest.direction === NbSortDirection.NONE) {
            this.sorting = { column: 'originalOrder', direction: NbSortDirection.ASCENDING };
            this.dataSource.sort({ column: 'originalOrder', direction: NbSortDirection.ASCENDING });
        }
        this.changeDetector.markForCheck();
    }

    getSortDirection(column: string): NbSortDirection {
        if (this.sorting.column === column) {
            return this.sorting.direction;
        }
        return NbSortDirection.NONE;
    }

    ngOnDestroy() {
        this.destroyed$.next();
    }

    onCreate() {
        this.router.navigate(['new'], { relativeTo: this.activatedRoute });
    }

    getItemPicturePreviewUrl(item: Item): string {
        return this.api.getPicturePreviewUrl(item.pictureId);
    }

    onClickItem($event: MouseEvent, item: Item) {
        $event.stopPropagation();
        $event.preventDefault();
        this.router.navigate([item.id], { relativeTo: this.activatedRoute.parent });
    }

    openDialog($event: MouseEvent, imageDialog: TemplateRef<any>, item: Item) {
        $event.preventDefault();
        $event.stopPropagation();
        this.dialogService.open(imageDialog, {
            hasBackdrop: true,
            closeOnBackdropClick: true,
            context: item,
            hasScroll: false,
            autoFocus: true,
        });
    }

    reload() {
        if (this.showUnavailable) {
            this.onShowUnavailable(this.showUnavailable);
        } else {
            this.itemsService.reload();
        }
    }

    onShowUnavailable(showUnavailable: boolean) {
        if (showUnavailable) {
            this.api
                .getItems(true)
                .pipe(takeUntil(this.destroyed$))
                .subscribe((items) => this.allItems$.next(items));
        } else {
            this.itemsService.reload();
        }
    }
}
