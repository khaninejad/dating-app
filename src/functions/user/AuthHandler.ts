import { userService } from '../../services/index';

export class AuthHandler {
  static async verifyToken(token: string): Promise<void> {
    if (!token) throw new Error('Authorization header is missing');

    await userService.verifyUserToken(token);

  }
}
