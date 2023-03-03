import { APIGatewayProxyEvent } from 'aws-lambda';
import { IUser } from 'src/interfaces/IUser';
import { userService } from '../../services/index';

interface IAuthenticatedEvent extends APIGatewayProxyEvent {
  user: IUser; 
}

export class AuthHandler {
  static async verifyToken(token: string): Promise<IAuthenticatedEvent> {
    if (!token) throw new Error('Authorization header is missing');

    const user = await userService.verifyUserToken(token);

    if (!user) throw new Error('User not found');

    const authenticatedEvent = user as IAuthenticatedEvent;

    return authenticatedEvent;
  }
}
