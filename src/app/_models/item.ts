export interface Item {
    id: string;
    externalId: string;
    description: string;

    condition: number;
    conditionComment: string;
    lastService: string;

    picture: string;

    tags: string[];
}
