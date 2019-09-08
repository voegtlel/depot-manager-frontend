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

    tags: string[];
}
