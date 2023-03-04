
import { userService } from "../../services/index";
import { Md5 } from 'ts-md5';
import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import { UserLoginRequest } from "./schema";
import * as z from 'zod';

export type CommandRequest = z.infer<typeof UserLoginRequest>;
const loginUserHandler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {

  try {

    const params = JSON.parse(event.body);
    const validated = UserLoginRequest.safeParse(params);
    if (validated.success === false) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: validated.error }),
      };
    }

    const user = await userService.loginUser(params.email, Md5.hashStr(params.password));
    const token = await userService.setToken(user.id);
    return {
      statusCode: 200,
      body: JSON.stringify(token),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: `An error occurred: ${error.message}` }),
    };
  }
};

export const main = loginUserHandler;
