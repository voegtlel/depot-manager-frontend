import {Component} from '@angular/core';
import {ApiService} from '../../_services';


@Component({
    selector: 'depot-home',
    templateUrl: './home.component.html',
})
export class HomeComponent {
    constructor(public api: ApiService) {
    }
}
