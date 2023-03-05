import { Auth } from '../../libs/auth';
import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import { IFilter } from 'src/interfaces/IFilter';
import { userService } from "../../services/index";
import { GetProfileRequest } from './schema';

const getProfileHandler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
  try {
    await Auth.verifyToken(event.headers['token']);

    const validated = GetProfileRequest.safeParse(event.queryStringParameters);
    if (validated.success === false) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: validated.error }),
      };
    }
    const { user_id, prefer, age_from, age_to, sort_by } = event.queryStringParameters;

    const user = await userService.getProfileById(user_id);
    if(!user){
      throw new Error('user not found');
    }
    // 
    const filter: IFilter = {
      prefer,
      age_from,
      age_to,
      sort_by,
    };
    const result = await userService.getProfiles(user_id, filter, { latitude: user.location.latitude, longitude: user.location.longitude });


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
    return {
      statusCode: 500,
      body: JSON.stringify({ message: `An error occurred: ${error.message}` }),
    };
  }
};



export const main = getProfileHandler;
