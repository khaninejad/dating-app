import configuration from '../config/config';
import { DynamoDB } from 'aws-sdk';
import { IFilter } from 'src/interfaces/IFilter';

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

    async getProfiles(filter?: IFilter) {
        const params: DynamoDB.DocumentClient.ScanInput = {
            TableName: configuration().user_table,
        };

        if (filter && filter.prefer) {
            const ExpressionAttributeNames: DynamoDB.DocumentClient.ExpressionAttributeNameMap = {
                '#gender': 'gender',
            };

            const ExpressionAttributeValues: DynamoDB.DocumentClient.ExpressionAttributeValueMap = {
                ':gender': filter.prefer,
            };

            const FilterExpression = '#gender = :gender';

            params.ExpressionAttributeValues = ExpressionAttributeValues;
            params.ExpressionAttributeNames = ExpressionAttributeNames;
            params.FilterExpression = FilterExpression;

            console.log('Filter criteria:', filter);
        }

        return await this.client.scan(params).promise();
    }

    async getProfilesById(user_id: string) {
        return await this.client.get({
            TableName: configuration().user_table,
            Key: {
                id: user_id
            }
        }).promise();
    }
}