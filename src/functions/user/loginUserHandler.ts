import { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import {userService} from "../../services/index";
import { loginUserSchema } from './schema';
import {Md5} from 'ts-md5';

const loginUserHandler: ValidatedEventAPIGatewayProxyEvent<typeof loginUserSchema> = async (event) => {
  try {
    const user = await userService.loginUser(event.body.email, Md5.hashStr(event.body.password));
    const token = await userService.setToken(user.id);
    return {
      statusCode: 200,
      body: JSON.stringify(token),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: `An error occurred: ${error.message}` }),
    };
  }
};

export const main = middyfy(loginUserHandler);
