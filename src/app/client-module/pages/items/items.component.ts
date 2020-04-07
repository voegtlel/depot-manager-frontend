import { ChangeDetectorRef, Component, OnDestroy, OnInit, ChangeDetectionStrategy, TemplateRef } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable, Subject } from 'rxjs';
import { Item } from '../../../common-module/_models';
import { ApiService, ItemsService } from '../../../common-module/_services';
import { ActivatedRoute, Router } from '@angular/router';
import { map, shareReplay, takeUntil } from 'rxjs/operators';
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

    conditionTranslation: Record<number, string> = {
        1: 'Good',
        2: 'Ok',
        3: 'Bad',
        4: 'Gone',
    };

    conditionChoices: Choice<number>[] = [1, 2, 3, 4].map(value => {
        return {
            value,
            title: this.conditionTranslation[value],
        };
    });

    private destroyed$ = new Subject<void>();

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
        this.items$ = this.itemsService.items$.pipe(
            map(items =>
                items.map(item => {
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
                    const itemsByGroupId: { [id: string]: ItemEntry } = {};
                    items.forEach((item, idx) => {
                        if (item.groupId) {
                            if (itemsByGroupId.hasOwnProperty(item.groupId)) {
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
        itemEntries$.subscribe(entries => {
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
}
