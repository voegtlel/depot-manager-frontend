import { Component, EventEmitter, Input, Output, TemplateRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import { DateHelper } from '../../_helpers';
import { NbDialogService } from '@nebular/theme';
import { ApiService, ItemTagsService } from '../../_services';
import { Observable } from 'rxjs';

export interface Choice<T> {
    value: T;
    title: string;
    disabled?: boolean;
}

@Component({
    selector: 'depot-form-element',
    templateUrl: './form-element.component.html',
    styleUrls: ['./form-element.component.scss'],
})
export class FormElementComponent {
    @Input() formControlRef: FormControl;
    @Input() formControlRefEnd: FormControl;

    @Input() type: 'text' | 'textarea' | 'date' | 'daterange' | 'radio' | 'select' | 'tags' = 'text';
    @Input() title = '';

    @Input() submitted = false;

    @Input() choices: Choice<any>[] = [];

    @Output() change: EventEmitter<void> = new EventEmitter();
    dateValue = new DateHelper({
        getValue: () => this.formControlRef.value,
        setValue: (val: string) => this.formControlRef.setValue(val),
    });
    dateValueEnd = new DateHelper({
        getValue: () => this.formControlRefEnd.value,
        setValue: (val: string) => this.formControlRefEnd.setValue(val),
    });

    readonly itemTags$: Observable<string[]>;

    constructor(private dialogService: NbDialogService, private api: ApiService, private itemTags: ItemTagsService) {
        this.itemTags$ = itemTags.itemTags$;
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

    openDialog($event: MouseEvent, dialog: TemplateRef<any>, context?: any) {
        $event.preventDefault();
        $event.stopPropagation();
        this.dialogService.open(dialog, {
            hasBackdrop: true,
            closeOnBackdropClick: true,
            hasScroll: false,
            autoFocus: true,
            context,
        });
    }

    get itemPicturePreviewUrl(): string {
        return this.api.getPicturePreviewUrl(this.formControlRef.value);
    }
}
