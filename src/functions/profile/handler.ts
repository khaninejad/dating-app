import { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { DynamoDB } from 'aws-sdk';
import schema from './schema';
import configuration from '../../config/config';

const dynamoDb = new DynamoDB.DocumentClient();

const getProfileHandler: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
  try {

    const userId = event.queryStringParameters.user_id;

    const result = await dynamoDb.scan({
      TableName: configuration().user_table,
    }).promise();

    const profiles = result.Items.map((item) => ({
      id: item.id,
      name: item.name,
      gender: item.gender,
      age: item.age,
    }));
    return {
      statusCode: 200,
      body: JSON.stringify(profiles),
    };

  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: `An error occurred: ${error.message}` }),
    };
  }
};



export const main = middyfy(getProfileHandler);
