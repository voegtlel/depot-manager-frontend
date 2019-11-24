import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { ItemsService } from 'src/app/_services';
import { shareReplay, takeUntil } from 'rxjs/operators';
import { Subject, Observable } from 'rxjs';
import { Bay } from 'src/app/_models';

@Component({
    selector: 'depot-bay-list',
    templateUrl: './bay-list.component.html',
    styleUrls: ['./bay-list.component.scss'],
})
export class BayListComponent implements OnInit, OnDestroy {
    @Input() selectedBay: string;
    @Output() selectBay = new EventEmitter();

    private destroyed$ = new Subject<void>();
    bays$: Observable<Bay[]>;

    constructor(private itemsService: ItemsService) {
        this.bays$ = this.itemsService.bays$.pipe(shareReplay(1), takeUntil(this.destroyed$));
    }

    noBay() {
        this.selectBay.emit(null);
    }

    ngOnInit() {}

    ngOnDestroy() {
        this.destroyed$.next();
        this.destroyed$.complete();
    }
}
