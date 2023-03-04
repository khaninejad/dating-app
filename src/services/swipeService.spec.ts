
import { DynamoDB } from 'aws-sdk';

import SwipeService from './swipeService';
import UserService, { IUserService } from './userService';

const mockUser: any = {
    id: 'user_id_1',
    name: 'Test User',
    age: 25,
    gender: 'male',
    preference: 'female',
    recent_activity: new Date().toISOString(),
    attractiveness: 0,
};

const mockSwipe: any = {
    user_id: 'user_id_1',
    profile_id: 'profile_id_1',
    preference: 'like',
};

jest.mock('uuid', () => ({
    v4: jest.fn().mockReturnValue('1234')
}));

describe('SwipeService', () => {
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
                    Items: [{ profile_id: 'profile_id_1' }, { profile_id: 'profile_id_2' }],
                }),
            }),
            get: jest.fn().mockReturnValue({
                promise: jest.fn().mockResolvedValue({
                    Item: mockSwipe,
                }),
            }),
            update: jest.fn().mockReturnValue({
                promise: jest.fn().mockResolvedValue({
                    Item: mockUser,
                }),
            }),
        } as unknown as DynamoDB.DocumentClient;
        userService = new UserService(mockDocumentClient, {} as any);
        swipeService = new SwipeService(mockDocumentClient, userService);
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    it('should create a swipe', async () => {
        const putSpy = jest.spyOn(mockDocumentClient, 'put');

        await swipeService.createSwipe(mockSwipe);

        expect(putSpy).toHaveBeenCalledWith({
            TableName: 'SWIPE_TABLE7',
            Item: expect.objectContaining({
                id: '1234',
                user_id: 'user_id_1',
                profile_id: 'profile_id_1',
                preference: 'like',
            }),
        });
    });

    describe('getUserSwipedProfiles', () => {
        it('should get profiles swiped by user', async () => {
            const scanSpy = jest.spyOn(mockDocumentClient, 'scan');

            const profiles = await swipeService.getUserSwipedProfiles('user_id_1');

            expect(scanSpy).toHaveBeenCalledWith({
                TableName: 'SWIPE_TABLE7',
                FilterExpression: 'user_id = :user_id AND attribute_not_exists(swipe_timestamp)',
                ExpressionAttributeValues: {
                    ':user_id': 'user_id_1',
                },
                ProjectionExpression: 'profile_id',
            });
            expect(profiles).toEqual(['profile_id_1', 'profile_id_2']);
        });
    });

    describe('getMatchCounts', () => {
        it('should return the number of profiles swiped with positive match', () => {
            const swipedProfiles = [{ Item: { preference: 'NO' } }, { Item: { preference: 'YES' } }, { Item: { preference: 'YES' } }, { Item: { preference: 'NO' } }, { Item: { preference: 'YES' } },];

            const positiveMatchCount = swipeService.calculatePositiveMatch(swipedProfiles);

            expect(positiveMatchCount).toEqual(3);
        });
        it('should return correct match counts', async () => {
            const scanSpy = jest.spyOn(swipeService, 'getUserSwipedProfiles').mockResolvedValue([
                { user_id: 'user_id_1', preference: 'YES', profile_id: 'profile_id_2' },
                { user_id: 'profile_id_2', preference: 'YES', profile_id: 'user_id_1' },
                { user_id: 'user_id_1', preference: 'NO', profile_id: 'profile_id_3' },
                { user_id: 'user_id_3', preference: 'YES', profile_id: 'profile_id_1' },
                { user_id: 'user_id_3', preference: 'YES', profile_id: 'profile_id_2' },
            ]);

            jest.spyOn(swipeService, 'calculatePositiveMatch').mockReturnValue(10);

            const result = await swipeService.getMatchCounts('user_id_1');

            expect(scanSpy).toHaveBeenCalledWith('user_id_1');

            expect(result).toEqual({ positive_match: 10, total_swipe: 5 });
        });
    });

    describe('calculateAttractiveness', () => {
        it('should calculate user attractiveness and set it via userService', async () => {
            const user_id = 'user_id_1';
            const user_attractiveness = 0.8;
            const calculateAttractivenessRateSpy = jest.spyOn(swipeService, 'calculateAttractivenessRate').mockResolvedValue(user_attractiveness);
            const setAttractivenessSpy = jest.spyOn(userService, 'setAttractiveness').mockResolvedValue(undefined);

            await swipeService.calculateAttractiveness(user_id);

            expect(calculateAttractivenessRateSpy).toHaveBeenCalledWith(user_id);
            expect(setAttractivenessSpy).toHaveBeenCalledWith(user_id, user_attractiveness);
        });

        it('should calculate attractiveness rate correctly', async () => {
            const mockUser = {
                recent_activity: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
            };

            jest.spyOn(userService, 'getProfileById').mockResolvedValueOnce(mockUser);

            jest.spyOn(swipeService, 'getMatchCounts').mockResolvedValueOnce({
                positive_match: 10,
                total_swipe: 20,
            });

            const attractivenessRate = await swipeService.calculateAttractivenessRate('123');

            expect(attractivenessRate.toFixed(2)).toBe('40.33');
        });
    });

});
