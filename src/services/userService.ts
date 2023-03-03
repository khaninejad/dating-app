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

  async getProfiles(user_id: string, filter?: IFilter, location?: { latitude: number; longitude: number }) {
    const profileIdsToExclude = await this.getUserSwipedProfiles(user_id);

    console.log(`filter = ${JSON.stringify(filter)}`);

    const params: DynamoDB.DocumentClient.ScanInput = {
      TableName: configuration().user_table,
    };

    const expressionAttributeValues = {};
    let filterExpression = '';

    if (filter) {
      if (filter.prefer) {
        filterExpression = 'gender = :gender';
        expressionAttributeValues[':gender'] = filter.prefer;
      }

      if (filter.age_from && filter.age_to) {
        filterExpression += `${filterExpression ? ' AND ' : ''}birth_date BETWEEN :age_from AND :age_to`;
        expressionAttributeValues[':age_from'] = filter.age_from;
        expressionAttributeValues[':age_to'] = filter.age_to;
      }
    }

    if (filterExpression) {
      params.FilterExpression = filterExpression;
      params.ExpressionAttributeValues = expressionAttributeValues;
    }

    const result = await this.client.scan(params).promise();

    const filteredResult = result.Items?.filter((item) => {
      // Exclude profiles already swiped by user, this can be done by query NOT IN(ids) as well
      return !profileIdsToExclude.includes(item.id);
    });

    if (location) {
      filteredResult.sort((a, b) => {
        const distanceA = this.haversine(location.latitude, location.longitude, a.location.latitude, a.location.longitude);
        const distanceB = this.haversine(location.latitude, location.longitude, b.location.latitude, b.location.longitude);
        return distanceA - distanceB;
      });
    }

    const sortedProfiles = filteredResult?.sort((a, b) => {
      return a.attractivenes - b.attractivenes;
    });

    return sortedProfiles;
  }

  private haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
      + Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2))
      * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
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

  async getMatchCounts(user_id: string): Promise<any> {
    const swipedProfileIds = await this.getUserSwipedProfiles(user_id);
    // get the profiles that the user has swiped on
    const swipedProfiles = await Promise.all(swipedProfileIds.map(async (profile_id) => {
      const profile = await this.getProfileById(profile_id);
      return profile;
    }));
    let positive_match = 0;
    swipedProfiles.forEach((profile) => {
      const profilePreference = profile.Item.preference;
      if (profilePreference === 'YES') {
        positive_match++;
      }
    });

    const res = {
      total_swipe: isNaN(swipedProfileIds.length)?0:swipedProfileIds.length,
      positive_match: isNaN(positive_match)?0:positive_match,
    };
    return res;
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
          "set #authToken = :authToken, #recent_activity = :recent_activity",
        ExpressionAttributeNames: {
          "#authToken": "authToken",
          "#recent_activity": "recent_activity",
        },
        ExpressionAttributeValues: {
          ":authToken": this.generateRandomString(30),
          ":recent_activity": new Date().toISOString(),
        },
        ReturnValues: "ALL_NEW",
      })
      .promise();

    return updated.Attributes as IUser;
  }
  private generateRandomString(length: number): string {
    const possibleChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let randomString = '';
    for (let i = 0; i < length; i++) {
      randomString += possibleChars.charAt(Math.floor(Math.random() * possibleChars.length));
    }
    return randomString;
  }

  async verifyUserToken(authToken: string) {
    const params: DynamoDB.DocumentClient.ScanInput = {
      TableName: configuration().user_table,
      FilterExpression: 'authToken = :authToken AND attribute_not_exists(swipe_timestamp)',
      ExpressionAttributeValues: {
        ':authToken': authToken
      },
      ProjectionExpression: 'id',
    };

    const result = await this.client.scan(params).promise();
    if (result.Count) {
      return result.Items[0];
    }

    throw new Error('invalid email or password');
  }
  async setAttractiveness(user_id: number, user_attractivenes: number) {
    const updated = await this.client
    .update({
      TableName: configuration().user_table,
      Key: { id: user_id },
      UpdateExpression:
        "set #attractivenes = :attractivenes",
      ExpressionAttributeNames: {
        "#attractivenes": "attractivenes",
      },
      ExpressionAttributeValues: {
        ":attractivenes": `${user_attractivenes}`,
      },
      ReturnValues: "ALL_NEW",
    })
    .promise();

  return updated.Attributes as IUser;
  }
}