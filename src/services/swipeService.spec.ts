import { UserSwipeDto } from '@functions/swipe/schema';
import { DynamoDB } from 'aws-sdk';
import SwipeService from './swipeService';
import UserService from './userService';

describe('SwipeService', () => {
    let swipeService: SwipeService;
    let mockDocumentClient: DynamoDB.DocumentClient;

    beforeEach(() => {
        mockDocumentClient = {
            put: jest.fn().mockReturnValue({
                promise: jest.fn(),
            }),
        } as unknown as DynamoDB.DocumentClient;
        swipeService = new SwipeService(mockDocumentClient, new UserService(mockDocumentClient,  {} as any));
    });

    afterEach(() => {
    });

    it('should create a swipe', async () => {
        const swipe = {
            user_id: 'user1',
            profile_id: 'profile1',
            preference: 'like',
        } as UserSwipeDto;


        await swipeService.createSwipe(swipe);

        expect(mockDocumentClient.put).toHaveBeenCalledWith({
            TableName: 'SWIPE_TABLE7',
            Item: expect.objectContaining({
                id: expect.any(String),
                user_id: 'user1',
                profile_id: 'profile1',
                preference: 'like',
                timestamp: expect.any(String),
            }),
        });
    });
});
