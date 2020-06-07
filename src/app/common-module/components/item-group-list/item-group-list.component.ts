import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { ItemsService } from '../../_services';
import { Item } from '../../_models';
import { map, shareReplay, takeUntil } from 'rxjs/operators';
import { Subject, Observable } from 'rxjs';

function uuid(a?, b?) {
    for (
        b = a = '';
        a++ < 36;
        b += (a * 51) & 52 ? (a ^ 15 ? 8 ^ (Math.random() * (a ^ 20 ? 16 : 4)) : 4).toString(16) : '-'
    ) {}
    return b;
}

@Component({
    selector: 'depot-item-group-list',
    templateUrl: './item-group-list.component.html',
    styleUrls: ['./item-group-list.component.scss'],
})
export class ItemGroupListComponent implements OnInit, OnDestroy {
    @Input() selectedItemGroup: string;
    @Output() selectItemGroup = new EventEmitter();

    private destroyed$ = new Subject<void>();
    itemGroups$: Observable<Item[]>;

    constructor(private itemsService: ItemsService) {
        this.itemGroups$ = this.itemsService.items$.pipe(
            map((items) => {
                const groupsLookup: Record<string, Item> = {};
                const groups: Item[] = [];
                for (const item of items) {
                    if (item.groupId && !groupsLookup.hasOwnProperty(item.groupId)) {
                        groupsLookup[item.groupId] = item;
                        groups.push(item);
                    }
                }
                return groups;
            }),
            shareReplay(1),
            takeUntil(this.destroyed$)
        );
    }

    newGroup() {
        this.selectItemGroup.emit(uuid());
    }

    noGroup() {
        this.selectItemGroup.emit(null);
    }

    ngOnInit() {}

    ngOnDestroy() {
        this.destroyed$.next();
        this.destroyed$.complete();
    }
}
