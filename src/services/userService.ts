import configuration from '../config/config';
import { config as AWSConfig, DynamoDB } from 'aws-sdk';
import { IFilter } from 'src/interfaces/IFilter';
// AWSConfig.logger = console;

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

    async getProfiles(user_id: string, filter?: IFilter) {
        const profileIdsToExclude = await this.getUserSwipedProfiles(user_id);
      
        const params: DynamoDB.DocumentClient.ScanInput = {
          TableName: configuration().user_table,
        };
      
        if (filter && filter.prefer) {
          params.FilterExpression = 'gender = :gender';
          params.ExpressionAttributeValues = {
            ':gender': filter.prefer,
          };
        }
      
        const result = await this.client.scan(params).promise();
      
        const filteredResult = result.Items?.filter((item) => {
          // Exclude profiles already swiped by user, this can be done by query NOT IN(ids) as well
          return !profileIdsToExclude.includes(item.id);
        });
      
      
        return filteredResult;
      }
      

    async getProfileById(user_id: string) {
        return await this.client.get({
            TableName: configuration().user_table,
            Key: {
                id: user_id
            }
        }).promise();
    }

    async getUserSwipedProfiles(user_id: string) {
        const params: DynamoDB.DocumentClient.ScanInput = {
            TableName: configuration().swipe_table,
            FilterExpression: 'user_id = :user_id AND attribute_not_exists(swipe_timestamp)',
            ExpressionAttributeValues: {
                ':user_id': user_id,
            },
            ProjectionExpression: 'profile_id',
        };

        const result = await this.client.scan(params).promise();
        return result.Items.map((item) => item.profile_id);
    }
}