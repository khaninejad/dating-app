import { IFilter } from "./IFilter";
import { IUser } from "./IUser";
import { DynamoDB } from 'aws-sdk';

export interface IUserService {
    getProfileById(profile_id: string): Promise<IUser>;
    setAttractiveness(user_id: string, user_attractiveness: number): Promise<IUser>;
    getProfiles(user_id: string, filter?: IFilter, location?: { latitude: number; longitude: number }): Promise<DynamoDB.DocumentClient.AttributeMap[]>
    getUserSwipedProfilesInfos(user_id: string): Promise<DynamoDB.DocumentClient.ItemList>
    loginUser(email: string, password: string): Promise<IUser>
    setToken(user_id: string): Promise<IUser>
    verifyUserToken(authToken: string): Promise<DynamoDB.DocumentClient.AttributeMap>
  }