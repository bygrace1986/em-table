export enum Role {
    admin,
    editor,
    reader
}

export enum Status {
    locked,
    disabled
}

export class Color {
    public static readonly red = 'r';
    public static readonly yellow = 'y';
    public static readonly blue = 'b';
}

export interface User {
    id: number;
    name: string;
    role: Role;
    status: Status;
    color: string;
    creationDate: Date;
    lastLoginDate: Date;
}