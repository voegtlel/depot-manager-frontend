import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { multicast, refCount, switchMap, map } from 'rxjs/operators';
import { ReplaySubject, Observable, BehaviorSubject } from 'rxjs';
import { Item, Bay } from '../_models';

@Injectable({
    providedIn: 'root',
})
export class ItemsService {
    private readonly reload$ = new BehaviorSubject<void>(undefined);
    public readonly itemsById$: Observable<Record<string, Item>>;
    public readonly items$: Observable<Item[]>;
    public readonly itemsByGroupId$: Observable<Record<string, Item[]>>;
    public readonly baysById$: Observable<Record<string, Bay>>;
    public readonly bays$: Observable<Bay[]>;
    public readonly itemTags$: Observable<string[]>;

    constructor(api: ApiService) {
        this.items$ = this.reload$.pipe(
            switchMap(() => api.getItems()),
            multicast(() => new ReplaySubject<Item[]>(1)),
            refCount()
        );
        this.itemsById$ = this.items$.pipe(
            map((items) =>
                items.reduce((o, el) => {
                    o[el.id] = el;
                    return o;
                }, Object.create(null) as Record<string, Item>)
            ),
            multicast(() => new ReplaySubject<Record<string, Item>>(1)),
            refCount()
        );
        this.itemsByGroupId$ = this.items$.pipe(
            map((items) =>
                items.reduce((o, el) => {
                    if (el.groupId != null) {
                        if (Object.hasOwnProperty.call(o, el.groupId)) {
                            o[el.groupId].push(el);
                        } else {
                            o[el.groupId] = [el];
                        }
                    }
                    return o;
                }, Object.create(null) as Record<string, Item[]>)
            ),
            multicast(() => new ReplaySubject<Record<string, Item[]>>(1)),
            refCount()
        );
        this.bays$ = this.reload$.pipe(
            switchMap(() => api.getBays()),
            multicast(() => new ReplaySubject<Bay[]>(1)),
            refCount()
        );
        this.baysById$ = this.bays$.pipe(
            map((bays) =>
                bays.reduce((o, el) => {
                    o[el.id] = el;
                    return o;
                }, Object.create(null) as Record<string, Bay>)
            ),
            multicast(() => new ReplaySubject<Record<string, Bay>>(1)),
            refCount()
        );
        this.itemTags$ = this.reload$.pipe(
            switchMap(() => this.items$),
            map((items) => [...new Set([].concat(...items.map((item) => item.tags)))].sort()),
            multicast(() => new ReplaySubject<string[]>(1)),
            refCount()
        );
    }

    reload() {
        this.reload$.next();
    }
}
