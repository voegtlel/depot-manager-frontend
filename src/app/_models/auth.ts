export interface AuthUserModel {
    uid: string;
    name: string;
    mail: string;

    mobile: string;
    groups: string[];
    teams: string[];
}

export interface UserModel {
    uid: string;
    name: string;

    teams: string[];
}

export interface TeamModel {
    name: string;

    users?: string[];
}
