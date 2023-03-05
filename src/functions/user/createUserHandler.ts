
import { userService } from "../../services/index";
import { v4 as uuidv4 } from 'uuid';
import { faker } from '@faker-js/faker';
import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import { Md5 } from 'ts-md5';
import { IUser } from 'src/interfaces/IUser';
import * as z from 'zod';
import { UserCreateRequest } from './schema';

export type CommandRequest = z.infer<typeof UserCreateRequest>;

const createUserHandler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
  try {
    const params = JSON.parse(event.body);
    let user = {} as IUser;
    if (!params.random) {
      const validated = UserCreateRequest.safeParse(params);

      if (validated.success === false) {
        return {
          statusCode: 400,
          body: JSON.stringify({ message: validated.error }),
        };
      }

      user = {
        id: uuidv4(),
        email: params.email,
        password: Md5.hashStr(params.password),
        name: params.name,
        gender: params.gender,
        birth_date: new Date(params.birth_date).toISOString(),
        location: { longitude: params.longitude, latitude: params.latitude },
        authToken: '',
        attractiveness: 0,
        recent_activity: new Date().toISOString(),
      };
    } else {
      user = generateRandomProfile();
    }
    await userService.createUser(user);

    return {
      statusCode: 200,
      body: JSON.stringify(user),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: `An error occurred: ${error.message}` }),
    };
  }
};

function generateRandomProfile(): IUser {
  return {
    id: uuidv4(),
    email: faker.internet.email(),
    password: Md5.hashStr(faker.internet.password()),
    name: faker.name.fullName(),
    gender: faker.name.sexType(),
    birth_date: faker.date.birthdate().toISOString(),
    location: { longitude: parseFloat(faker.address.longitude()), latitude: parseFloat(faker.address.latitude()) },
    authToken: '',
    attractiveness: 0,
    recent_activity: new Date().toISOString(),
  };
}

export const main = createUserHandler;

