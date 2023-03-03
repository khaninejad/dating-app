export interface IUser{
    id: string;
    email: string;
    name: string;
    password: string;
    gender: 'female' | 'male' | 'other' | string;
    birth_date: string;
    location: { longitude: number; latitude: number }

}