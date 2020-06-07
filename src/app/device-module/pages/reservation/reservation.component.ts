import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Reservation } from 'src/app/common-module/_models';

@Component({
    selector: 'depot-reservation',
    templateUrl: './reservation.component.html',
    styleUrls: ['./reservation.component.scss'],
})
export class ReservationComponent implements OnInit {
    reservation$: Observable<Reservation>;

    constructor(private activatedRoute: ActivatedRoute) {
        this.reservation$ = activatedRoute.data.pipe(map(data => data.reservation));

        this.reservation$.subscribe(res => console.log('Res', res));
    }

    ngOnInit() {}
}
