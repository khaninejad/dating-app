import configuration from '../config/config';
import { config as AWSConfig, DynamoDB } from 'aws-sdk';
import { IFilter } from 'src/interfaces/IFilter';
import { IUser } from 'src/interfaces/IUser';
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

  async loginUser(email: string, password: string) {
    const params: DynamoDB.DocumentClient.ScanInput = {
      TableName: configuration().user_table,
      FilterExpression: 'email = :email AND password = :password AND attribute_not_exists(swipe_timestamp)',
      ExpressionAttributeValues: {
        ':email': email,
        ':password': password,
      },
      ProjectionExpression: 'id',
    };

    const result = await this.client.scan(params).promise();
    if (result.Count) {
      return result.Items[0];
    }

    throw new Error('invalid email or password');

  }

  async setToken(user_id: string) {
    const updated = await this.client
            .update({
                TableName: configuration().user_table,
                Key: { id: user_id },
                UpdateExpression:
                    "set #token = :token",
                ExpressionAttributeNames: {
                    "#token": "token",
                },
                ExpressionAttributeValues: {
                    ":token": this.generateRandomString(30),
                },
                ReturnValues: "ALL_NEW",
            })
            .promise();

        return updated.Attributes as IUser;
  }
  generateRandomString(length: number): string {
    const possibleChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let randomString = '';
    for (let i = 0; i < length; i++) {
      randomString += possibleChars.charAt(Math.floor(Math.random() * possibleChars.length));
    }
    return randomString;
  }
}