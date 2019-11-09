export interface AuthUserModel {
    id: string;
    name: string;
    mail: string;

    mobile: string;
    groups: string[];
    teams: string[];
}

export interface UserModel {
    id: string;
    name: string;

    teams: string[];
}

export interface TeamModel {
    name: string;

    users?: string[];
}
