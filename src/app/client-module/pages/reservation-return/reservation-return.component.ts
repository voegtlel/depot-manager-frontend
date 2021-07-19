import { Component, OnDestroy, OnInit } from '@angular/core';
import { ApiService, AuthService, UsersService } from '../../../common-module/_services';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { Reservation } from '../../../common-module/_models';
import { ActivatedRoute, Router } from '@angular/router';
import { NbToastrService } from '@nebular/theme';
import { map, shareReplay, switchMap, takeUntil } from 'rxjs/operators';

@Component({
    selector: 'depot-reservation-return',
    templateUrl: './reservation-return.component.html',
})
export class ReservationReturnComponent implements OnInit, OnDestroy {
    private destroyed$ = new Subject<void>();

    loading: boolean;
    submitted: boolean;

    reload$: BehaviorSubject<void> = new BehaviorSubject(undefined);

    reservationId: string = null;

    readonly returnItemsForm = new FormArray([]);
    readonly form = new FormGroup({
        items: this.returnItemsForm,
    });
    reservation$: Observable<Reservation>;

    constructor(
        public api: ApiService,
        public authService: AuthService,
        public activatedRoute: ActivatedRoute,
        public router: Router,
        private toastrService: NbToastrService
    ) {}

    ngOnInit() {
        const reservationId$ = this.activatedRoute.paramMap.pipe(map((params) => params.get('reservationId')));
        this.reservation$ = this.reload$.pipe(
            switchMap(() => reservationId$),
            switchMap((reservationId) => this.api.getReservation(reservationId)),
            shareReplay(1),
            takeUntil(this.destroyed$)
        );
        reservationId$
            .pipe(takeUntil(this.destroyed$))
            .subscribe((reservationId) => (this.reservationId = reservationId));
        this.reservation$.pipe(takeUntil(this.destroyed$)).subscribe((reservation) => {
            this.returnItemsForm.clear();
            for (const itemId of reservation.items) {
                this.returnItemsForm.push(
                    new FormGroup({
                        itemId: new FormControl(itemId),
                        problem: new FormControl(null, Validators.required),
                        comment: new FormControl(null),
                    })
                );
            }
            this.loading = false;
        });
    }

    ngOnDestroy(): void {
        this.destroyed$.next();
    }

    onSubmit() {
        this.submitted = true;
        if (!this.form.valid) {
            return;
        }
        const formValue = this.form.getRawValue();
        console.log('Submit:', formValue);
        this.api.returnReservation(this.reservationId, formValue).subscribe(
            () => {
                console.log('Saved');
                this.router.navigate(['/'], { replaceUrl: true });
                this.toastrService.success('Saved return of reservation', 'Reservation Saved');
            },
            (error) => {
                console.log(error);
                this.toastrService.danger(error, 'Failed');
            }
        );
    }
}
