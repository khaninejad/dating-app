import configuration from '../config/config';
import { DynamoDB } from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import { UserSwipeDto } from '@functions/swipe/schema';
import { IUserService } from './userService';

//todo: resolve any reponses 
export interface ISwipeService {
  createSwipe(swipe: UserSwipeDto): Promise<void>
  getUserSwipedProfiles(user_id: string): Promise<any[]>
  getMatchCounts(user_id: string): Promise<any>
  calculateAttractiveness(user_id: string): Promise<void>
}
export default class SwipeService implements ISwipeService {
  constructor(private client: DynamoDB.DocumentClient, private userService: IUserService) {
  }

  async createSwipe(swipe: UserSwipeDto) {
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

  

  async calculateAttractiveness(user_id: string): Promise<void> {
    const user_attractiveness = await this.calculateAttractivenessRate(user_id);
    await this.userService.setAttractiveness(user_id, user_attractiveness);
  }

  private async calculateAttractivenessRate(user_id: string): Promise<number> {
    const recent_activity = await (await this.userService.getProfileById(user_id)).recent_activity;
    const swipe_stats = await this.getMatchCounts(user_id);
    let recencyScore = (Date.now() - new Date(recent_activity).getTime()) / (1000 * 60 * 60 * 24 * 30); // Score based on how recently the user swiped.
    recencyScore = isNaN(recencyScore) ? 0 : recencyScore
    const positiveSwipeScore = swipe_stats.positive_match * 2; // Each positive swipe is worth 2 points.
    const totalSwipeScore = swipe_stats.total_swipe; // Each swipe is worth 1 point.
    const attractivenessScore = recencyScore + positiveSwipeScore + totalSwipeScore;
    return attractivenessScore;
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
    const swipedProfiles = await Promise.all(swipedProfileIds.map(async (profile_id) => {
      const profile = await this.userService.getProfileById(profile_id);
      return profile;
    }));
    let positive_match = 0;
    swipedProfiles.forEach((profile) => {
      const profilePreference = profile.Item?.preference ?? 'NO';
      if (profilePreference === 'YES') {
        positive_match++;
      }
    });

    const res = {
      total_swipe: isNaN(swipedProfileIds.length) ? 0 : swipedProfileIds.length,
      positive_match: isNaN(positive_match) ? 0 : positive_match,
    };
    return res;
  }

}