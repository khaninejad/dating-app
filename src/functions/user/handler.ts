import { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import {userService} from "../../services/index";
import { v4 as uuidv4 } from 'uuid';
import schema from './schema';


const createUserHandler: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
  try {

    //todo: create a dto
    const user = {
      id: uuidv4(),
      email: event.body.email,
      password: event.body.password, //todo: encrypt it
      name: event.body.name,
      gender: event.body.gender,
      birth_date: event.body.birth_date,
    };

    await userService.createUser(user);

    return {
      statusCode: 200,
      body: JSON.stringify(user),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: `An error occurred: ${error.message}` }),
    };
  }
};

export const main = middyfy(createUserHandler);
