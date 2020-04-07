import { Pipe, PipeTransform } from '@angular/core';
import { ItemsService } from '../_services';
import { map, filter } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Pipe({
    name: 'bayName',
})
export class BayNamePipe implements PipeTransform {
    constructor(private itemsService: ItemsService) {}
    transform(value: string): Observable<string> {
        if (!value) {
            return null;
        }
        return this.itemsService.bays$.pipe(
            map(bays => bays.find(bay => bay.id === value)),
            filter(bay => !!bay),
            map(bay => bay.name)
        );
    }
}
