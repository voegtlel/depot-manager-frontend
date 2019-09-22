import {Component, OnDestroy, OnInit} from '@angular/core';
import {ApiService, AuthService} from '../../_services';
import {BehaviorSubject, Observable, of, Subject} from "rxjs";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {Reservation, ReservationType} from "../../_models";
import {ActivatedRoute, Router} from "@angular/router";
import {NbToastrService} from "@nebular/theme";
import {shareLast} from "../../_helpers";
import {map, switchMap, takeUntil} from "rxjs/operators";


@Component({
    selector: 'app-reservation',
    templateUrl: './reservation.component.html',
})
export class ReservationComponent implements OnInit, OnDestroy {
    private stop$ = new Subject<void>();

    loading: boolean;
    submitted: boolean;

    isNew: boolean;

    reload$: BehaviorSubject<any> = new BehaviorSubject(null);

    teams$: Observable<{value: string, title: string}[]>;

    value: Reservation = null;

    form: FormGroup = new FormGroup({
        name: new FormControl("", Validators.required),
        type: new FormControl("", Validators.required),
        start: new FormControl("", Validators.required),
        end: new FormControl("", Validators.required),
        teamId: new FormControl(""),
        contact: new FormControl("", Validators.required),
        items: new FormControl([]),
    });
    userId = new FormControl("");

    reservationChoices = {
        Private: ReservationType.Private,
        Team: ReservationType.Team,
    };

    constructor(
        public api: ApiService,
        public authService: AuthService,
        public activatedRoute: ActivatedRoute,
        public router: Router,
        private toastrService: NbToastrService,
    ) {
    }

    ngOnInit() {
        const reservationId$ = this.activatedRoute.paramMap.pipe(map(params => params.get('reservationId')));
        const loadedReservation$ = shareLast(this.reload$.pipe(
            switchMap(() => reservationId$),
            switchMap(reservationId => {
                if (reservationId) {
                    return this.api.getReservation(reservationId);
                }
                return of(null);
            }),
            takeUntil(this.stop$),
        ));

        this.teams$ = this.authService.user$.pipe(map(user => user.teams.map(team => { return {value: team, title: team}; })));

        loadedReservation$.subscribe((reservation) => {
            if (reservation !== null) {
                this.value = {
                    id: reservation.id,
                    type: reservation.type,
                    name: reservation.name,
                    start: new Date(reservation.start),
                    end: new Date(reservation.end),

                    teamId: reservation.teamId,
                    contact: reservation.contact,

                    items: reservation.items,
                };
                this.userId.reset(reservation.userId);
                this.isNew = false;
                this.form.reset(this.value);
            } else {
                this.value = {
                    id: null,
                    type: null,
                    name: "",
                    start: null,
                    end: null,

                    teamId: null,
                    contact: "",

                    items: [],
                };
                this.isNew = true;
                this.userId.reset(null);
                this.form.reset(this.value);
            }
            this.submitted = false;
            this.loading = false;
        });

        loadedReservation$.pipe(
            switchMap(reservation => reservation?this.api.getUser(reservation.userId):this.authService.user$),
            map(user => user.name),
            takeUntil(this.stop$),
        ).subscribe(username => {
            this.userId.reset(username)
        });

        loadedReservation$.pipe(
            switchMap(reservation => reservation?of(null):this.authService.user$),
            takeUntil(this.stop$),
        ).subscribe(user => {
            if (user !== null) {
                this.form.get('contact').reset(`${user.name} (${user.mail}, ${user.mobile})`)
            }
        });
    }

    ngOnDestroy(): void {
        this.stop$.next();
    }

    onTypeChange() {
        this.form.get('teamId').setValue(null);
    }

    onSubmit() {
        console.log("Submit:", this.form.getRawValue());
        if (!this.form.valid) {
            return;
        }
        if (this.isNew) {
            this.api.createReservation(this.form.getRawValue()).subscribe(
                (reservation) => {
                    this.form.reset(reservation);
                    this.form.markAsPristine();
                    this.form.markAsUntouched();
                    this.router.navigate([reservation.id], {
                        replaceUrl: true, skipLocationChange: true, relativeTo: this.activatedRoute.parent
                    });
                    this.toastrService.success("Reservation was saved", "Reservation Created");
                },
                (error) => {
                    console.log(error);
                    this.toastrService.danger(error, "Failed");
                }
            );
        } else {

        }
        // TODO: Decide if form is new --> create
        // TODO: Otherwise --> differential update
    }
}
