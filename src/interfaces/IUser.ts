export interface IUser{
    id: string;
    email: string;
    name: string;
    password: string;
    gender: 'female' | 'male' | 'other' | string;
    birth_date: string;
    location: Location;
    recent_activity: string;
    attractiveness: number;
    authToken: string;

}
export interface Location {
    longitude: number;
    latitude: number;
  }
