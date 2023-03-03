import { APIGatewayProxyEvent } from "aws-lambda";
import { Md5 } from "ts-md5";
import { main } from "./loginUserHandler";

jest.mock('../../services/index', () => ({
    userService: {
        loginUser: jest.fn(),
        setToken: jest.fn(),
    },
}));

jest.mock("../../services");

describe("loginUserHandler", () => {
    const user = {
        id: "123",
        email: "test@example.com",
        password: Md5.hashStr("password123")
    };

    it("returns a successful response with token", async () => {
        const event = {
            body: JSON.stringify({
                email: user.email,
                password: "password123"
            })
        } as Omit<APIGatewayProxyEvent, "body"> & { body: any; rawBody: string; };

        const mockUser = { id: 1 };
        const mockToken = 'mock_token';

        const { userService } = require('../../services/index');
        userService.loginUser.mockResolvedValue(mockUser);
        userService.setToken.mockResolvedValue(mockToken);

        const response = await main(event);

        expect(response.statusCode).toBe(200);
        expect(response.body).toBe(JSON.stringify(mockToken));
    });

    it("returns a 500 error if there is an error logging in the user", async () => {
        const event = {
            body: JSON.stringify({
                email: user.email,
                password: "password123"
            })
        } as Omit<APIGatewayProxyEvent, "body"> & { body: any; rawBody: string; };

        const errorMessage = 'Error logging in user';
        const { userService } = require('../../services/index');
        userService.loginUser.mockRejectedValue(new Error(errorMessage));

        const response = await main(event);

        expect(response.statusCode).toBe(500);
        expect(response.body).toBe(JSON.stringify({ message: `An error occurred: ${errorMessage}` }));
    });

    it('should return an error if validation fails', async () => {
        const eventWithError = {
          body: JSON.stringify({
            email: 'invalid-email',
            password: undefined,
          }),
        } as any;
    
        const response = await main(eventWithError);
    
        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual(JSON.stringify({
            message: {
              issues: [
                {
                  code: 'invalid_type',
                  expected: 'string',
                  received: 'undefined',
                  path: ['password'],
                  message: 'Required',
                },
              ],
              name: 'ZodError',
            },
          }));
      });
    

});