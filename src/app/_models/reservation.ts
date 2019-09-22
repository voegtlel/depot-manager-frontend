export enum ReservationType {
    Private = 1,
    Team = 2
}

export interface Reservation {
    id: string;
    type: ReservationType;
    name: string;

    start: Date|string;
    end: Date|string;
    userId?: string;

    teamId: string;

    contact: string;

    items?: string[];
}
