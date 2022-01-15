import { Component, AfterViewInit } from '@angular/core';
import { AuthService } from 'src/app/common-module/_services';
import { DeviceCodeService } from '../../_services/device-code.service';

@Component({
    templateUrl: './logout.component.html',
    styleUrls: ['./logout.component.scss'],
})
export class LogoutComponent implements AfterViewInit {
    constructor(private deviceCode: DeviceCodeService) {}

    ngAfterViewInit() {
        this.deviceCode.logout();
    }
}
