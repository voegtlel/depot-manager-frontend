export interface AuthUserModel {
    sub: string;
    name: string;
    family_name: string;
    given_name: string;
    picture: string;
    email: string;
    phone_number: string;
    roles: string[];
    groups: string[];
}

export interface UserModel {
    sub: string;
    name: string;
    family_name: string;
    given_name: string;
    picture: string;
    email: string;
    phone_number: string;
}
