import { main } from "./createUserHandler";
import { v4 as uuidv4 } from 'uuid';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { Md5 } from 'ts-md5';


jest.mock('../../services/index', () => ({
    userService: {
        createUser: jest.fn(),
    },
}));

jest.mock("../../services");

const expectedResult = {
  id: uuidv4(),
  random: false,
  email: 'jane@example.com',
  password: Md5.hashStr('password123'),
  name: 'Jane Smith',
  gender: 'female',
  birth_date: '1995-01-01T00:00:00.000Z',
  location: { longitude: -122.333, latitude: 47.606 },
};

describe('createUserHandler', () => {

  beforeEach(() => {

  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should create a user with valid parameters', async () => {
    
    const event = {
        body: JSON.stringify(expectedResult)
    } as Omit<APIGatewayProxyEvent, "body"> & { body: any; rawBody: string; };

    const { userService } = require('../../services/index');
    userService.createUser.mockResolvedValue(expectedResult);

    const result = await main(event);
    const parsed_result = JSON.parse(result.body);

    expect(result.statusCode).toEqual(200);
    expect(parsed_result.email).toEqual(expectedResult.email);
  });

  it('should create a user with random parameters', async () => {

    const event = {
        body: JSON.stringify({...expectedResult, random: true})
    } as Omit<APIGatewayProxyEvent, "body"> & { body: any; rawBody: string; };

    const result = await main(event);
    const parsed_result = JSON.parse(result.body);

    expect(result.statusCode).toEqual(200);
    expect(parsed_result.email).toBeDefined();
    expect(parsed_result.id).toBeDefined();
  });

  it('should return a 400 error for invalid parameters', async () => {
    const expectedResult = {
      id: uuidv4(),
      random: false,
      email: 'test@test.com',
      password: '',
      name: 'Jane Smith',
      gender: 'female',
      birth_date: '1995-01-01T00:00:00.000Z',
      location: { longitude: -122.333, latitude: 47.606 },
    };
    const event = {
        body: JSON.stringify(expectedResult)
    } as Omit<APIGatewayProxyEvent, "body"> & { body: any; rawBody: string; };

    const { userService } = require('../../services/index');
    userService.createUser.mockResolvedValue(expectedResult);

    const expectedError = {
        message: {
          issues: [
            {
              code: 'too_small',
              exact: false,
              type: 'string',
              inclusive: true,
              minimum: 6,
              path: ['password'],
              message: 'String must contain at least 6 character(s)',
            },
          ],
          name: 'ZodError',
        },
    };

    const result = await main(event);
    const parsed_result = JSON.parse(result.body);
    

    expect(result.statusCode).toEqual(400);
    expect(parsed_result).toEqual(expectedError);
  });

});