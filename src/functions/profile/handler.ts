import { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import {userService} from "../../services/index";
import schema from './schema';

const getProfileHandler: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
  try {


    const result = await userService.getProfiles();

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
