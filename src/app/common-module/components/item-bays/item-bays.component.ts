import { Component, OnInit, Input, OnChanges, SimpleChange, SimpleChanges } from '@angular/core';
import { ItemsService } from '../../_services';
import { Reservation, Item, Bay } from '../../_models';
import { combineLatest, Observable, BehaviorSubject } from 'rxjs';
import { AsyncInput } from '@ng-reactive/async-input';
import { map, filter } from 'rxjs/operators';

interface BayWithItems extends Bay {
    items: Item[];
}

@Component({
    selector: 'depot-item-bays',
    templateUrl: './item-bays.component.html',
    styleUrls: ['./item-bays.component.scss'],
})
export class ItemBaysComponent implements OnInit, OnChanges {
    @Input() reservation: Reservation;

    @AsyncInput() reservation$ = new BehaviorSubject<Reservation>(null);

    bays$: Observable<BayWithItems[]>;

    constructor(private itemsService: ItemsService) {
        this.reservation$.subscribe((res) => console.log('Res:', res));
        console.log('InitRes:', this.reservation);
        this.bays$ = combineLatest([
            this.reservation$.pipe(filter((r) => !!r)),
            this.itemsService.items$,
            this.itemsService.bays$,
        ]).pipe(
            map(([reservation, items, bays]) => {
                console.log('resitemsbay', reservation, items, bays);
                const baysById: Record<string, Bay> = bays.reduce((res, bay) => {
                    res[bay.id] = bay;
                    return res;
                }, {});
                baysById._ = {
                    description: '',
                    externalId: '',
                    id: '',
                    name: '',
                };
                const itemsById: Record<string, Item> = items.reduce((res, item) => {
                    res[item.id] = item;
                    return res;
                }, {});
                const mappedItems = reservation.items.map((itemId) => itemsById[itemId]);
                const currentBays: BayWithItems[] = [];
                const currentBaysById: Record<string, BayWithItems> = {};
                for (const item of mappedItems) {
                    const bayId = item.bayId || '_';
                    if (!currentBaysById.hasOwnProperty(bayId)) {
                        const newBay = { items: [item], ...baysById[bayId] };
                        currentBaysById[bayId] = newBay;
                        currentBays.push(newBay);
                    } else {
                        currentBaysById[bayId].items.push(item);
                    }
                }
                return currentBays;
            })
        );
    }

    ngOnInit() {}

    ngOnChanges() {}
}
