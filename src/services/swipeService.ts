import configuration from '../config/config';
import { DynamoDB } from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

export default class SwipeService {
    constructor(private client: DynamoDB.DocumentClient) {
    }

    async createSwipe(swipe: any) {
        const swipeId = uuidv4();

        const swipeParams = {
          TableName: configuration().swipe_table,
          Item: {
            id: swipeId,
            user_id: swipe.user_id,
            profile_id: swipe.profile_id,
            preference: swipe.preference,
            timestamp: new Date().toISOString(),
          },
        };
    
        await this.client.put(swipeParams).promise();
    }

}