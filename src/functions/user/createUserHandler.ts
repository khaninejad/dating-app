import { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import {userService} from "../../services/index";
import { v4 as uuidv4 } from 'uuid';
import { createUserSchema } from './schema';
import { faker } from '@faker-js/faker';
import {Md5} from 'ts-md5';
import { IUser } from 'src/interfaces/IUser';



const createUserHandler: ValidatedEventAPIGatewayProxyEvent<typeof createUserSchema> = async (event) => {
  try {
    let user = {} as IUser;
    if(event.body.random){
      user = {
        id: uuidv4(),
        email: faker.internet.email(),
        password: Md5.hashStr(faker.internet.password()),
        name: faker.name.fullName(),
        gender: faker.name.sexType(),
        birth_date: faker.date.birthdate().toISOString(),
        location: {longitude: parseFloat(faker.address.longitude()), latitude: parseFloat(faker.address.latitude()) }
      };
    } else{
      user = {
        id: uuidv4(),
        email: event.body.email,
        password: Md5.hashStr(event.body.password),
        name: event.body.name,
        gender: event.body.gender,
        birth_date: new Date(event.body.birth_date).toISOString(),
        location: {longitude: event.body.longitude, latitude: event.body.latitude}
      };
    }
    

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
