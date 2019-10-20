import { Component, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, Observable, of, ReplaySubject, Subject } from 'rxjs';
import { ApiService } from '../../_services';
import { ActivatedRoute, Router } from '@angular/router';
import { NbMenuItem } from '@nebular/theme';
import { Reservation } from '../../_models';
import { map, shareReplay, switchMap, takeUntil } from 'rxjs/operators';

@Component({
    selector: 'depot-reservations',
    templateUrl: './reservations.component.html',
    styleUrls: ['./reservations.component.scss'],
})
export class ReservationsComponent implements OnInit, OnDestroy {
    private destroyed$ = new Subject<void>();
    reload$: BehaviorSubject<void> = new BehaviorSubject(undefined);
    loading: boolean;
    reservations$ = new ReplaySubject<Reservation[]>(1);
    reservations: Reservation[] = [];

    limit$ = new BehaviorSubject<number>(30);
    placeholders$ = new ReplaySubject<void[]>(1);

    constructor(public api: ApiService, public activatedRoute: ActivatedRoute, public router: Router) {}

    ngOnInit() {
        let end = false;

        this.reload$.subscribe(() => {
            this.reservations = [];
            end = false;
            this.limit$.next(30);
        });
        this.limit$.subscribe(limit => {
            if (!end) {
                this.placeholders$.next(new Array(limit - this.reservations.length));
            }
        });
        this.limit$
            .pipe(
                switchMap(limit => {
                    if (!end) {
                        return this.api.getReservations(undefined, undefined, this.reservations.length, limit);
                    }
                    return of([]);
                }),
                map(nextReservations => {
                    if (nextReservations.length < 10) {
                        end = true;
                    }
                    this.reservations.push(...nextReservations);
                    this.placeholders$.next([]);
                    return this.reservations;
                }),
                shareReplay(1),
                takeUntil(this.destroyed$)
            )
            .subscribe(this.reservations$);
    }

    ngOnDestroy() {
        this.destroyed$.next();
    }

    onCreate() {
        this.router.navigate(['new'], { relativeTo: this.activatedRoute });
    }

    onLoadNext() {
        const nextValue = this.limit$.value + 10;
        if (nextValue <= this.reservations.length + 10) {
            console.log('loadNext:', nextValue);
            this.limit$.next(nextValue);
        }
    }

    onClickReservation(reservation: Reservation) {
        this.router.navigate([reservation.id], { relativeTo: this.activatedRoute });
    }
}
