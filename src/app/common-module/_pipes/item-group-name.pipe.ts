import { Pipe, PipeTransform } from '@angular/core';
import { ItemsService } from '../_services';
import { map, filter } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Pipe({
    name: 'itemGroupName',
})
export class ItemGroupNamePipe implements PipeTransform {
    constructor(private itemsService: ItemsService) {}
    transform(value: string): Observable<string> {
        if (!value) {
            return null;
        }
        return this.itemsService.itemsById$.pipe(
            map((itemsById) => itemsById[value]),
            filter((item) => !!item),
            map((item) => item.name)
        );
    }
}
