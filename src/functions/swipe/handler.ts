import { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { DynamoDB } from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import schema from './schema';
import configuration from '../../config/config';
import {userService, swipeService} from "../../services/index";

const dynamoDb = new DynamoDB.DocumentClient();

const swipeHandler: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
  try {

    const getUserParams = {
      TableName: configuration().user_table,
      Key: {
        id: event.body.user_id,
      },
    };

    const getProfileParams = {
      TableName: configuration().user_table,
      Key: {
        id: event.body.profile_id,
      },
    };

    const [userResult, profileResult] = await Promise.all([
      dynamoDb.get(getUserParams).promise(),
      dynamoDb.get(getProfileParams).promise(),
    ]);

    if (!userResult.Item || !profileResult.Item) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          message: 'User or profile not found',
        }),
      };
    }

    swipeService.createSwipe(event.body);


    let isMatch = false;

    if (event.body.preference === 'YES') {
      const getSwipesParams = {
        TableName: process.env.DYNAMODB_TABLE || 'SWIPE_TABLE6',
        IndexName: 'ProfileIndex',
        KeyConditionExpression: 'user_id = :user_id',
        ExpressionAttributeValues: {
          ':user_id': event.body.profile_id,
        },
      };

      const swipesResult = await dynamoDb.query(getSwipesParams).promise();

      const profileSwipes = swipesResult.Items?.filter(
        (swipe) => swipe.preference === 'YES'
      );

      console.log(profileSwipes);

      if (profileSwipes) {
        const hasMatch = profileSwipes.some((swipe) => swipe.user_id === event.body.profile_id);
        if (hasMatch) {
          isMatch = true;
        }
      }
    }

    const response = {
      statusCode: 200,
      body: JSON.stringify({
        isMatch,
      }),
    };

    return response;
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: `An error occurred: ${error.message}` }),
    };
  }
};



export const main = middyfy(swipeHandler);
