import { main as handler } from './getProfileHandler';
import { userService } from '../../services';
import { Auth } from '../../libs/auth';
import { APIGatewayEventRequestContext } from 'aws-lambda';
import { IFilter } from 'src/interfaces/IFilter';


jest.mock('../../services/index', () => ({
    userService: {
        getProfileById: jest.fn(),
        getProfiles: jest.fn(),
    },
}));

describe('getProfileHandler', () => {
  const mockUserId = 'mock-user-id';
  const mockToken = 'mock-token';
  const mockEvent: any = {
    headers: { token: mockToken },
    queryStringParameters: {
      user_id: mockUserId,
      prefer: 'male',
      age_from: '1990-10-10',
      age_to: '1999-10-10',
      sort_by: 'distance'
    },
    requestContext: {
      authorizer: {
        claims: { sub: 'mock-sub' }
      } as APIGatewayEventRequestContext['authorizer']
    }
  };

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should return 500 if invalid token', async () => {
    Auth.verifyToken = jest.fn().mockImplementation(() => {
      throw new Error('Invalid token');
    });

    const result = await handler(mockEvent);

    expect(Auth.verifyToken).toHaveBeenCalledWith(mockToken);
    expect(userService.getProfileById).not.toHaveBeenCalled();
    expect(result.body).toMatch(/Invalid token/);
    expect(result.statusCode).toBe(500);
    
  });

  it('should return 400 if invalid query parameters', async () => {
    Auth.verifyToken = jest.fn().mockReturnValueOnce(undefined);

    const result = await handler({ ...mockEvent, queryStringParameters: { invalid: 'query' } });
    const parsed_result = JSON.parse(result.body);

    expect(result.statusCode).toBe(400);
    expect(parsed_result.message.issues[0].code).toBe('invalid_type');
  });

  it('should return 500 if service method throws', async () => {
    Auth.verifyToken = jest.fn().mockReturnValueOnce(undefined);
    const { userService } = require('../../services/index');
    userService.getProfileById.mockRejectedValueOnce(new Error('Service error'));

    const result = await handler(mockEvent);

    expect(result.statusCode).toBe(500);
    expect(result.body).toMatch(/An error occurred/);
    expect(userService.getProfileById).toHaveBeenCalledWith(mockUserId);
  });

  it('should throws user not found', async () => {
    Auth.verifyToken = jest.fn().mockReturnValueOnce(undefined);
    const { userService } = require('../../services/index');
    userService.getProfileById.mockResolvedValueOnce();

    const result = await handler(mockEvent);

    expect(result.statusCode).toBe(500);
    expect(result.body).toMatch(/user not found/);  
  });

  it('should return list of profiles if service method returns', async () => {
    const mockProfile = {
      id: 'mock-id',
      name: 'mock-name',
      gender: 'male',
      age: 22,
    };
    Auth.verifyToken = jest.fn().mockReturnValueOnce(undefined);
    const { userService } = require('../../services/index');
    userService.getProfileById.mockResolvedValueOnce({ location: { latitude: 1, longitude: 1 } });
    userService.getProfiles.mockResolvedValueOnce([mockProfile]);

    const result = await handler(mockEvent);

    expect(result.statusCode).toBe(200);
    expect(result.body).toMatch(/mock-id/);
    expect(userService.getProfileById).toHaveBeenCalledWith(mockUserId);
    expect(userService.getProfiles).toHaveBeenCalledWith(
      mockUserId,
      expect.objectContaining<IFilter>({
        prefer: 'male',
        age_from: '1990-10-10',
        age_to: '1999-10-10',
        sort_by: 'distance',
      }),
      expect.objectContaining({
        latitude: 1,
        longitude: 1
      })
    );
  });

});