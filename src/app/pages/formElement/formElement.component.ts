import {Component, Input, OnInit} from '@angular/core';
import {FormControl} from '@angular/forms';


export interface Choice<T> {
    value: T;
    title: string;
    disabled?: boolean;
}


@Component({
    selector: 'app-form-element',
    templateUrl: './formElement.component.html',
    styleUrls: ['./formElement.component.scss'],
})
export class FormElementComponent {
    @Input() formControlRef: FormControl;
    @Input() formControlRefEnd: FormControl;

    @Input() type = 'text';
    @Input() title: string;
    @Input() readonly = false;

    @Input() submitted: boolean;

    @Input() choices: Choice<any>[] = [];

    get error(): string {
        if (this.formControlRef.errors) {
            if (this.formControlRef.errors.required && (this.submitted || this.formControlRef.dirty)) {
                return this.title + ' is required';
            } else if (this.formControlRef.errors.matchPassword && (this.submitted || this.formControlRef.dirty)) {
                return 'Passwords do not match';
            } else if (this.formControlRef.errors.pattern && (this.submitted || this.formControlRef.dirty)) {
                return this.title + ' invalid. Expecting ' + this.formControlRef.errors.pattern.requiredPattern + '.';
            } else if (this.formControlRef.errors.external) {
                return this.formControlRef.errors.external;
            }
        }
        return null;
    }
}
