import {Pipe, PipeTransform} from "@angular/core";


export interface Filterable {
    filterLookup: string;
}


@Pipe({name: 'itemFilter'})
export class ItemFilterPipe implements PipeTransform {
    transform<ItemType extends Filterable>(items: ItemType[], filter: string): ItemType[] {
        if (!filter) {
            return items;
        }
        const filters = filter.toLowerCase().split(' ').map(filter => filter.trim()).filter(filter => !!filter);
        return items.filter(item => filters.every(
            filter => item.filterLookup.includes(filter)
        ));
    }
}