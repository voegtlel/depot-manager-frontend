import {Pipe, PipeTransform} from "@angular/core";
import {Item} from "../_models";


@Pipe({name: 'itemFilter'})
export class ItemFilterPipe implements PipeTransform {
    transform<ItemType extends Item>(items: ItemType[][], filter: string): ItemType[][] {
        if (!filter) {
            return items;
        }
        const filters = filter.split(' ');
        return items.filter(item => filters.some(
            filter => item[0].name.includes(filter) ||
                item[0].externalId.includes(filter) ||
                item[0].tags.some(tag => tag.includes(filter)) ||
                item[0].description.includes(filter) ||
                item[0].id === filter
        ));
    }
}
