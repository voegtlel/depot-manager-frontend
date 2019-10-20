import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { multicast, refCount, switchMap } from 'rxjs/operators';
import { ReplaySubject, Observable, BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class ItemTagsService {
    private readonly reload$ = new BehaviorSubject<void>(undefined);
    public readonly itemTags$: Observable<string[]>;

    constructor(api: ApiService) {
        this.itemTags$ = this.reload$.pipe(
            switchMap(() => api.getItemTags()),
            multicast(() => new ReplaySubject<string[]>(1)),
            refCount()
        );
    }

    reload() {
        this.reload$.next();
    }
}
