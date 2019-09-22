import {Pipe, PipeTransform} from "@angular/core";
import {Filterable} from "./item-filter.pipe";


@Pipe({name: 'itemGroupFilter'})
export class ItemGroupFilterPipe implements PipeTransform {
    transform<ItemType extends Filterable>(items: ItemType[][], filter: string): ItemType[][] {
        if (!filter) {
            return items;
        }
        const filters = filter.toLowerCase().split(' ').map(filter => filter.trim()).filter(filter => !!filter);
        return items.filter(item => filters.every(
            filter => item[0].filterLookup.includes(filter)
        ));
    }
}
