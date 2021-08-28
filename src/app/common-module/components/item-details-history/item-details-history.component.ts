import { Component, Input } from '@angular/core';
import { ItemState } from '../../_models';
import { ApiService } from '../../_services';

interface FieldItem {
    key: string;
    value: any;
}

interface ItemStateWithArray extends ItemState {
    changesArray: FieldItem[];
}

@Component({
    selector: 'depot-item-details-history',
    templateUrl: './item-details-history.component.html',
    styleUrls: ['./item-details-history.component.scss'],
})
export class ItemDetailsHistoryComponent {
    @Input() states: ItemStateWithArray[];

    constructor(private api: ApiService) {}

    getPicturePreviewUrl(pictureId: string): string {
        return this.api.getPicturePreviewUrl(pictureId);
    }

    stateFields(state: ItemState): FieldItem[] {
        return Object.entries(state.changes).map(([key, value]) => ({ key, value }));
    }
}
