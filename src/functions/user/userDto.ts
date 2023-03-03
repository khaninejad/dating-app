

export interface Location {
    longitude: number;
    latitude: number;
}

export interface IUserDto {
    birth_date: Date;
    location: Location;
    password: string;
    recent_activity: Date;
    attractivenes: string;
    email: string;
    id: string;
    name: string;
    gender: string;
    authToken: string;
}

