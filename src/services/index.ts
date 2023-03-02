import UserService from "./userService";
import { DynamoDB } from 'aws-sdk';
import SwipeService from "./swipeService";


const client = new DynamoDB.DocumentClient();
export const userService = new UserService(client);

export const  swipeService = new SwipeService(client);