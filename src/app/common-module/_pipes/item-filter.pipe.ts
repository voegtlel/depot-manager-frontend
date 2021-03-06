import { Pipe, PipeTransform } from '@angular/core';
import { Item } from '../_models';

export interface Filterable extends Item {
    filterLookup: string;
}

@Pipe({ name: 'itemFilter' })
export class ItemFilterPipe implements PipeTransform {
    transform<ItemType extends Filterable>(items: ItemType[], filter: string): ItemType[] {
        if (!filter) {
            return items;
        }
        const filters = filter
            .toLowerCase()
            .split(' ')
            .map(f => f.trim())
            .filter(f => !!f);
        return items.filter(item => filters.every(f => item.filterLookup.includes(f)));
    }
}
