import {Component, OnDestroy, OnInit} from '@angular/core';
import {BehaviorSubject, Observable, of, ReplaySubject, Subject} from "rxjs";
import {ApiService, AuthService} from "../../_services";
import {ActivatedRoute, Router} from "@angular/router";
import {NbMenuItem, NbToastrService} from "@nebular/theme";
import {Reservation} from "../../_models";
import {map, shareReplay, switchMap, takeUntil, tap} from "rxjs/operators";

@Component({
    selector: 'depot-reservations',
    templateUrl: './reservations.component.html',
    styleUrls: ['./reservations.component.scss']
})
export class ReservationsComponent implements OnInit, OnDestroy {
    private stop$ = new Subject<void>();
    reload$: BehaviorSubject<void> = new BehaviorSubject(undefined);
    loading: boolean;
    reservations$ = new ReplaySubject<Reservation[]>(1);
    reservations: Reservation[] = [];

    limit$ = new BehaviorSubject<number>(30);
    placeholders$ = new ReplaySubject<void[]>(1);
    reservationItems$: Observable<NbMenuItem[]>;

    constructor(
        public api: ApiService,
        public authService: AuthService,
        public activatedRoute: ActivatedRoute,
        public router: Router,
        private toastrService: NbToastrService,
    ) { }

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
        this.limit$.pipe(
            switchMap(
                limit => {
                    if (!end) {
                        return this.api.getReservations(undefined, undefined, this.reservations.length, limit)
                    }
                    return of([]);
                }
            ),
            map(nextReservations => {
                if (nextReservations.length < 10) {
                    end = true;
                }
                this.reservations.push(...nextReservations);
                this.placeholders$.next([]);
                return this.reservations;
            }),
            shareReplay(1),
            takeUntil(this.stop$),
        ).subscribe(this.reservations$);

        this.reservationItems$ = this.reservations$.pipe(
            map(reservations => reservations.map(reservation => {
                return {
                    title: reservation.name,
                    link: reservation.id,
                };
            }))
        );
    }

    ngOnDestroy() {
        this.stop$.next();
    }

    onCreate() {
        this.router.navigate(['new'], {relativeTo: this.activatedRoute});
    }

    onLoadNext() {
        let nextValue = this.limit$.value + 10;
        if (nextValue <= this.reservations.length + 10) {
            console.log("loadNext:", nextValue);
            this.limit$.next(nextValue);
        }
    }

    onClickReservation(reservation: Reservation) {
        this.router.navigate([reservation.id], {relativeTo: this.activatedRoute});
    }
}
