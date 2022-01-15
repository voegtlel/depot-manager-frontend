import { Component, Input, OnDestroy } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable, of, Subject } from 'rxjs';
import { catchError, delay, filter, map, shareReplay, switchMap, take, takeUntil } from 'rxjs/operators';
import { Bay, Item, Reservation, ReservationAction, ReservationState } from 'src/app/common-module/_models';
import { DeviceApiService } from '../../_services/device-api.service';
import { DeviceCodeService } from '../../_services/device-code.service';

enum ReservationActionExt {
    Take = 'take',
    Return = 'return',
    Remove = 'remove',
    Broken = 'broken',
    Missing = 'missing',
    NoAction = 'noAction',
}

interface ItemWithState extends Item {
    state: ReservationState;
    action?: ReservationActionExt;
    comment?: string;
}

interface BayWithItems extends Bay {
    items: ItemWithState[];
}

@Component({
    templateUrl: './reservation.component.html',
    styleUrls: ['./reservation.component.scss'],
})
export class ReservationComponent implements OnDestroy {
    destroyed$ = new Subject<void>();
    targetState: 'taken' | 'returned';
    targetAction: ReservationActionExt;

    sourceState: 'reserved' | 'taken' = 'reserved';

    actionPastText: 'Taken' | 'Returned' = 'Taken';
    actionText: 'Take' | 'Return' = 'Take';

    decideReturnTake$ = new BehaviorSubject(true);
    decidedReturnTake$ = this.decideReturnTake$.pipe(
        filter((x) => !x),
        map(() => this.targetState)
    );

    hasNothing = false;

    ReservationAction = ReservationActionExt;

    stateMap: Record<ReservationState, string> = {
        reserved: 'Reserved',
        taken: 'Taken',
        'return-problem': 'Returned (Problem)',
        returned: 'Returned',
    };

    reservation$: Observable<Reservation> = this.codeService.reservation$.pipe(
        filter((reservation) => reservation != null),
        map((reservation) => reservation.reservation)
    );
    steps$: Observable<BayWithItems[]> = this.decidedReturnTake$.pipe(
        switchMap(() => this.codeService.reservation$),
        filter((reservation) => reservation != null),
        map((reservationData) => {
            const bays: BayWithItems[] = reservationData.bays.map((v) => ({ ...v, items: [] }));
            const baysById: Record<string, BayWithItems> = bays.reduce((o, v) => {
                o[v.id] = v;
                return o;
            }, Object.create(null));
            const itemsById: Record<string, Item> = reservationData.items.reduce((o, v) => {
                o[v.id] = v;
                return o;
            }, Object.create(null));
            const noBayItems: ItemWithState[] = [];
            for (const reservationItem of reservationData.reservation.items) {
                const item = itemsById[reservationItem.itemId];
                if (item == null) {
                    continue;
                }
                const bayItem = { ...item, state: reservationItem.state, action: null };
                const bay = item.bayId == null ? undefined : baysById[item.bayId];
                if (bay == null) {
                    noBayItems.push(bayItem);
                } else {
                    bay.items.push(bayItem);
                }
            }
            bays.unshift({ name: 'N/A', description: 'N/A', id: null, externalId: null, items: noBayItems });
            console.log('Processed Steps', bays);
            return bays;
        }),
        shareReplay(1)
    );

    stepIndex$ = new BehaviorSubject<number>(0);
    step$: Observable<BayWithItems> = combineLatest([this.steps$, this.stepIndex$]).pipe(
        map(([steps, stepIndex]) => steps[stepIndex])
    );
    isOpen$ = new BehaviorSubject<boolean>(false);

    waitForClose$ = new BehaviorSubject<string>(null);

    isValid$ = new BehaviorSubject<boolean>(false);

    constructor(private codeService: DeviceCodeService, private api: DeviceApiService) {
        this.step$
            .pipe(
                filter((step) => step != null),
                filter((step) => step.items.some((item) => item.state === this.sourceState)),
                takeUntil(this.destroyed$)
            )
            .subscribe(() => this.reOpen());
        this.step$
            .pipe(
                filter((step) => step == null),
                takeUntil(this.destroyed$)
            )
            .subscribe(() => this.exit());
        this.waitForClose$
            .pipe(
                filter((bayId) => bayId != null),
                switchMap((bayId) =>
                    api.getBayState(bayId).pipe(
                        catchError(() => of({ open: true })),
                        switchMap(({ open }) => (open ? of({ open, bayId }).pipe(delay(250)) : of({ open, bayId })))
                    )
                ),
                takeUntil(this.destroyed$)
            )
            .subscribe(({ open, bayId }) => {
                if (open) {
                    // Repeat
                    this.waitForClose$.next(bayId);
                } else {
                    this.isOpen$.next(false);
                    this.waitForClose$.next(null);
                }
            });
        this.codeService.reservation$.pipe(take(1), takeUntil(this.destroyed$)).subscribe((reservation) => {
            const hasReserved = reservation.reservation.items.some((item) => item.state === ReservationState.Reserved);
            const hasTaken = reservation.reservation.items.some((item) => item.state === ReservationState.Taken);
            if (hasReserved && !hasTaken) {
                this.startTake();
            } else if (!hasReserved && hasTaken) {
                this.startReturn();
            } else if (!hasReserved && !hasTaken) {
                this.hasNothing = true;
            }
        });
    }

    ngOnDestroy(): void {
        this.destroyed$.next();
        this.destroyed$.complete();
    }

    updateValidity(step: BayWithItems) {
        this.isValid$.next(step.items.every((item) => item.action != null || item.state !== this.sourceState));
    }

    toggleState(item: ItemWithState, action: ReservationActionExt) {
        if (item.action === action) {
            item.action = null;
        } else {
            item.action = action;
        }
        this.step$.pipe(take(1), takeUntil(this.destroyed$)).subscribe((step) => this.updateValidity(step));
    }

    async exit() {
        this.codeService.logout();
    }

    async reOpen() {
        const step = await this.step$.pipe(take(1)).toPromise();
        this.updateValidity(step);
        if (step.externalId != null) {
            console.log('Opening Bay', step);
            this.isOpen$.next(true);
            await this.api.openBay(step.externalId).toPromise();
            this.waitForClose$.next(step.externalId);
        } else {
            console.log('No Bay', step);
            this.isOpen$.next(false);
        }
    }

    async startTake() {
        this.actionText = 'Take';
        this.actionPastText = 'Taken';
        this.sourceState = 'reserved';
        this.targetState = 'taken';
        this.targetAction = ReservationActionExt.Take;
        this.decideReturnTake$.next(false);
    }

    async startReturn() {
        this.actionText = 'Return';
        this.actionPastText = 'Returned';
        this.sourceState = 'taken';
        this.targetState = 'returned';
        this.targetAction = ReservationActionExt.Return;
        this.decideReturnTake$.next(false);
    }

    async nextStep() {
        const step = await this.step$.pipe(take(1)).toPromise();
        if (step != null) {
            console.log('Saving', step);
            const items = step.items
                .filter((item) => item.action != null && item.action !== ReservationActionExt.NoAction)
                .map((item) => ({
                    itemId: item.id,
                    action: item.action as unknown as ReservationAction,
                    comment: item.comment,
                }));
            console.log('Saving', items);
            await this.api.reservationAction({ items }, this.codeService.code).toPromise();
        }
        this.stepIndex$.next(this.stepIndex$.value + 1);
    }
}
