import { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { IFilter } from 'src/interfaces/IFilter';
import {userService} from "../../services/index";
import schema from './schema';

const getProfileHandler: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
  try {

    const user = await userService.getProfileById(event.queryStringParameters.user_id);
    // 
    const filter: IFilter = { prefer: user.Item.prefer };
    const result = await userService.getProfiles(event.queryStringParameters.user_id, filter);


    const profiles = result.map((item) => ({
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
