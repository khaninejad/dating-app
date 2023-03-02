import configuration from '../config/config';
import { DynamoDB } from 'aws-sdk';

export default class UserService {
    constructor(private client: DynamoDB.DocumentClient) {
    }

    async createUser(user: any) {
        const params = {
            TableName: configuration().user_table,
            Item: user,
        };

        await this.client.put(params).promise();
    }
    async getProfiles() {
        return await this.client.scan({
            TableName: configuration().user_table,
          }).promise();
    }
}