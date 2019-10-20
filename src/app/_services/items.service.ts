import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { multicast, refCount, switchMap, map } from 'rxjs/operators';
import { ReplaySubject, Observable, BehaviorSubject } from 'rxjs';
import { Item } from '../_models';

@Injectable({
    providedIn: 'root',
})
export class ItemsService {
    private readonly reload$ = new BehaviorSubject<void>(undefined);
    public readonly items$: Observable<Item[]>;
    public readonly itemTags$: Observable<string[]>;

    constructor(api: ApiService) {
        this.items$ = this.reload$.pipe(
            switchMap(() => api.getItems()),
            multicast(() => new ReplaySubject<Item[]>(1)),
            refCount()
        );
        this.itemTags$ = this.reload$.pipe(
            switchMap(() => this.items$),
            map(items => [...new Set([].concat(...items.map(item => item.tags)))].sort()),
            multicast(() => new ReplaySubject<string[]>(1)),
            refCount()
        );
    }

    reload() {
        this.reload$.next();
    }
}
