export enum ReservationType {
    Private = 'private',
    Team = 'team',
}

export interface Reservation {
    id: string;
    type: ReservationType;
    name: string;

    start: Date | string;
    end: Date | string;
    userId?: string;

    teamId: string;

    contact: string;

    items?: string[];
}
