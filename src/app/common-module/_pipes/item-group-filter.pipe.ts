import { Pipe, PipeTransform } from '@angular/core';
import { Filterable } from './item-filter.pipe';

@Pipe({ name: 'itemGroupFilter' })
export class ItemGroupFilterPipe implements PipeTransform {
    transform<ItemType extends Filterable>(items: ItemType[][], filter: string): ItemType[][] {
        if (!filter) {
            return items;
        }
        const filters = filter
            .toLowerCase()
            .split(' ')
            .map(f => f.trim())
            .filter(f => !!f);
        return items.filter(item => filters.every(f => item[0].filterLookup.includes(f)));
    }
}
