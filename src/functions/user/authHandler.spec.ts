import { AuthHandler } from './AuthHandler';
import { userService } from '../../services/index';

jest.mock('../../services/index');

describe('AuthHandler', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('verifyToken', () => {
        it('should throw an error if authorization header is missing', async () => {
            await expect(AuthHandler.verifyToken('')).rejects.toThrow('Authorization header is missing');
        });

        it('should call userService.verifyUserToken with the provided token', async () => {
            const mockToken = 'mockToken';
            const mockVerifyUserToken = jest.spyOn(userService, 'verifyUserToken');
            await AuthHandler.verifyToken(mockToken);
            expect(mockVerifyUserToken).toHaveBeenCalledWith(mockToken);
        });
    });
});