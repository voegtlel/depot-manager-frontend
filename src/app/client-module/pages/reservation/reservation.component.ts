import { Component, OnDestroy, OnInit } from '@angular/core';
import { ApiService, AuthService } from '../../../common-module/_services';
import { BehaviorSubject, Observable, of, Subject, combineLatest } from 'rxjs';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Reservation, ReservationType } from '../../../common-module/_models';
import { ActivatedRoute, Router } from '@angular/router';
import { NbToastrService } from '@nebular/theme';
import { map, shareReplay, switchMap, takeUntil } from 'rxjs/operators';

@Component({
    selector: 'depot-reservation',
    templateUrl: './reservation.component.html',
})
export class ReservationComponent implements OnInit, OnDestroy {
    private destroyed$ = new Subject<void>();

    loading: boolean;
    submitted: boolean;

    isNew: boolean;

    reload$: BehaviorSubject<void> = new BehaviorSubject(undefined);

    teams$: Observable<{ value: string; title: string }[]>;

    reservationId: string = null;

    readonly form: FormGroup = new FormGroup({
        name: new FormControl('', Validators.required),
        type: new FormControl(null, Validators.required),
        start: new FormControl(null, Validators.required),
        end: new FormControl(null, Validators.required),
        teamId: new FormControl({ value: null, disabled: true }),
        contact: new FormControl('', Validators.required),
        items: new FormControl([]),
    });
    readonly userId = new FormControl({ value: '', disabled: true });

    reservationChoices = [
        { value: ReservationType.Private, title: 'Private' },
        { value: ReservationType.Team, title: 'Team' },
    ];

    constructor(
        public api: ApiService,
        public authService: AuthService,
        public activatedRoute: ActivatedRoute,
        public router: Router,
        private toastrService: NbToastrService
    ) {}

    ngOnInit() {
        const reservationId$ = this.activatedRoute.paramMap.pipe(map(params => params.get('reservationId')));
        const loadedReservation$ = this.reload$.pipe(
            switchMap(() => reservationId$),
            switchMap(reservationId => {
                if (reservationId && reservationId !== 'new') {
                    return this.api.getReservation(reservationId);
                }
                return of(null);
            }),
            shareReplay(1),
            takeUntil(this.destroyed$)
        );

        this.teams$ = this.authService.user$.pipe(map(user => user.teams.map(team => ({ value: team, title: team }))));

        combineLatest([loadedReservation$, this.authService.user$])
            .pipe(takeUntil(this.destroyed$))
            .subscribe(([reservation, user]) => {
                if (reservation !== null) {
                    this.reservationId = reservation.id;
                    this.userId.reset(reservation.userId);
                    this.isNew = false;
                    this.form.reset(reservation);

                    if (reservation.userId === user.id || user.teams.includes(reservation.teamId)) {
                        this.form.enable();
                    } else {
                        this.form.disable();
                    }
                } else {
                    this.reservationId = null;
                    this.isNew = true;
                    this.userId.reset(null);
                    this.form.reset({
                        id: null,
                        type: null,
                        name: '',
                        start: null,
                        end: null,

                        teamId: null,
                        contact: '',

                        items: [],
                    });
                }
                this.onTypeChange(this.form.get('type').value);
                this.submitted = false;
                this.loading = false;
            });

        loadedReservation$
            .pipe(
                switchMap(reservation => (reservation ? this.api.getUser(reservation.userId) : this.authService.user$)),
                map(user => user.name),
                takeUntil(this.destroyed$)
            )
            .subscribe(username => {
                this.userId.reset(username);
            });

        loadedReservation$
            .pipe(
                switchMap(reservation => (reservation ? of(null) : this.authService.user$)),
                takeUntil(this.destroyed$)
            )
            .subscribe(user => {
                if (user !== null) {
                    this.form.get('contact').reset(`${user.name} (${user.mail}, ${user.mobile})`);
                }
            });
    }

    ngOnDestroy(): void {
        this.destroyed$.next();
    }

    onTypeChange($event) {
        if ($event === ReservationType.Team) {
            this.form.get('teamId').enable();
        } else {
            this.form.get('teamId').setValue(null);
            this.form.get('teamId').disable();
        }
    }

    onSubmit() {
        console.log('Submit:', this.form.getRawValue());
        this.submitted = true;
        if (!this.form.valid) {
            return;
        }
        let apiCall: Observable<Reservation>;
        if (this.isNew) {
            apiCall = this.api.createReservation(this.form.getRawValue());
        } else {
            apiCall = this.api.saveReservation(this.reservationId, this.form.getRawValue());
        }
        apiCall.subscribe(
            reservation => {
                console.log('Saved', reservation);
                this.form.reset(reservation);
                this.form.markAsPristine();
                this.form.markAsUntouched();
                this.router.navigate(['..', reservation.id], {
                    replaceUrl: true,
                    relativeTo: this.activatedRoute,
                });
                this.toastrService.success('Reservation was saved', 'Reservation Saved');
            },
            error => {
                console.log(error);
                this.toastrService.danger(error, 'Failed');
            }
        );
    }
}
