import { Auth } from './auth';
import { userService } from '../services/index';

jest.mock('../services/index');

describe('Auth', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('verifyToken', () => {
        it('should throw an error if authorization header is missing', async () => {
            await expect(Auth.verifyToken('')).rejects.toThrow('Authorization header is missing');
        });

        it('should call userService.verifyUserToken with the provided token', async () => {
            const mockToken = 'mockToken';
            const mockVerifyUserToken = jest.spyOn(userService, 'verifyUserToken');
            await Auth.verifyToken(mockToken);
            expect(mockVerifyUserToken).toHaveBeenCalledWith(mockToken);
        });
    });
});