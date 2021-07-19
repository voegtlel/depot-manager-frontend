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

    returned: boolean;
}

export interface ReservationReturnItemState {
    itemId: string;
    problem: boolean;
    comment?: string;
}

export interface ReservationReturnInWrite {
    items: ReservationReturnItemState[];
}
