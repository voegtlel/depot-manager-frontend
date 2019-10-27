import { FormGroup } from '@angular/forms';

export function getDirtyValues(form: FormGroup): Record<string, any> {
    const dirtyValues: Record<string, any> = {};

    Object.entries(form.controls).forEach(([key, control]) => {
        if (control.dirty) {
            if (control instanceof FormGroup) {
                dirtyValues[key] = getDirtyValues(control);
            } else {
                dirtyValues[key] = control.value;
            }
        }
    });

    return dirtyValues;
}
