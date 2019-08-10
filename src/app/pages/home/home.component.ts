import {Component} from '@angular/core';
import {ApiService} from '../../_services';


@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
})
export class HomeComponent {
    constructor(public api: ApiService) {
    }
}
