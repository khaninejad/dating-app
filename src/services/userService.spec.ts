
import { DynamoDB } from 'aws-sdk';

import SwipeService from './swipeService';
import UserService, { IUserService } from './userService';
import configuration from '../../src/config/config';

jest.mock('uuid', () => ({
    v4: jest.fn().mockReturnValue('1234')
}));

describe('UserService', () => {
    let swipeService: SwipeService;
    let mockDocumentClient: DynamoDB.DocumentClient;
    let userService: IUserService;

    beforeEach(() => {
        mockDocumentClient = {
            put: jest.fn().mockReturnValue({
                promise: jest.fn(),
            }),
            scan: jest.fn().mockReturnValue({
                promise: jest.fn().mockResolvedValue({
                    Items: [
                        { id: '1', gender: 'male', birth_date: 2000, location: { latitude: 37.7749, longitude: -122.4194 }, attractiveness: 2 },
                        { id: '2', gender: 'female', birth_date: 1995, location: { latitude: 37.7749, longitude: -122.4194 }, attractiveness: 5 },
                        { id: '3', gender: 'male', birth_date: 1990, location: { latitude: 37.7749, longitude: -122.4194 }, attractiveness: 4 },
                        { id: '4', gender: 'female', birth_date: 1985, location: { latitude: 37.7749, longitude: -122.4194 }, attractiveness: 3 },
                    ],
                }),
            }),
            get: jest.fn().mockReturnValue({
                promise: jest.fn().mockResolvedValue({
                    Item: { id: '1', name: 'John', email: 'john@test.com', password: 'password', gender: 'male' },
                }),
            }),
            update: jest.fn(),
        } as unknown as DynamoDB.DocumentClient;
        swipeService = new SwipeService(mockDocumentClient, {} as any);
        userService = new UserService(mockDocumentClient, swipeService);

    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    describe('getProfileById', () => {
        it('should return a user profile', async () => {
            jest.spyOn(mockDocumentClient, 'get');

            const profile = await userService.getProfileById('123');

            expect(mockDocumentClient.get).toHaveBeenCalled();
            expect(profile.id).toBe('1');
            expect(profile.name).toBe('John');
            expect(profile.email).toBe('john@test.com');
        });
    });

    describe('getProfiles', () => {
        it('should return filtered and sorted profiles', async () => {
            const scanSpy = jest.spyOn(mockDocumentClient, 'scan');

            const profiles = await userService.getProfiles('123', { prefer: 'female', age_from: '1990-10-10', age_to: '1998-10-10' }, { latitude: 37.7749, longitude: -122.4194 });

            expect(scanSpy).toHaveBeenCalled();
            expect(profiles.length).toBe(4);
            expect(profiles[0].id).toBe('1');
            expect(profiles[1].id).toBe('2');
        });
    });

    describe('loginUser', () => {
        it('should login a user and return a user DTO', async () => {

            const scanSpy = jest.spyOn(mockDocumentClient, 'scan').mockImplementation(() => ({
                promise: jest.fn().mockResolvedValue({
                    Count: 1,
                    Items: [{
                        id: '1',
                        email: 'test@test.com',
                        password: 'password',
                    }],
                }),
            }) as unknown as AWS.Request<DynamoDB.DocumentClient.ScanOutput, AWS.AWSError>);

            const user = await userService.loginUser('john@test.com', 'password');

            expect(scanSpy).toHaveBeenCalled();
            expect(user.id).toBe('1');
        });

        it('throw error on invalid user and password', async () => {

            jest.spyOn(mockDocumentClient, 'scan').mockImplementation(() => ({
                promise: jest.fn().mockResolvedValue({
                    Count: 0,
                    Items: [],
                }),
            }) as unknown as AWS.Request<DynamoDB.DocumentClient.ScanOutput, AWS.AWSError>);

            await expect(userService.loginUser('john@test.com', 'password')).rejects.toThrow('invalid email or password');
        });

    });


    describe('setToken', () => {
        it('should update user token in database', async () => {

            const updateSpy = jest.spyOn(mockDocumentClient, 'update').mockImplementation(() => ({
                promise: jest.fn().mockResolvedValue({
                    Attributes: {
                        id: 'user123',
                        authToken: 'new_token',
                        recent_activity: '2023-03-03T10:00:00.000Z',
                    }
                }),
            }) as unknown as AWS.Request<DynamoDB.DocumentClient.ScanOutput, AWS.AWSError>);


            const result = await userService.setToken('user123');

            expect(result).toEqual({
                id: 'user123',
                authToken: 'new_token',
                recent_activity: '2023-03-03T10:00:00.000Z',
            });
            expect(updateSpy).toHaveBeenCalled();
        });
    });

    describe('verifyUserToken', () => {
        it('should return user id if token is valid', async () => {
            const validToken = 'valid_token';
            const expectedUserId = 'user123';

            const scanSpy = jest.spyOn(mockDocumentClient, 'scan').mockImplementation(() => ({
                promise: jest.fn().mockResolvedValue({
                    Count: 1,
                    Items: [{ id: expectedUserId }]
                }),
            }) as unknown as AWS.Request<DynamoDB.DocumentClient.ScanOutput, AWS.AWSError>);

            const result = await userService.verifyUserToken(validToken);

            expect(result).toEqual({ id: expectedUserId });
            expect(scanSpy).toHaveBeenCalledWith({
                TableName: configuration().user_table,
                FilterExpression: 'authToken = :authToken AND attribute_not_exists(swipe_timestamp)',
                ExpressionAttributeValues: {
                    ':authToken': validToken,
                },
                ProjectionExpression: 'id',
            });
        });

        it('should throw an error if token is not valid', async () => {
            const invalidToken = 'invalid_token';

            const scanSpy = jest.spyOn(mockDocumentClient, 'scan').mockImplementation(() => ({
                promise: jest.fn().mockResolvedValue({ Count: 0 }),
            }) as unknown as AWS.Request<DynamoDB.DocumentClient.ScanOutput, AWS.AWSError>);

            await expect(userService.verifyUserToken(invalidToken)).rejects.toThrow('Token is not valid');
            expect(scanSpy).toHaveBeenCalledWith({
                TableName: configuration().user_table,
                FilterExpression: 'authToken = :authToken AND attribute_not_exists(swipe_timestamp)',
                ExpressionAttributeValues: {
                    ':authToken': invalidToken,
                },
                ProjectionExpression: 'id',
            });
        });
    });

    describe('setAttractiveness', () => {
        const mockUser = {
            id: 'user123',
            name: 'John Doe',
            birth_date: '1990-10-10',
            gender: 'male',
            location: {
                latitude: 37.7749,
                longitude: -122.4194,
            },
            attractiveness: 3,
            authToken: 'token123',
            recent_activity: '2023-03-03T09:30:00.000Z',
        };

        it('should update user attractiveness in database', async () => {
            const updateSpy = jest.spyOn(mockDocumentClient, 'update').mockImplementation(() => ({
                promise: jest.fn().mockResolvedValue({
                    Attributes: {
                        ...mockUser,
                        attractiveness: 5,
                    }
                }),
            }) as unknown as AWS.Request<DynamoDB.DocumentClient.UpdateItemOutput, AWS.AWSError>);

            const result = await userService.setAttractiveness('user123', 5);

            expect(result).toEqual({
                ...mockUser,
                attractiveness: 5,
            });
            expect(updateSpy).toHaveBeenCalled();
        });
    });
});
