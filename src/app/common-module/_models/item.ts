export interface Item {
    id: string;
    externalId: string;
    name: string;
    description: string;

    condition: number;
    conditionComment: string;

    purchaseDate: string;
    lastService: string;

    pictureId: string;

    groupId: string;

    bayId: string;

    tags: string[];
}

export interface ItemWithComment extends Item {
    comment: string;
}

export interface ItemState extends Item {
    id: string;
    fields: Record<string, any>;
    timestamp: string;
    userId: string;
    comment: string;
}
