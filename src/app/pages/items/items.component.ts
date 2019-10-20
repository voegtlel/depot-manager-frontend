import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable, Subject } from 'rxjs';
import { Item, Reservation } from '../../_models';
import { ApiService, ItemsService } from '../../_services';
import { ActivatedRoute, Router } from '@angular/router';
import { map, shareReplay, switchMap, takeUntil } from 'rxjs/operators';
import { NbSortDirection, NbSortRequest, NbTreeGridDataSource, NbTreeGridDataSourceBuilder } from '@nebular/theme';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Choice } from '../form-element/form-element.component';

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
    styleUrls: ['./items.component.scss'],
})
export class ItemsComponent implements OnInit, OnDestroy {
    loading: boolean;
    items$: Observable<ItemWithConditionText[]>;
    items: Reservation[] = [];

    showGrouped$: BehaviorSubject<boolean> = new BehaviorSubject(true);

    allColumns = [
        'externalId',
        'name',
        'description',
        'conditionText',
        'purchaseDate',
        'lastService',
        'picture',
        'tags',
        'action',
    ];

    dataSource: NbTreeGridDataSource<ItemEntry> = null;
    sortColumn: string;
    sortDirection: NbSortDirection = NbSortDirection.NONE;

    filter: string;

    editItem: ItemWithConditionText = null;

    conditionTranslation: Record<number, string> = {
        1: 'Good',
        2: 'Ok',
        3: 'Bad',
        4: 'Gone',
    };

    readonly form: FormGroup = new FormGroup({
        name: new FormControl('', Validators.required),
        description: new FormControl('', Validators.required),
        condition: new FormControl(null, Validators.required),
        conditionComment: new FormControl(null),
        purchaseDate: new FormControl(null),
        lastService: new FormControl(null),
        pictureId: new FormControl(null),
        tags: new FormControl([]),
    });

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
        private dataSourceBuilder: NbTreeGridDataSourceBuilder<ItemEntry>
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
                    items.forEach(item => {
                        if (item.groupId) {
                            if (itemsByGroupId.hasOwnProperty(item.groupId)) {
                                itemsByGroupId[item.groupId].children.push({ data: item });
                            } else {
                                const itemEntry = {
                                    data: item,
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
                            itemEntries.push({ data: item });
                        }
                    });
                    return itemEntries;
                } else {
                    return items.map(item => {
                        return { data: item };
                    });
                }
            }),
            shareReplay(1),
            takeUntil(this.destroyed$)
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

    updateConditionText(item: ItemWithConditionText) {
        item.conditionText =
            this.conditionTranslation[item.condition] + (item.conditionComment ? ': ' + item.conditionComment : '');
    }

    onSubmit() {
        console.log('Submit', this.editItem, this.form.getRawValue());
        this.editItem = null;
    }
}
