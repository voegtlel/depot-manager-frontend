import { Component, OnInit, Input } from '@angular/core';
import { Item } from 'src/app/_models';

@Component({
    selector: 'depot-item-details',
    templateUrl: './item-details.component.html',
    styleUrls: ['./item-details.component.scss'],
})
export class ItemDetailsComponent implements OnInit {
    @Input() item: Item;

    constructor() {}

    ngOnInit() {}
}
