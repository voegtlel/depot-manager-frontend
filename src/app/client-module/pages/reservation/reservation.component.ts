import { Component, OnDestroy, OnInit } from '@angular/core';
import { ApiService, AuthService } from '../../../common-module/_services';
import { BehaviorSubject, Observable, of, Subject, combineLatest } from 'rxjs';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Reservation, ReservationType, UserModel } from '../../../common-module/_models';
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
    readonly userName = new FormControl({ value: '', disabled: true });
    userIdRaw$ = new BehaviorSubject<string>(null);

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
        const reservationId$ = this.activatedRoute.paramMap.pipe(map((params) => params.get('reservationId')));
        const loadedReservation$: Observable<Reservation> = this.reload$.pipe(
            switchMap(() => reservationId$),
            switchMap((reservationId) => {
                if (reservationId && reservationId !== 'new') {
                    return this.api.getReservation(reservationId);
                }
                return of(null);
            }),
            shareReplay(1),
            takeUntil(this.destroyed$)
        );

        this.teams$ = this.authService.user$.pipe(
            map((user) => user.groups.map((team) => ({ value: team, title: team })))
        );

        combineLatest([loadedReservation$, this.authService.user$])
            .pipe(takeUntil(this.destroyed$))
            .subscribe(([reservation, user]) => {
                if (reservation !== null) {
                    this.reservationId = reservation.id;
                    this.isNew = false;
                    this.userName.reset(reservation.userId);
                    this.userIdRaw$.next(reservation.userId);
                    this.form.reset(reservation);

                    if (reservation.userId === user.sub || user.groups.includes(reservation.teamId)) {
                        this.form.enable();
                    } else {
                        this.form.disable();
                    }
                } else {
                    this.reservationId = null;
                    this.isNew = true;
                    this.userName.reset(user.sub);
                    this.userIdRaw$.next(user.sub);
                    this.form.reset({
                        id: null,
                        type: null,
                        name: '',
                        start: null,
                        end: null,

                        teamId: null,
                        contact: `${user.name} (${user.email}, ${user.phone_number})`,

                        items: [],
                    });
                }
                this.onTypeChange(this.form.get('type').value);
                this.submitted = false;
                this.loading = false;
            });

        this.userIdRaw$
            .pipe(
                switchMap((userId) =>
                    userId && userId !== this.authService.userId ? this.api.getUser(userId) : this.authService.user$
                ),
                takeUntil(this.destroyed$)
            )
            .subscribe((user) => {
                if (user) {
                    this.userName.reset(user.name);
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
        this.submitted = true;
        if (!this.form.valid) {
            return;
        }
        let apiCall: Observable<Reservation>;
        const formValue = this.form.getRawValue();
        formValue.userId = this.userIdRaw$.value;
        console.log('Submit:', formValue);
        if (this.isNew) {
            apiCall = this.api.createReservation(formValue);
        } else {
            apiCall = this.api.saveReservation(this.reservationId, formValue);
        }
        apiCall.subscribe(
            (reservation) => {
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
            (error) => {
                console.log(error);
                this.toastrService.danger(error, 'Failed');
            }
        );
    }
}
