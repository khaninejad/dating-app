import { Auth } from '../../libs/auth';
import { swipeService, userService } from '../../services';
import { main } from './swipeHandler';
import { APIGatewayProxyEvent } from 'aws-lambda';

jest.mock('../../services/index', () => ({
    userService: {
        verifyUserToken: jest.fn(),
        getUserSwipedProfilesInfos: jest.fn(),
        setAttractiveness: jest.fn(),
        getProfileById: jest.fn(),
        getMatchCounts: jest.fn(),
        calculateAttractiveness: jest.fn(),
    },
    swipeService: {
        createSwipe: jest.fn(),
    },
}));

describe('swipeHandler', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should return a 200 response with isMatch set to true if the user and profile both swiped YES on each other', async () => {
        const event = {
            headers: { token: 'token' },
            body: JSON.stringify({ user_id: 'user_id', profile_id: 'profile_id', preference: 'YES' }),
        } as unknown as Omit<APIGatewayProxyEvent, "body"> & { body: any; rawBody: string; };

        const verifyTokenMock = jest.spyOn(Auth, 'verifyToken').mockResolvedValueOnce(undefined);

        const getUserSwipedProfilesInfosMock = jest.spyOn(userService, 'getUserSwipedProfilesInfos').mockResolvedValueOnce([
            { user_id: 'profile_id', profile_id: 'user_id', preference: 'YES' },
        ]);

        const createSwipeMock = jest.spyOn(swipeService, 'createSwipe').mockResolvedValueOnce(undefined);

        const response = await main(event);

        expect(response).toEqual({
            statusCode: 200,
            body: JSON.stringify({ isMatch: true }),
        });

        expect(verifyTokenMock).toHaveBeenCalledWith('token');
        expect(getUserSwipedProfilesInfosMock).toHaveBeenCalledWith('profile_id');
        expect(createSwipeMock).toHaveBeenCalledWith({ user_id: 'user_id', profile_id: 'profile_id', preference: 'YES' });
    });

    it('should return a 400 response if the request body is invalid', async () => {
        const event = {
          headers: { token: 'token' },
          body: JSON.stringify({ invalidKey: 'invalidValue' }),
        } as unknown as Omit<APIGatewayProxyEvent, 'body'> & { body: any; rawBody: string };
    
        const verifyTokenMock = jest.spyOn(Auth, 'verifyToken').mockResolvedValueOnce(undefined);
    
        const response = await main(event);

        const parsed_response = JSON.parse(response.body);
        expect(response.statusCode).toBe(400);
        expect(parsed_response.message.issues[0].code).toBe('invalid_type');
    
        expect(verifyTokenMock).toHaveBeenCalledWith('token');
      });

      it('should return a 500 response if an error occurs while processing the request', async () => {
        const event = {
          headers: { token: 'token' },
          body: JSON.stringify({ user_id: 'user_id', profile_id: 'profile_id', preference: 'YES' }),
        } as unknown as Omit<APIGatewayProxyEvent, 'body'> & { body: any; rawBody: string };
    
        const error = new Error('Something went wrong');
        const verifyTokenMock = jest.spyOn(Auth, 'verifyToken').mockRejectedValueOnce(error);
    
        const response = await main(event);
    
        expect(response).toEqual({
          statusCode: 500,
          body: JSON.stringify({ message: `An error occurred: ${error.message}` }),
        });
    
        expect(verifyTokenMock).toHaveBeenCalledWith('token');
      });

});