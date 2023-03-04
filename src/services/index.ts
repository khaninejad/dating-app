import UserService from "./userService";
import { DynamoDB } from 'aws-sdk';
import SwipeService from "./swipeService";


const client = new DynamoDB.DocumentClient();
export const userService = new UserService(client, new SwipeService(client, {} as any));

export const  swipeService = new SwipeService(client, new UserService(client,  {} as any));