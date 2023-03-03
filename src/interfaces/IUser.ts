export interface IUser{
    id: string;
    email: string;
    name: string;
    password: string;
    gender: 'female' | 'male' | 'other' | string;
    birth_date: string;
    prefer: 'female' | 'male' | 'other' | string;

}