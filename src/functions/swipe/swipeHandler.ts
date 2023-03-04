import { swipeService, userService } from "../../services/index";
import { Auth } from '../../libs/auth';
import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import { UserSwipeRequest } from './schema';

const swipeHandler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
  try {

    await Auth.verifyToken(event.headers['token']);

    const params = JSON.parse(event.body);

    const validated = UserSwipeRequest.safeParse(params);

    if (validated.success === false) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: validated.error }),
      };
    }

    swipeService.createSwipe(params);


    let isMatch = false;

    if (params.preference === 'YES') {
      const swipedProfile = await userService.getUserSwipedProfilesInfos(params.profile_id);
      const filtered = swipedProfile.filter((user) => user.profile_id === params.user_id && user.preference === 'YES');

      if (filtered.length > 0) {
        isMatch = true;
      }
    }

    await Promise.all([
      swipeService.calculateAttractiveness(params.user_id),
      swipeService.calculateAttractiveness(params.profile_id),
    ]);

    const response = {
      statusCode: 200,
      body: JSON.stringify({
        isMatch,
      }),
    };

    return response;
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: `An error occurred: ${error.message}` }),
    };
  }


};

export const main = swipeHandler;
