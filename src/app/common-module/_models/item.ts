export enum ItemCondition {
    Good = 'good',
    Ok = 'ok',
    Bad = 'bad',
    Gone = 'gone',
}

export interface Item {
    id: string;
    externalId: string;
    name: string;
    description: string;

    condition: ItemCondition;
    conditionComment: string;

    purchaseDate: string;
    lastService: string;

    pictureId: string;

    groupId: string;

    bayId: string;

    tags: string[];
}

export interface ItemWithComment extends Item {
    changeComment: string;
}

export interface StrChange {
    previous?: string;
    next?: string;
}

export interface IdChange {
    previous?: string;
    next?: string;
}

export interface DateChange {
    previous?: string;
    next?: string;
}

export interface TagsChange {
    previous: string[];
    next: string[];
}

export interface ItemConditionChange {
    previous: ItemCondition;
    next: ItemCondition;
}

export interface ItemStateChanges {
    externalId?: StrChange;
    name?: StrChange;
    description?: StrChange;

    condition?: ItemConditionChange;
    conditionComment?: StrChange;

    purchaseDate?: DateChange;
    lastService?: DateChange;

    pictureId?: StrChange;

    groupId?: StrChange;

    tags?: TagsChange;

    bayId?: IdChange;

    changeComment?: StrChange;
}

export interface ItemState extends Item {
    id: string;
    itemId: string;
    timestamp: string;
    changes: Record<Partial<keyof Item>, { previous: any; next: any }>;
    userId: string;
    comment: string;
}
