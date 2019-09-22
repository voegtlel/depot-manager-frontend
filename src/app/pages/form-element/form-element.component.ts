import {Component, Input, OnInit} from '@angular/core';
import {FormControl} from '@angular/forms';
import {fromIsoDate, toIsoDate} from "../../_helpers";


export interface Choice<T> {
    value: T;
    title: string;
    disabled?: boolean;
}


@Component({
    selector: 'app-form-element',
    templateUrl: './form-element.component.html',
    styleUrls: ['./form-element.component.scss'],
})
export class FormElementComponent {
    @Input() formControlRef: FormControl;
    @Input() formControlRefEnd: FormControl;

    @Input() type = 'text';
    @Input() title = "";
    @Input() readonly = false;

    @Input() submitted = false;

    @Input() choices: Choice<any>[] = [];

    private _storedDateValue: Date = null;

    get dateValue(): Date {
        const parsedValue = fromIsoDate(this.formControlRef.value);
        if (
            parsedValue && this._storedDateValue &&
            this._storedDateValue.getFullYear() === parsedValue.getFullYear() &&
            this._storedDateValue.getMonth() === parsedValue.getMonth() &&
            this._storedDateValue.getDate() === parsedValue.getDate()
        ) {
            return this._storedDateValue;
        }
        return parsedValue;
    }

    set dateValue(val: Date) {
        this._storedDateValue = val;
        this.formControlRef.setValue(toIsoDate(val));
    }

    private _storedDateValueEnd: Date = null;

    get dateValueEnd(): Date {
        const parsedValue = fromIsoDate(this.formControlRefEnd.value);
        if (
            parsedValue && this._storedDateValueEnd &&
            this._storedDateValueEnd.getFullYear() === parsedValue.getFullYear() &&
            this._storedDateValueEnd.getMonth() === parsedValue.getMonth() &&
            this._storedDateValueEnd.getDate() === parsedValue.getDate()
        ) {
            return this._storedDateValueEnd;
        }
        return parsedValue;
    }

    set dateValueEnd(val: Date) {
        this._storedDateValueEnd = val;
        this.formControlRefEnd.setValue(toIsoDate(val));
    }

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
