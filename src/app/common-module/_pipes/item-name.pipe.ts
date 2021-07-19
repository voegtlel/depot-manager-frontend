import { Pipe, PipeTransform } from '@angular/core';
import { ItemsService } from '../_services';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Item } from '../_models';

@Pipe({
    name: 'itemName',
})
export class ItemNamePipe implements PipeTransform {
    constructor(private itemsService: ItemsService) {}

    transform(value: string): Observable<string> {
        if (!value) {
            return null;
        }
        return this.itemsService.itemsById$.pipe(
            map((itemsById) => itemsById[value]),
            map((item) => (item ? `${item.name} (${item.externalId})` : null))
        );
    }
}
